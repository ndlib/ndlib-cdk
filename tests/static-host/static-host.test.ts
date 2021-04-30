import {
  expect as expectCDK,
  haveResource,
  haveResourceLike,
  exactValue,
  countResources,
  stringLike,
  SynthUtils,
  ABSENT,
} from '@aws-cdk/assert'
import cdk = require('@aws-cdk/core')
import { CfnDistribution, LambdaEdgeEventType } from '@aws-cdk/aws-cloudfront'
import { StaticHost } from '../../src/static-host'
import { TransclusionLambda, SpaRedirectionLambda } from '../../src/edge-lambdas'

describe('StaticHost', () => {
  interface ISetupParams {
    createDns?: boolean
    hostedZoneId?: string
    createLambdas?: boolean
    errorConfig?: CfnDistribution.CustomErrorResponseProperty[]
  }

  const setup = (props: ISetupParams) => {
    const env = {
      account: '123456789',
      region: 'us-east-1',
    }

    const app = new cdk.App()
    const myStack = new cdk.Stack(app, 'TestStack', {
      stackName: 'static-host-test',
      env,
    })

    const edgeLambdas = []
    if (props.createLambdas) {
      edgeLambdas.push(new TransclusionLambda(myStack, 'Transclusion', {
        eventType: LambdaEdgeEventType.ORIGIN_REQUEST,
        isDefaultBehavior: false,
        pathPattern: '*.shtml',
      }))
      edgeLambdas.push(new SpaRedirectionLambda(myStack, 'Redirection', {
        eventType: LambdaEdgeEventType.ORIGIN_REQUEST,
        isDefaultBehavior: true,
      }))
    }

    new StaticHost(myStack, 'TestStaticHost', {
      hostnamePrefix: 'hostname',
      domainName: 'test.domain.org',
      websiteCertificate: {
        certificateArn: 'arn:aws:acm:::certificate/fake',
        env,
        stack: myStack,
        node: myStack.node,
      },
      indexFilename: 'index.html',
      createDns: props.createDns,
      hostedZoneId: props.hostedZoneId,
      edgeLambdas: edgeLambdas,
      errorConfig: props.errorConfig,
    })
    return myStack
  }

  describe('default props', () => {
    const stack = setup({})

    test('creates an s3 bucket for the site contents', () => {
      expectCDK(stack).to(
        haveResourceLike('AWS::S3::Bucket', {
          LoggingConfiguration: {
            DestinationBucketName: {
              Ref: stringLike('TestStaticHostLogBucket*'),
            },
            LogFilePrefix: 's3/hostname.test.domain.org/',
          },
        }),
      )
    })

    test('creates a cloudfront with an appropriate domain name', () => {
      expectCDK(stack).to(
        haveResourceLike('AWS::CloudFront::Distribution', {
          DistributionConfig: {
            Aliases: [
              'hostname.test.domain.org',
            ],
            DefaultRootObject: 'index.html',
          },
        }),
      )
    })

    test('outputs s3 bucket name to ssm parameter', () => {
      expectCDK(stack).to(
        haveResource('AWS::SSM::Parameter', {
          Type: 'String',
          Value: {
            Ref: stringLike('TestStaticHostSiteBucket*'),
          },
          Description: 'Bucket where the stack website deploys to.',
          Name: '/all/stacks/static-host-test/site-bucket-name',
        }),
      )
    })

    test('outputs cloudfront distribution id to ssm parameter', () => {
      expectCDK(stack).to(
        haveResource('AWS::SSM::Parameter', {
          Type: 'String',
          Value: {
            Ref: stringLike('TestStaticHostDistributionCFDistribution*'),
          },
          Description: 'ID of the CloudFront distribution.',
          Name: '/all/stacks/static-host-test/distribution-id',
        }),
      )
    })

    test('does not include lambda associations in cloudfront', () => {
      expectCDK(stack).to(
        haveResourceLike('AWS::CloudFront::Distribution', {
          DistributionConfig: {
            CacheBehaviors: ABSENT,
            DefaultCacheBehavior: {
              LambdaFunctionAssociations: ABSENT,
            },
          },
        }),
      )
    })

    test('does not create a route53 record for the domain', () => {
      expectCDK(stack).to(countResources('AWS::Route53::RecordSet', 0))
    })
  })

  describe('overridden props', () => {
    const stack = setup({
      createDns: true,
      hostedZoneId: 'abc123',
      createLambdas: true,
      errorConfig: [
        {
          errorCode: 403,
          responseCode: 404,
          responsePagePath: '/404.html',
          errorCachingMinTtl: 300,
        },
      ],
    })

    test('associates spaRedirect and transclusion lambdas with cloudfront', () => {
      expectCDK(stack).to(
        haveResourceLike('AWS::CloudFront::Distribution', {
          DistributionConfig: {
            CacheBehaviors: [
              {
                LambdaFunctionAssociations: exactValue([
                  {
                    EventType: 'origin-request',
                    LambdaFunctionARN: {
                      Ref: stringLike('TransclusionFunctionCurrentVersion*'),
                    },
                  },
                ]),
              },
            ],
            DefaultCacheBehavior: {
              LambdaFunctionAssociations: exactValue([
                {
                  EventType: 'origin-request',
                  LambdaFunctionARN: {
                    Ref: stringLike('RedirectionFunctionCurrentVersion*'),
                  },
                },
              ]),
            },
          },
        }),
      )
    })

    test('includes error configuration with cloudfront', () => {
      expectCDK(stack).to(
        haveResourceLike('AWS::CloudFront::Distribution', {
          DistributionConfig: {
            CustomErrorResponses: exactValue([
              {
                ErrorCachingMinTTL: 300,
                ErrorCode: 403,
                ResponseCode: 404,
                ResponsePagePath: '/404.html',
              },
            ]),
          },
        }),
      )
    })

    test('creates a route53 record for the domain', () => {
      expectCDK(stack).to(
        haveResourceLike('AWS::Route53::RecordSet', {
          Name: 'hostname.test.domain.org.',
          Type: 'CNAME',
          Comment: 'hostname.test.domain.org',
          HostedZoneId: 'abc123',
          ResourceRecords: [
            {
              'Fn::GetAtt': [stringLike('TestStaticHostDistributionCFDistribution*'), 'DomainName'],
            },
          ],
        }),
      )
    })
  })

  describe('validation', () => {
    test('throws an error when createDns is true and no hostedZoneId provided', () => {
      expect(() => {
        const stack = setup({ createDns: true })
        SynthUtils._synthesizeWithNested(stack)
      }).toThrowError()
    })
  })
})
