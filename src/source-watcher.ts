import { LambdaRestApi } from '@aws-cdk/aws-apigateway';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { StringListParameter } from '@aws-cdk/aws-ssm';
import * as cdk from '@aws-cdk/core';
import * as cr from '@aws-cdk/custom-resources';
import * as path from 'path';

export interface IPipelineTrigger {
  /**
   * List of file system glob patterns. If a commit changes any matching file, pipeline will be triggered.
   */
  readonly triggerPatterns: string[];

  /**
   * Name of the pipeline stack. Informs the lambda which pipeline to trigger when a matching change occurs.
   */
  readonly pipelineStackName: string;
}

export interface ISourceWatcherProps {
  /**
   * Used to configure the SourceWatcher with a file patterns and the appropriate pipelines that they should trigger.
   */
  readonly triggers: IPipelineTrigger[];

  /**
   * Name of repository to watch for changes. (Ex: "owner/my-repo-name")
   */
  readonly targetRepo: string;

  /**
   * Branch to watch for changes on. All other branches will be ignored and WON'T trigger pipeline execution.
   */
  readonly targetBranch: string;

  /**
   * SecretsManager path to secret with credentials for accessing the GitHub repo.
   */
  readonly gitTokenPath: string;

  /**
   * Stack name for aws-github-webhook. Needed in order to create a webhook on targetRepo.
   */
  readonly webhookResourceStackName: string;
}

export class SourceWatcher extends cdk.Construct {
  /**
   * The Lambda Function which handles a GitHub event payload and triggers a pipeline.
   */
  public readonly lambdaFunction: lambda.Function;

  /**
   * API which routes requests to the lambdaFunction.
   */
  public readonly api: LambdaRestApi;

  /**
   * Reference which will resolve to the ID of the webhook created on the GitHub repo.
   */
  public readonly webhookId: string;

  constructor(scope: cdk.Construct, id: string, props: ISourceWatcherProps) {
    super(scope, id);

    const stack = cdk.Stack.of(this);

    // Each trigger will create a StringList parameter in SSM. This way the lambda can get a dynamic list based on
    // the infrastructure instead of hardcoding in the lambda itself.
    const triggersSsmPath = `/all/stacks/${stack.stackName}/triggers`;
    props.triggers.forEach(trigger => {
      new StringListParameter(this, `TriggerParam_${trigger.pipelineStackName}`, {
        parameterName: `${triggersSsmPath}/${trigger.pipelineStackName}`,
        description: 'Glob patterns for file paths in the infrastructure repo which will trigger the pipeline.',
        stringListValue: trigger.triggerPatterns,
      });
    });

    // Get the secret which is used to validate the signature of the event payload
    const webhookSecret = cdk.SecretValue.secretsManager(props.gitTokenPath, { jsonField: 'webhook-secret' });

    this.lambdaFunction = new lambda.Function(this, 'SourceWatcherLambda', {
      code: lambda.Code.fromAsset(path.join(__dirname, './internal-lambdas/sourceWatcherLambda/src')),
      description: 'Checks if git push changed certain files and triggers pipeline(s) accordingly.',
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.minutes(1),
      environment: {
        WEBHOOK_SECRET: webhookSecret.toString(),
        TRIGGER_PARAMS_PATH: triggersSsmPath,
        GIT_REPO: props.targetRepo,
        GIT_BRANCH: props.targetBranch,
      },
    });
    // Allow lambda to read params we created specifying the trigger metadata.
    this.lambdaFunction.addToRolePolicy(
      new PolicyStatement({
        resources: [
          cdk.Fn.sub('arn:aws:ssm:${AWS::Region}:${AWS::AccountId}:parameter' + triggersSsmPath + '/*'),
        ].concat(
          props.triggers.map(trigger =>
            cdk.Fn.sub(
              'arn:aws:ssm:${AWS::Region}:${AWS::AccountId}:parameter/all/stacks/' +
                trigger.pipelineStackName +
                '/pipeline-name',
            ),
          ),
        ),
        actions: ['ssm:GetParameter', 'ssm:GetParameters'],
      }),
    );
    this.lambdaFunction.addToRolePolicy(
      new PolicyStatement({
        resources: [cdk.Fn.sub('arn:aws:ssm:${AWS::Region}:${AWS::AccountId}:parameter' + triggersSsmPath)],
        actions: ['ssm:GetParametersByPath'],
      }),
    );
    this.lambdaFunction.addToRolePolicy(
      new PolicyStatement({
        resources: ['*'],
        actions: ['codepipeline:StartPipelineExecution'],
      }),
    );

    // The API gateway will serve an endpoint which we can hit in a github webhook to trigger the lambda
    this.api = new LambdaRestApi(this, 'SourceWatcherApi', {
      handler: this.lambdaFunction,
      proxy: true,
    });

    // Finally, create the Webhook on GitHub to route push events to the API!
    const githubWebhookLambdaArn = cdk.Fn.importValue(`${props.webhookResourceStackName}:LambdaArn`);
    const webhookLambda = lambda.Function.fromFunctionArn(this, 'GithubWebhookLambda', githubWebhookLambdaArn);
    const resourceProvider = new cr.Provider(this, 'WebhookProvider', {
      onEventHandler: webhookLambda,
      logRetention: RetentionDays.ONE_WEEK,
    });
    const webhook = new cdk.CustomResource(this, 'GithubWebhook', {
      resourceType: 'Custom::GitHubWebhook',
      serviceToken: resourceProvider.serviceToken,
      properties: {
        Repo: props.targetRepo,
        Events: 'push',
        Endpoint: this.api.url,
      },
    });

    this.webhookId = webhook.getAtt('WebhookId').toString();

    new cdk.CfnOutput(this, 'WebhookId', {
      description: 'ID used by provider (GitHub) to identify the webhook.',
      value: this.webhookId,
    });
  }
}
