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
Aspects.of(app).add(new StackTags());
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
    alarmsEnabled: {
      High: true,
      Low: true,
    },
  },
  {
    type: 'CloudfrontLatency',
    distributionId: 'E123456789ABC',
    title: 'HTTPS - CDN',
    sloThreshold: 0.95,
    latencyThreshold: 200,
    alarmsEnabled: {
      High: false,
      Low: false,
    },
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
  {
    type: 'AppSyncAvailability',
    apiId: 'myAppSyncAPI-prod',
    title: 'AppSync API',
    sloThreshold: 0.99,
  },
  {
    type: 'AppSyncLatency',
    apiId: 'myAppSyncAPI-prod',
    title: 'AppSync API',
    sloThreshold: 0.95,
    latencyThreshold: 2000,
  },
  {
    type: 'ElasticSearchAvailability',
    domainName: 'myes-prod',
    accountId: '1234567890',
    title: 'Search API',
    sloThreshold: 0.99999,
  },
  {
    type: 'ElasticSearchLatency',
    domainName: 'myes-prod',
    accountId: '1234567890',
    title: 'Search API',
    sloThreshold: 0.99,
    latencyThreshold: 100,
  },
  {
    type: 'CustomAvailability',
    namespace: 'CustomNamespace',
    errorsMetricName: 'CustomErrorCountMetric',
    countsMetricName: 'CustomRequestCountMetric',
    title: 'My Custom Availability',
    sloThreshold: 0.99,
  },
  {
    type: 'CustomLatency',
    namespace: 'CustomNamespace',
    latencyMetricName: 'CustomLatencyMetric',
    title: 'My Custom Latency',
    sloThreshold: 0.99,
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

## Artifact S3 Bucket

Creates an S3 Bucket with no public access and requires secure transport to take any action. This is a common construct across many applications, where a build process requires a place to store its output.

The following example will create a standard artifact bucket:

```typescript
import cdk = require('@aws-cdk/core');
import { ArtifactBucket } from '@ndlib/ndlib-cdk';

const stack = new cdk.Stack();
const bucket = new ArtifactBucket(stack, 'Bucket');
```

## Docker CodeBuild Action

This is a factory helper method to ease the creation of CodeBuild projects that use authenticated methods to pull from DockerHub. This method requires following the [Official AWS Documentation on solving the "error pulling image configuration: toomanyrequests" error](https://aws.amazon.com/premiumsupport/knowledge-center/codebuild-docker-pull-image-error/) in the "Store your DockerHub credentials with AWS Secrets Manager" section.

The following example will create a Linux CodeBuild project, using DockerHub authentication credentials stored in Secrets Manager (under the `/test/credentials` path) and the `PipelineProject` CDK construct, that leverages the `alpine:3` DockerHub Image:

```typescript
import cdk = require('@aws-cdk/core');
import { PipelineProject } from '@aws-cdk/aws-codebuild';
import { DockerCodeBuildAction } from '@ndlib/ndlib-cdk';

const stack = new cdk.Stack();
const project = new PipelineProject(stack, `test-project`, {
  environment: {
    buildImage: DockerCodeBuildAction.fromLinuxDockerImage(stack, 'alpine-build-image', {
      image: 'alpine:3',
      credentialsContextKeyName: '/test/credentials',
    }),
  },
});
```

The following example will create a Windows CodeBuild project, using DockerHub authentication credentials stored in Secrets Manager (under the `/test/credentials` path) and the `Project` CDK construct, that leverages the `mcr.microsoft.com/windows/servercore/iis` DockerHub Image:

```typescript
import cdk = require('@aws-cdk/core');
import { Project, BuildSpec } from '@aws-cdk/aws-codebuild';
import { DockerCodeBuildAction } from '@ndlib/ndlib-cdk';

const stack = new cdk.Stack();
const project = new Project(stack, `test-project`, {
  buildSpec: BuildSpec.fromObject({
    phases: {
      build: {
        commands: ['echo hello'],
      },
    },
    version: '0.2',
  }),
  environment: {
    buildImage: DockerCodeBuildAction.fromWindowsDockerImage(stack, 'iis-build-image', {
      image: 'mcr.microsoft.com/windows/servercore/iis',
      credentialsContextKeyName: '/test/credentials',
    }),
  },
});
```

## Edge Lambdas

These lambdas are standardized code which may be useful for multiple projects. They should be paired with one or more cloudfronts.

The current list of edge lambdas are:

- SpaRedirectionLambda – Requesting a page other than the index redirects to the origin to serve up the root index file. This is useful for SPAs which handle their own routing.
- TransclusionLambda – Requesting .shtml files with server-side includes (SSI) triggers this lambda. Include tags in the HTML are replaced with the body of the page file they are requesting, so the origin serves up a flat HTML file.

Each of these constructs implements IEdgeLambda. It will create the function, as well as define a Behavior which can then be used in configuring a CloudFront.

Example usage:

```typescript
import cdk = require('@aws-cdk/core')
import { CloudFrontWebDistribution } from '@aws-cdk/aws-cloudfront'
import { TransclusionLambda } from '@ndlib/ndlib-cdk'

const stack = new cdk.Stack()
const siteBucket = new Bucket(stack, 'Bucket');
const transclusionLambda = new TransclusionLambda(stack, 'Transclusion', {
  isDefaultBehavior: true,
  originBucket: siteBucket,
})
new CloudFrontWebDistribution(this, 'Distribution', {
  ...
  originConfigs: [
    {
      ...
      behaviors: [transclusionLambda.behavior],
    },
  ],
})
```

## Newman Runner

This construct creates a CodeBuild project and an action which can be used in a pipeline to run newman tests. This is typically used for smoke tests to verify the service deployed by the pipeline is operational.

Example usage:

```typescript
import { Pipeline } from '@aws-cdk/aws-codepipeline';
import { Stack } from '@aws-cdk/core';
import { NewmanPipelineProject } from '@ndlib/ndlib-cdk';

const stack = new Stack();
const pipeline = Pipeline(stack, 'MyPipeline');
const appSourceArtifact = new codepipeline.Artifact('AppCode');
// ...
const newmanRunner = new NewmanRunner(stack, 'TestProject', {
  sourceArtifact: appSourceArtifact,
  collectionPath: 'test/newman/collection.json',
  collectionVariables: {
    hostname: 'https://www.example.com',
    foo: 'bar',
  },
});
pipeline.addStage({
  stageName: 'Build',
  actions: [buildAction, newmanRunner.action, approvalAction],
});
```
