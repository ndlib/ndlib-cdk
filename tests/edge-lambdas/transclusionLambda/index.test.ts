import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert'
import { CloudFrontAllowedMethods, LambdaEdgeEventType } from '@aws-cdk/aws-cloudfront'
import { Bucket } from '@aws-cdk/aws-s3'
import { Stack, Duration } from '@aws-cdk/core'
import { TransclusionLambda } from '../../../src/edge-lambdas/transclusionLambda'

describe('TransclusionLambda', () => {
  describe('with default props', () => {
    const stack = new Stack()
    const testBucket = new Bucket(stack, 'Bucket')
    const testLambda = new TransclusionLambda(stack, 'Lambda', {
      isDefaultBehavior: false,
      originBucket: testBucket,
    })

    test('creates function', () => {
      expectCDK(stack).to(
        haveResourceLike('AWS::Lambda::Function', {
          Description: 'Handles includes inside shtml files so we can serve them up correctly.',
          Handler: 'handler.handler',
          Runtime: 'nodejs12.x',
          Timeout: 10,
        }),
      )
    })

    test('creates valid behavior configuration', () => {
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
      })
    })

    test('grants bucket read permissions to the lambda execution role', () => {
      expectCDK(stack).to(
        haveResourceLike('AWS::IAM::Policy', {
          PolicyDocument: {
            Statement: [
              {
                Action: 's3:GetObject*',
                Effect: 'Allow',
                Resource: {
                  'Fn::Join': [
                    '',
                    [
                      {
                        'Fn::GetAtt': ['Bucket83908E77', 'Arn'],
                      },
                      '/*',
                    ],
                  ],
                },
              },
            ],
          },
          Roles: [
            {
              Ref: 'LambdaFunctionServiceRoleC555A460',
            },
          ],
        }),
      )
    })
  })

  describe('with overridden props', () => {
    const stack = new Stack()
    const testBucket = new Bucket(stack, 'Bucket')
    const testLambda = new TransclusionLambda(stack, 'Lambda', {
      description: 'My transclusion lambda for my fancy stack.',
      timeout: Duration.seconds(123),
      isDefaultBehavior: true,
      pathPattern: '/public/',
      minTtl: Duration.seconds(100),
      maxTtl: Duration.seconds(200),
      defaultTtl: Duration.seconds(150),
      originBucket: testBucket,
    })

    test('overrides defaults on function', () => {
      expectCDK(stack).to(
        haveResourceLike('AWS::Lambda::Function', {
          Description: 'My transclusion lambda for my fancy stack.',
          Handler: 'handler.handler',
          Runtime: 'nodejs12.x',
          Timeout: 123,
        }),
      )
    })

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
      })
    })
  })
})
