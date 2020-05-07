# NDLIB CDK

[![Maintainability](https://api.codeclimate.com/v1/badges/7404f79e4247119dbc59/maintainability)](https://codeclimate.com/github/ndlib/ndlib-cdk/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/7404f79e4247119dbc59/test_coverage)](https://codeclimate.com/github/ndlib/ndlib-cdk/test_coverage)

## Stack Tags

Creates an Aspect that will apply stack level tags to all stacks in the application based on our defined required tags. Values for these tags are read from the following expected context keys:

| Key         | Value                                                      |
| ----------- | ---------------------------------------------------------- |
| projectName | Name of the overall project that the stacks belong to      |
| description | A description for the stacks                               |
| contact     | Contact information for the person(s) deploying this stack |
| owner       | Name or CLID of the person deploying this stack            |

Example usage:

```typescript
import cdk = require('@aws-cdk/core');
import { StackTags } from '@ndlib/ndlib-cdk';
const app = new cdk.App();
app.node.applyAspect(new StackTags());
```

## HTTPS Application Load Balancer

Creates a common construction of an ALB that will redirect all traffic from HTTP to HTTPS, and will by default respond with a 404 until additional listener rules are added. This can be used within a single stack that routes to multiple services in that stack, or it can be created in a parent stack where one or more child stacks then attach new services to the ALB.

Example usage:

```typescript
import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import { HttpsAlb } from '@ndlib/ndlib-cdk';
const stack = new cdk.Stack();
const vpc = new ec2.Vpc(stack, 'Vpc');
const alb = new HttpsAlb(stack, 'PublicLoadBalancer', {
  certificateArns: ['MyCertificateArn'],
  internetFacing: true,
  vpc,
});
```

## Archive S3 Bucket

Creates an S3 Bucket with no public access that immediately transitions all deposited objects to Glacier or Glacier Deep Archive. The public access policies can be overridden should it be necessary.

The following example will immediately move objects to Glacier:

```typescript
import cdk = require('@aws-cdk/core');
import { ArchiveBucket } from '@ndlib/ndlib-cdk';

const stack = new cdk.Stack();
const bucket = new ArchiveBucket(stack, 'Bucket');
```

The following example will immediately move objects to Glacier Deep Archive, while overriding the default public access behavior of the bucket:

```typescript
import cdk = require('@aws-cdk/core');
import { ArchiveBucket } from '@ndlib/ndlib-cdk';

const stack = new cdk.Stack();
const overrides = { blockPublicAccess: BlockPublicAccess.BLOCK_ACLS, deepArchive: true };
const bucket = new ArchiveBucket(stack, 'Bucket', { ...overrides });
```

## CodePipeline Email Notifications

Adds a basic email notification construct to watch a CodePipeline for state changes. Note: Currently does not watch any of the actions for specific state changes.

Example message:

> The pipeline my-test-pipeline-142PEPTENTABF has changed state to STARTED. To view the pipeline, go to https://us-east-1.console.aws.amazon.com/codepipeline/home?region=us-east-1#/view/my-test-pipeline-142PEPTENTABF.

Example usage:

```typescript
import cdk = require('@aws-cdk/core');
import { Pipeline } from '@aws-cdk/aws-codepipeline';
import { PipelineNotifications } from '@ndlib/ndlib-cdk';
const stack = new cdk.Stack();
const pipeline = Pipeline(stack, { ... });
const notifications = new PipelineNotifications(stack, 'TestPipelineNotifications', {
  pipeline,
  receivers: 'me@myhost.com'
});
```

## CodePipeline Slack Approval

Attaches a [Slack Approval Bot](https://github.com/ndlib/codepipeline-approvals/blob/master/slack_approval.md) to a CodePipeline's approval SNS Topic.

Note: This assumes that you've already deployed an [approval lambda](https://github.com/ndlib/codepipeline-approvals/blob/master/slack_approval.md#deploy-the-approval-lambda) and a [notifier](https://github.com/ndlib/codepipeline-approvals/blob/master/slack_approval.md#deploy-the-notifier-lambda) for the channel you want to push messages to.

Example usage:

```typescript
import cdk = require('@aws-cdk/core');
import { Pipeline } from '@aws-cdk/aws-codepipeline';
import { Topic } from '@aws-cdk/aws-sns';
import { SlackApproval } from '@ndlib/ndlib-cdk';
const stack = new cdk.Stack();
const approvalTopic = new Topic(this, 'ApprovalTopic');
const pipeline = Pipeline(stack, { ... });
const slackApproval = new SlackApproval(this, 'SlackApproval', {
  approvalTopic,
  notifyStackName: 'slack-deployment-channel-notifier',
});
```

## Service Level Objectives

Creates Cloudwatch Dashboards and Alarms from a list of SLOs based on the Google SRE workbook for [Alerting on SLOs](https://landing.google.com/sre/workbook/chapters/alerting-on-slos/)

```typescript
const slos = [
  {
    type: 'CloudfrontAvailability',
    distributionId: 'E123456789ABC',
    title: 'HTTPS - CDN',
    sloThreshold: 0.999,
  },
  {
    type: 'CloudfrontLatency',
    distributionId: 'E123456789ABC',
    title: 'HTTPS - CDN',
    sloThreshold: 0.95,
    latencyThreshold: 200,
  },
  {
    type: 'ApiAvailability',
    apiName: 'myapi-prod',
    title: 'Backend API',
    sloThreshold: 0.99,
  },
  {
    type: 'ApiLatency',
    apiName: 'myapi-prod',
    title: 'Backend API',
    sloThreshold: 0.95,
    latencyThreshold: 2000,
  },
];
const stack = new cdk.Stack();

// Create a dashboard representation of all of the alarms we're creating.
const alarmsDash = new SLOAlarmsDashboard(stack, 'AlarmsDashboard', {
  slos,
  dashboardName: 'AlarmsDashboard',
});

// Create a dashboard that shows the 30 day performance of all of our SLOs
const perfDash = new SLOPerformanceDashboard(stack, 'PerformanceDashboard', {
  slos,
  dashboardName: 'PerformanceDashboard',
});
const alarmsDashboardName = Fn.ref((perfDash.node.defaultChild as CfnDashboard).logicalId);

// Create the multi-window alarms for each of the SLOs. This will also create an SNS topic that will
// receive the alerts. The alarm will include links to the dashboards and runbooks given in its
// description.
const alarms = new SLOAlarms(stack, 'Alarms', {
  slos,
  dashboardLink: `https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=My-Website`,
  runbookLink: 'https://github.com/myorg/myrunbooks',
  alarmsDashboardLink: `https://console.aws.amazon.com/cloudwatch/home?region=${
    cdk.Stack.of(this).region
  }#dashboards:name=${alarmsDashboardName}`,
});
```
