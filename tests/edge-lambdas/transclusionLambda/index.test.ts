import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert';
import { CloudFrontAllowedMethods, LambdaEdgeEventType } from '@aws-cdk/aws-cloudfront';
import { Stack, Duration } from '@aws-cdk/core';
import { TransclusionLambda } from '../../../src/edge-lambdas/transclusionLambda';

describe('TransclusionLambda', () => {
  test('creates lambda function with default props', () => {
    const stack = new Stack();
    const testLambda = new TransclusionLambda(stack, 'Lambda', {
      isDefaultBehavior: false,
    });
    expect(testLambda.behavior).toMatchObject({
      allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
      compress: true,
      isDefaultBehavior: false,
      pathPattern: '*.shtml',
      lambdaFunctionAssociations: [
        {
          eventType: LambdaEdgeEventType.ORIGIN_REQUEST,
          lambdaFunction: testLambda.function.currentVersion,
        },
      ],
    });
    expectCDK(stack).to(
      haveResourceLike('AWS::Lambda::Function', {
        Description: 'Handles includes inside shtml files so we can serve them up correctly.',
        Handler: 'handler.handler',
        Runtime: 'nodejs12.x',
        Timeout: 10,
      }),
    );
  });

  test('creates lambda function with overridden props', () => {
    const stack = new Stack();
    const testLambda = new TransclusionLambda(stack, 'Lambda', {
      description: 'My transclusion lambda for my fancy stack.',
      timeout: Duration.seconds(123),
      isDefaultBehavior: true,
      pathPattern: '/public/',
      minTtl: Duration.seconds(100),
      maxTtl: Duration.seconds(200),
      defaultTtl: Duration.seconds(150),
    });
    expect(testLambda.behavior).toMatchObject({
      allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
      compress: true,
      isDefaultBehavior: true,
      pathPattern: '/public/',
      lambdaFunctionAssociations: [
        {
          eventType: LambdaEdgeEventType.ORIGIN_REQUEST,
          lambdaFunction: testLambda.function.currentVersion,
        },
      ],
      minTtl: Duration.seconds(100),
      maxTtl: Duration.seconds(200),
      defaultTtl: Duration.seconds(150),
    });
    expectCDK(stack).to(
      haveResourceLike('AWS::Lambda::Function', {
        Description: 'My transclusion lambda for my fancy stack.',
        Handler: 'handler.handler',
        Runtime: 'nodejs12.x',
        Timeout: 123,
      }),
    );
  });
});
