/* tslint:disable:max-classes-per-file */
import { Behavior, CloudFrontAllowedMethods, LambdaEdgeEventType } from '@aws-cdk/aws-cloudfront';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import * as path from 'path';
import { IEdgeLambda, IEdgeLambdaProps } from '../index';

export interface ISpaRedirectionLambdaProps extends IEdgeLambdaProps {
  /**
   * List of file extensions which should redirect. INCLUDE the dot. (Ex: .html)
   * If omitted, a default list of extensions will be used.
   */
  fileExtensions?: string[];
}

export class SpaRedirectionLambda extends cdk.Construct implements IEdgeLambda {
  public readonly function: lambda.Function;
  public readonly behavior: Behavior;

  constructor(scope: cdk.Construct, id: string, props: ISpaRedirectionLambdaProps) {
    super(scope, id);

    this.function = new lambda.Function(scope, `${id}Function`, {
      code: lambda.Code.fromAsset(path.join(__dirname, 'src')),
      description: 'Basic rewrite rule to send directory requests to appropriate locations in the SPA.',
      handler: 'handler.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: cdk.Duration.seconds(10),
      environment: {
        EXTENSIONS: (props.fileExtensions?.length
          ? props.fileExtensions
          : [
              '.html',
              '.js',
              '.json',
              '.css',
              '.jpg',
              '.jpeg',
              '.png',
              '.ico',
              '.map',
              '.txt',
              '.kml',
              '.svg',
              '.webmanifest',
              '.webp',
              '.xml',
              '.zip',
            ]
        ).join(','),
      },
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
