/* tslint:disable:max-classes-per-file */
import { Behavior, CloudFrontAllowedMethods, LambdaEdgeEventType } from '@aws-cdk/aws-cloudfront'
import { PolicyStatement } from '@aws-cdk/aws-iam'
import * as lambda from '@aws-cdk/aws-lambda'
import { Bucket } from '@aws-cdk/aws-s3'
import * as cdk from '@aws-cdk/core'
import * as path from 'path'
import { IEdgeLambda, IEdgeLambdaProps } from '../index'

export interface ITransclusionLambdaProps extends IEdgeLambdaProps {
  /**
   * The bucket where site files are hosted. Needed to grant permissions so the lambda can fetch objects.
   */
  originBucket: Bucket
}

export class TransclusionLambda extends cdk.Construct implements IEdgeLambda {
  public readonly function: lambda.Function
  public readonly behavior: Behavior

  constructor(scope: cdk.Construct, id: string, props: ITransclusionLambdaProps) {
    super(scope, id)

    this.function = new lambda.Function(scope, `${id}Function`, {
      code: lambda.Code.fromAsset(path.join(__dirname, 'src')),
      description: 'Handles includes inside shtml files so we can serve them up correctly.',
      handler: 'handler.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: cdk.Duration.seconds(10),
      ...props,
    })
    this.function.addToRolePolicy(
      new PolicyStatement({
        resources: [props.originBucket.bucketArn + '/*'],
        actions: ['s3:GetObject*'],
      }),
    )

    this.behavior = {
      allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
      compress: true,
      isDefaultBehavior: props.isDefaultBehavior,
      pathPattern: props.pathPattern || '*.shtml',
      lambdaFunctionAssociations: [
        {
          eventType: props.eventType || LambdaEdgeEventType.ORIGIN_REQUEST,
          lambdaFunction: this.function.currentVersion,
        },
      ],
      minTtl: props.minTtl,
      maxTtl: props.maxTtl,
      defaultTtl: props.defaultTtl,
    }
  }
}
