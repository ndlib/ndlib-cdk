/**
 * Handles a webhook from GitHub and triggers pipelines based on committed files
 * Portions nabbed from: https://github.com/serverless/examples/tree/master/aws-node-github-webhook-listener
 */
const crypto = require('crypto');
const multimatch = require('multimatch');
const { CodePipelineClient, StartPipelineExecutionCommand } = require('@aws-sdk/client-codepipeline');
const { SSMClient, GetParameterCommand, GetParametersByPathCommand } = require('@aws-sdk/client-ssm');
const codePipelineClient = new CodePipelineClient({ region: 'us-east-1' });
const ssmClient = new SSMClient({ region: 'us-east-1' });

// This matches the signing algorithm github webhooks use so we can compare the signature and verify it matches
const signRequestBody = (key, body) => {
  return `sha1=${crypto
    .createHmac('sha1', key)
    .update(body, 'utf-8')
    .digest('hex')}`;
};

module.exports.handler = async (event, context, callback) => {
  let errMsg;

  const headers = event.headers;
  const sig = headers['X-Hub-Signature'];
  const githubEvent = headers['X-GitHub-Event'];
  const id = headers['X-GitHub-Delivery'];
  const triggerParamsPath = process.env.TRIGGER_PARAMS_PATH;

  const calculatedSig = signRequestBody(process.env.WEBHOOK_SECRET, event.body);

  if (!sig) {
    errMsg = 'No X-Hub-Signature found on request';
  } else if (!githubEvent) {
    errMsg = 'No X-GitHub-Event found on request';
  } else if (!id) {
    errMsg = 'No X-GitHub-Delivery found on request';
  } else if (sig !== calculatedSig) {
    errMsg = "X-Hub-Signature incorrect. Github webhook token doesn't match";
  }

  if (errMsg) {
    return callback(null, {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: errMsg,
    });
  }

  let triggerParams = [];
  try {
    triggerParams = await getAllParametersByPath(triggerParamsPath);
  } catch (error) {
    console.error(error);
    errMsg = 'Failed to retrieve pipeline trigger parameter(s).';
  }

  if (!errMsg && !triggerParams.length) {
    errMsg = `No parameters found matching path: ${triggerParamsPath}`;
  }

  if (errMsg) {
    return callback(null, {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: errMsg,
    });
  }

  // Now lookup the pipeline name so we can finalize the information about which patterns trigger which pipeline
  console.log('Retrieved params:', JSON.stringify(triggerParams, null, 2));
  const promiseResults = await Promise.allSettled(
    triggerParams.map(async param => {
      // Pipeline stack name is the last segment of the parameter path
      const splitPath = param.Name.split('/');
      const pipelineStackName = splitPath[splitPath.length - 1];
      const pipelineParamPath = `/all/stacks/${pipelineStackName}/pipeline-name`;
      try {
        const response = await ssmClient.send(
          new GetParameterCommand({
            Name: pipelineParamPath,
          }),
        );
        return {
          pipelineName: response.Parameter.Value,
          patterns: param.Value.split(','),
        };
      } catch (error) {
        const msg = `Unable to find parameter: ${pipelineParamPath}. Pipeline stack may not exist.`;
        console.warn(msg);
        return Promise.reject(msg);
        // We DON'T want to return after this error. If one or more pipelines do not exist, that's fine;
        // just continue on and check all of them as there may be some that we still need to trigger.
      }
    }),
  );
  // Filter out parameters that weren't found and just grab the value objects to form an array of triggers
  const pipelineTriggers = promiseResults.filter(promise => promise.status === 'fulfilled').map(result => result.value);

  console.log('---------------------------------');
  console.log(`Github-Event: "${githubEvent}"`);
  console.log('---------------------------------');
  console.log('Payload', event.body);

  if (githubEvent === 'ping') {
    // Ping is sent when setting up the webhook. We don't need to trigger any pipelines for this event,
    // but return a 200 so it shows that the setup was successful and the secret matches.
    console.log('Successfully set up webhook.');
    return callback(null, {
      statusCode: 200,
      body: '',
    });
  } else if (githubEvent !== 'push') {
    // Webhook should only be set to send push events. Send an error for unhandled event types.
    errMsg = `Invalid event type "${githubEvent}". Webhook should be set to only send "push" events.`;
    return callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: errMsg,
    });
  } else {
    // githubEvent === 'push'
    const body = JSON.parse(event.body);
    const refSplit = body.ref.split('/');
    const repoBranch = refSplit.length > 1 ? refSplit[refSplit.length - 1] : null;
    const repo = body.repository.full_name;

    // If the event did not go to the tracked repo or branch, ignore it.
    if (!repo || repo !== process.env.GIT_REPO || !repoBranch || repoBranch !== process.env.GIT_BRANCH) {
      return callback(null, {
        statusCode: 204,
        headers: { 'Content-Type': 'text/plain' },
        body: `Ignored event on untracked branch "${repoBranch}" of ${repo}`,
      });
    }

    let committedFiles = [];

    // Search through the commits and add all changed files to the diff list
    body.commits.forEach(commit => {
      // Only add the files which have not already been added to the list
      committedFiles = committedFiles.concat(commit.added.filter(file => !committedFiles.includes(file)));
      committedFiles = committedFiles.concat(commit.removed.filter(file => !committedFiles.includes(file)));
      committedFiles = committedFiles.concat(commit.modified.filter(file => !committedFiles.includes(file)));
    });

    const executionResults = await Promise.allSettled(
      pipelineTriggers.map(async trigger => {
        const matched = multimatch(committedFiles, trigger.patterns);
        if (matched.length > 0) {
          try {
            const command = new StartPipelineExecutionCommand({ name: trigger.pipelineName });
            await codePipelineClient.send(command);
            return Promise.resolve(trigger.pipelineName);
          } catch (error) {
            console.warn(error);
            console.warn(`Unable to execute pipeline "${trigger.pipelineName}". Check if pipeline exists.`);
            return Promise.reject(trigger.pipelineName);
          }
        }
      }),
    );

    const successful = executionResults.filter(promise => promise.status === 'fulfilled');
    const failed = executionResults.filter(promise => promise.status === 'rejected');
    return callback(null, {
      statusCode: failed.length ? 500 : 200,
      body: JSON.stringify({
        triggered: successful.map(promise => promise.value).filter(value => !!value),
        failed: failed.map(promise => promise.reason),
      }),
    });
  }
};

const getAllParametersByPath = async pathHierarchy => {
  const getParamsInternal = async (path, arr, nextToken) => {
    let output = arr || [];
    const command = new GetParametersByPathCommand({
      Path: path,
      MaxResults: 10, // 10 is currently the maximum allowed
      NextToken: nextToken,
      Recursive: true,
    });
    const response = await ssmClient.send(command);
    if (response.Parameters) {
      response.Parameters.forEach(param => {
        output.push(param);
      });
    }
    if (response.NextToken) {
      output = await getParamsInternal(path, output, response.NextToken);
    }
    return output;
  };

  return await getParamsInternal(pathHierarchy);
};
