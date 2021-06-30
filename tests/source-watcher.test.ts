import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';
import { SourceWatcher } from '../src';

describe('SourceWatcher', () => {
  const stack = new Stack();
  new SourceWatcher(stack, 'TestProject', {
    triggers: [
      {
        triggerPatterns: ['my/test/**/pattern.js', 'example/*.*'],
        pipelineStackName: 'pipeline-a',
      },
      {
        triggerPatterns: ['src/anotherExample.ts'],
        pipelineStackName: 'pipeline-b',
      },
    ],
    targetRepo: 'ndlib/myRepo',
    targetBranch: 'main',
    gitTokenPath: 'secret/path/here',
    webhookResourceStackName: 'aws-github-webhook',
  });

  test('creates a lambda function with expected props', () => {
    expectCDK(stack).to(
      haveResourceLike('AWS::Lambda::Function', {
        Environment: {
          Variables: {
            WEBHOOK_SECRET: '{{resolve:secretsmanager:secret/path/here:SecretString:webhook-secret::}}',
            TRIGGER_PARAMS_PATH: '/all/stacks/Default/triggers',
            GIT_REPO: 'ndlib/myRepo',
            GIT_BRANCH: 'main',
          },
        },
      }),
    );
  });

  test('creates ssm params for each trigger', () => {
    expectCDK(stack).to(
      haveResourceLike('AWS::SSM::Parameter', {
        Type: 'StringList',
        Name: '/all/stacks/Default/triggers/pipeline-a',
        Value: 'my/test/**/pattern.js,example/*.*',
      }),
    );

    expectCDK(stack).to(
      haveResourceLike('AWS::SSM::Parameter', {
        Type: 'StringList',
        Name: '/all/stacks/Default/triggers/pipeline-b',
        Value: 'src/anotherExample.ts',
      }),
    );
  });

  test('creates an api gateway', () => {
    expectCDK(stack).to(haveResourceLike('AWS::ApiGateway::RestApi'));
  });

  test('creates a custom resource for webhook', () => {
    expectCDK(stack).to(
      haveResourceLike('Custom::GitHubWebhook', {
        Repo: 'ndlib/myRepo',
        Events: 'push',
        Endpoint: {
          'Fn::Join': [
            '',
            [
              'https://',
              {
                Ref: 'TestProjectSourceWatcherApi255FBB19',
              },
              '.execute-api.',
              {
                Ref: 'AWS::Region',
              },
              '.',
              {
                Ref: 'AWS::URLSuffix',
              },
              '/',
              {
                Ref: 'TestProjectSourceWatcherApiDeploymentStageprodE0A8CDFE',
              },
              '/',
            ],
          ],
        },
      }),
    );
  });
});
