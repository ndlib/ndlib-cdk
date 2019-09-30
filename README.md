# NDLIB CDK
[![Maintainability](https://api.codeclimate.com/v1/badges/7404f79e4247119dbc59/maintainability)](https://codeclimate.com/github/ndlib/ndlib-cdk/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/7404f79e4247119dbc59/test_coverage)](https://codeclimate.com/github/ndlib/ndlib-cdk/test_coverage)

## Stack Tags
Creates an Aspect that will apply stack level tags to all stacks in the application based on our defined required tags. Values for these tags are read from the following expected context keys:

| Key | Value |
|---|---|
| projectName | Name of the overall project that the stacks belong to |
| description | A description for the stacks|
| contact | Contact information for the person(s) deploying this stack |
| owner | Name or CLID of the person deploying this stack |

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
