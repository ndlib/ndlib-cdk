import { beASupersetOfTemplate, expect, haveResourceLike } from '@aws-cdk/assert';
import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline';
import { FakeBuildAction } from './fake-build-action';
import { FakeSourceAction } from './fake-source-action';
import { Stack } from '@aws-cdk/core';
import { PipelineNotifications } from '../src/index';

// Helper for creating the pipeline
const fakePipeline = (stack: Stack) => {
  const sourceOutput = new Artifact();
  return new Pipeline(stack, 'Pipeline', {
    stages: [
      {
        stageName: 'Source',
        actions: [
          new FakeSourceAction({
            actionName: 'Source',
            output: sourceOutput,
          }),
        ],
      },
      {
        stageName: 'Build',
        actions: [
          new FakeBuildAction({
            actionName: 'Build',
            input: sourceOutput,
          }),
        ],
      },
    ],
  });
};

test('Creates execution state change rule', () => {
  const stack = new Stack();
  const pipeline = fakePipeline(stack);
  const notifications = new PipelineNotifications(stack, 'TestPipelineNotifications', {
    pipeline,
    receivers: 'testreceivers',
  });
  expect(stack).to(
    haveResourceLike('AWS::Events::Rule', {
      EventPattern: {
        source: ['aws.codepipeline'],
        'detail-type': ['CodePipeline Pipeline Execution State Change'],
      },
    }),
  );
});

test('Renders a default message', () => {
  const stack = new Stack();
  const pipeline = fakePipeline(stack);
  const notifications = new PipelineNotifications(stack, 'TestPipelineNotifications', {
    pipeline,
    receivers: 'testreceivers',
  });
  expect(stack).to(
    haveResourceLike('AWS::Events::Rule', {
      Targets: [
        {
          Arn: {
            Ref: 'TestPipelineNotifications197E83C9',
          },
          InputTransformer: {
            InputPathsMap: {
              'detail-pipeline': '$.detail.pipeline',
              'detail-state': '$.detail.state',
            },
            InputTemplate: {
              'Fn::Join': [
                '',
                [
                  '"The pipeline <detail-pipeline> has changed state to <detail-state>. To view the pipeline, go to ',
                  {
                    'Fn::Sub':
                      'https://${AWS::Region}.console.aws.amazon.com/codepipeline/home?region=${AWS::Region}#/view/',
                  },
                  '<detail-pipeline>."',
                ],
              ],
            },
          },
        },
      ],
    }),
  );
});

test('Allows customizing the message', () => {
  const stack = new Stack();
  const pipeline = fakePipeline(stack);
  const notifications = new PipelineNotifications(stack, 'TestPipelineNotifications', {
    pipeline,
    receivers: 'testreceivers',
    messageText: 'My message for test pipeline.',
  });
  expect(stack).to(
    haveResourceLike('AWS::Events::Rule', {
      Targets: [
        {
          Arn: {
            Ref: 'TestPipelineNotifications197E83C9',
          },
          Input: '"My message for test pipeline."',
        },
      ],
    }),
  );
});

test('Creates an SNS topic specifically for these notifications', () => {
  const stack = new Stack();
  const pipeline = fakePipeline(stack);
  const notifications = new PipelineNotifications(stack, 'TestPipelineNotifications', {
    pipeline,
    receivers: 'testreceivers',
  });
  expect(stack).to(
    beASupersetOfTemplate({
      Resources: {
        TestPipelineNotifications197E83C9: {
          Type: 'AWS::SNS::Topic',
        },
      },
    }),
  );
});

test('Adds an email based SNS subscription', () => {
  const stack = new Stack();
  const pipeline = fakePipeline(stack);
  const notifications = new PipelineNotifications(stack, 'TestPipelineNotifications', {
    pipeline,
    receivers: 'testreceivers',
  });
  expect(stack).to(
    haveResourceLike('AWS::SNS::Subscription', {
      Protocol: 'email',
      TopicArn: {
        Ref: 'TestPipelineNotifications197E83C9',
      },
      Endpoint: 'testreceivers',
    }),
  );
});
