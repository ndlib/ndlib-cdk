import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert';
import { CloudFrontAllowedMethods, LambdaEdgeEventType } from '@aws-cdk/aws-cloudfront';
import { Stack, Duration } from '@aws-cdk/core';
import { SpaRedirectionLambda } from '../../../src/edge-lambdas/spaRedirectionLambda';

describe('SpaRedirectionLambda', () => {
  describe('with default props', () => {
    const stack = new Stack();
    const testLambda = new SpaRedirectionLambda(stack, 'Lambda', {
      isDefaultBehavior: false,
    });

    test('creates function', () => {
      expectCDK(stack).to(
        haveResourceLike('AWS::Lambda::Function', {
          Description: 'Basic rewrite rule to send directory requests to appropriate locations in the SPA.',
          Handler: 'handler.handler',
          Runtime: 'nodejs12.x',
          Timeout: 10,
        }),
      );
    });

    test('creates valid behavior configuration', () => {
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
    });
  });

  describe('with overridden props', () => {
    const stack = new Stack();
    const testLambda = new SpaRedirectionLambda(stack, 'Lambda', {
      description: 'My transclusion lambda for my fancy stack.',
      timeout: Duration.seconds(123),
      isDefaultBehavior: true,
      pathPattern: '/public/',
      minTtl: Duration.seconds(100),
      maxTtl: Duration.seconds(200),
      defaultTtl: Duration.seconds(150),
    });

    test('overrides defaults on function', () => {
      expectCDK(stack).to(
        haveResourceLike('AWS::Lambda::Function', {
          Description: 'My transclusion lambda for my fancy stack.',
          Handler: 'handler.handler',
          Runtime: 'nodejs12.x',
          Timeout: 123,
        }),
      );
    });

    test('overrides defaults on behavior', () => {
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
    });
  });
});
