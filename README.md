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
import { StackTags } from 'ndlib-cdk';
const app = new cdk.App();
app.node.applyAspect(new StackTags());
```
