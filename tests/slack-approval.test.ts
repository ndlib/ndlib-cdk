import { expect, haveResourceLike } from '@aws-cdk/assert'
import { Topic } from '@aws-cdk/aws-sns'
import { Stack } from '@aws-cdk/core'
import { SlackApproval } from '../src/index'

test('Subscribes the imported notifier lambda to the approval topic', () => {
  const stack = new Stack()
  const approvalTopic = new Topic(stack, 'TestApprovalTopic')
  new SlackApproval(stack, 'TestPipelineSlackApproval', { approvalTopic, notifyStackName: 'TestNotifyStackName' })
  expect(stack).to(
    haveResourceLike('AWS::SNS::Subscription', {
      Protocol: 'lambda',
      TopicArn: {
        Ref: 'TestApprovalTopic34C9492C',
      },
      Endpoint: {
        'Fn::ImportValue': 'TestNotifyStackName:LambdaArn',
      },
    }),
  )
})

test('Gives the approval topic permission to invoke the imported notifier lambda', () => {
  const stack = new Stack()
  const approvalTopic = new Topic(stack, 'TestApprovalTopic')
  new SlackApproval(stack, 'TestPipelineSlackApproval', { approvalTopic, notifyStackName: 'TestNotifyStackName' })
  expect(stack).to(
    haveResourceLike('AWS::Lambda::Permission', {
      Action: 'lambda:InvokeFunction',
      FunctionName: {
        'Fn::ImportValue': 'TestNotifyStackName:LambdaArn',
      },
      Principal: 'sns.amazonaws.com',
      SourceArn: {
        Ref: 'TestApprovalTopic34C9492C',
      },
    }),
  )
})
