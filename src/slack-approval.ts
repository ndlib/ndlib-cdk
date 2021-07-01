import { CfnPermission } from '@aws-cdk/aws-lambda'
import { Subscription, SubscriptionProtocol, Topic } from '@aws-cdk/aws-sns'
import { Construct, Fn } from '@aws-cdk/core'

export interface ISlackApprovalProps {
  /**
   * The SNS topic associated with the approval action that you would like to subscribe the bot to
   *
   * @default - No description.
   */
  readonly approvalTopic: Topic
  /**
   * The stack that manages the channel notifier
   *
   * @default - No description.
   * @see https://github.com/ndlib/codepipeline-approvals/blob/master/slack_approval.md#deploy-the-notifier-lambda
   */
  readonly notifyStackName: string
}

/**
 * Connects the approval topic from a pipeline with a Slack approval bot
 * @see https://github.com/ndlib/codepipeline-approvals/blob/master/slack_approval.md#slack-approval-bot
 */
export class SlackApproval extends Construct {
  constructor(scope: Construct, id: string, props: ISlackApprovalProps) {
    super(scope, id)
    const importedNotifyLambdaArn = Fn.importValue(`${props.notifyStackName}:LambdaArn`)

    new Subscription(this, 'NotifyLambdaSNSSubscription', {
      endpoint: importedNotifyLambdaArn,
      protocol: SubscriptionProtocol.LAMBDA,
      topic: props.approvalTopic,
    })
    new CfnPermission(this, 'NotifyLambdaSNSPermission', {
      action: 'lambda:InvokeFunction',
      principal: 'sns.amazonaws.com',
      sourceArn: props.approvalTopic.topicArn,
      functionName: importedNotifyLambdaArn,
    })
  }
}
