import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert';
import { CloudFrontAllowedMethods, LambdaEdgeEventType } from '@aws-cdk/aws-cloudfront';
import { Stack, Duration } from '@aws-cdk/core';
import { SpaRedirectionLambda } from '../../../src/edge-lambdas/spaRedirectionLambda';

describe('SpaRedirectionLambda', () => {
  test('creates lambda function with default props', () => {
    const stack = new Stack();
    const testLambda = new SpaRedirectionLambda(stack, 'Lambda', {
      isDefaultBehavior: false,
    });
    expect(testLambda.behavior).toMatchObject({
      allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
      compress: true,
      isDefaultBehavior: false,
      lambdaFunctionAssociations: [
        {
          eventType: LambdaEdgeEventType.ORIGIN_REQUEST,
          lambdaFunction: testLambda.function.currentVersion,
        },
      ],
    });
    expectCDK(stack).to(
      haveResourceLike('AWS::Lambda::Function', {
        Description: 'Basic rewrite rule to send directory requests to appropriate locations in the SPA.',
        Handler: 'handler.handler',
        Runtime: 'nodejs12.x',
        Timeout: 10,
        Environment: {
          Variables: {
            EXTENSIONS: '.html,.js,.json,.css,.jpg,.jpeg,.png,.ico,.map,.txt,.kml,.svg,.webmanifest,.webp,.xml,.zip',
          },
        },
      }),
    );
  });

  test('creates lambda function with overridden props', () => {
    const stack = new Stack();
    const testLambda = new SpaRedirectionLambda(stack, 'Lambda', {
      description: 'My transclusion lambda for my fancy stack.',
      timeout: Duration.seconds(123),
      isDefaultBehavior: true,
      pathPattern: '/public/',
      minTtl: Duration.seconds(100),
      maxTtl: Duration.seconds(200),
      defaultTtl: Duration.seconds(150),
      fileExtensions: ['.pdf', '.abcde'],
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
        Environment: {
          Variables: {
            EXTENSIONS: '.pdf,.abcde',
          },
        },
      }),
    );
  });
});
