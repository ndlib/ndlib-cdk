import { Behavior, LambdaEdgeEventType } from '@aws-cdk/aws-cloudfront';
import * as lambda from '@aws-cdk/aws-lambda';
import { Duration } from '@aws-cdk/core';

// This enables setting certain props when constructing a new function, but not all of them.
// There would be no reason to override the code path or handler, for instance.
export interface IEdgeLambdaProps {
  // These props relate to the Function
  description?: string;
  timeout?: Duration;
  // These props relate to the CloudFront Behavior
  // eventType is not required by the interface, but it IS required by the CloudFront. Implementation should provide default.
  eventType?: LambdaEdgeEventType;
  isDefaultBehavior: boolean;
  pathPattern?: string;
  minTtl?: Duration;
  maxTtl?: Duration;
  defaultTtl?: Duration;
}

export interface IEdgeLambda {
  function: lambda.Function;
  behavior: Behavior;
}

export * from './spaRedirectionLambda';
export * from './transclusionLambda';
