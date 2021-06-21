/* tslint:disable:max-classes-per-file */
import { Behavior, CloudFrontAllowedMethods, LambdaEdgeEventType } from '@aws-cdk/aws-cloudfront';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import * as path from 'path';
import { IEdgeLambda, IEdgeLambdaProps } from '../index';

export class SpaRedirectionLambda extends cdk.Construct implements IEdgeLambda {
  public readonly function: lambda.Function;
  public readonly behavior: Behavior;

  constructor(scope: cdk.Construct, id: string, props: IEdgeLambdaProps) {
    super(scope, id);

    this.function = new lambda.Function(scope, `${id}Function`, {
      code: lambda.Code.fromAsset(path.join(__dirname, 'src')),
      description: 'Basic rewrite rule to send directory requests to appropriate locations in the SPA.',
      handler: 'handler.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: cdk.Duration.seconds(10),
      ...props,
    });

    this.behavior = {
      allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
      compress: true,
      isDefaultBehavior: props.isDefaultBehavior,
      pathPattern: props.pathPattern,
      lambdaFunctionAssociations: [
        {
          eventType: props.eventType || LambdaEdgeEventType.ORIGIN_REQUEST,
          lambdaFunction: this.function.currentVersion,
        },
      ],
      minTtl: props.minTtl,
      maxTtl: props.maxTtl,
      defaultTtl: props.defaultTtl,
    };
  }
}
