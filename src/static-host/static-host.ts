import { ICertificate } from '@aws-cdk/aws-certificatemanager'
import {
  CfnDistribution,
  CloudFrontAllowedMethods,
  CloudFrontWebDistribution,
  OriginAccessIdentity,
  SecurityPolicyProtocol,
  SSLMethod,
  ViewerCertificate,
  ViewerProtocolPolicy,
} from '@aws-cdk/aws-cloudfront'
import { CanonicalUserPrincipal, Effect, PolicyStatement } from '@aws-cdk/aws-iam'
import { CnameRecord, HostedZone } from '@aws-cdk/aws-route53'
import { Bucket, BucketAccessControl } from '@aws-cdk/aws-s3'
import { StringParameter } from '@aws-cdk/aws-ssm'
import * as cdk from '@aws-cdk/core'
import { IEdgeLambda } from '../edge-lambdas'

export interface IStaticHostProps {
  /**
   * This will be used as the prefix in the hostname.
   */
  readonly hostnamePrefix: string

  /**
   * Domain name for cloudfront to be hosted at.
   */
  readonly domainName: string

  /**
   * SSL certificate to use with cloudfront. Should match domainName.
   */
  readonly websiteCertificate: ICertificate

  /**
   * Should create a DNS record in route53 for the generated hostname. (hostnamePrefix.domainName)
   * Generally this should only be done with domains other than library.nd.edu.
   */
  readonly createDns?: boolean

  /**
   * Hosted zone id for the route53 record. Is required if createDns is true.
   */
  readonly hostedZoneId?: string

  /**
   * Root page to be served.
   */
  readonly indexFilename?: string

  /**
   * Edge lambdas to be configured for use with the CloudFront.
   */
  readonly edgeLambdas?: IEdgeLambda[]

  /**
   * Error page configuration for the CloudFront distribution.
   */
  readonly errorConfig?: CfnDistribution.CustomErrorResponseProperty[]

  /**
   * (Optional) Bucket to write logs to. Will create a new bucket by default.
   */
  readonly logBucket?: Bucket
}

export class StaticHost extends cdk.Construct {
  /**
   * The S3 bucket that will hold website contents.
   */
  public readonly bucket: Bucket

  /**
   * The S3 bucket where log files are stored.
   */
  public readonly logBucket: Bucket

  /**
   * The cloudfront distribution.
   */
  public readonly cloudfront: CloudFrontWebDistribution

  /**
   * The cloudfront distribution domain name.
   */
  public readonly hostname: string

  /**
   * Props passed to constructor. Used for validation.
   */
  private readonly inProps: IStaticHostProps

  constructor(scope: cdk.Construct, id: string, props: IStaticHostProps) {
    super(scope, id)
    this.inProps = props

    const stack = cdk.Stack.of(this)

    this.hostname = `${props.hostnamePrefix}.${props.domainName}`

    // Create buckets for holding logs and the site contents
    this.logBucket =
      props.logBucket ||
      new Bucket(this, 'LogBucket', {
        accessControl: BucketAccessControl.LOG_DELIVERY_WRITE,
        versioned: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        lifecycleRules: [
          {
            enabled: true,
            expiration: cdk.Duration.days(365 * 10),
            noncurrentVersionExpiration: cdk.Duration.days(1),
          },
        ],
      })

    this.bucket = new Bucket(this, 'SiteBucket', {
      serverAccessLogsBucket: this.logBucket,
      serverAccessLogsPrefix: `s3/${this.hostname}/`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // Create OAI so CloudFront can access bucket files
    const oai = new OriginAccessIdentity(this, 'OriginAccessIdentity', {
      comment: `Static assets in ${stack.stackName}`,
    })
    this.bucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['s3:GetBucket*', 's3:List*', 's3:GetObject*'],
        resources: [this.bucket.bucketArn, this.bucket.bucketArn + '/*'],
        principals: [new CanonicalUserPrincipal(oai.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      }),
    )
    // Allow edge lambdas to access bucket contents
    props.edgeLambdas?.forEach(edgeLambda => {
      edgeLambda.function.addToRolePolicy(
        new PolicyStatement({
          resources: [this.bucket.bucketArn + '/*'],
          actions: ['s3:GetObject*'],
        }),
      )
    })

    // Won't work right if it starts with slash. It's an easy mistake to make so just handle it here
    let indexPath = props.indexFilename || 'index.html'
    if (indexPath.startsWith('/')) {
      indexPath = indexPath.substring(1)
    }

    this.cloudfront = new CloudFrontWebDistribution(this, 'Distribution', {
      comment: this.hostname,
      defaultRootObject: indexPath,
      errorConfigurations: props.errorConfig || [
        {
          errorCode: 403,
          responseCode: 403,
          responsePagePath: '/' + indexPath,
          errorCachingMinTtl: 300,
        },
        {
          errorCode: 404,
          responseCode: 404,
          responsePagePath: '/' + indexPath,
          errorCachingMinTtl: 300,
        },
      ],
      loggingConfig: {
        bucket: this.logBucket,
        includeCookies: true,
        prefix: `web/${this.hostname}/`,
      },
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: this.bucket,
            originAccessIdentity: oai,
          },
          behaviors:
            props.edgeLambdas && props.edgeLambdas.length
              ? props.edgeLambdas.map(item => item.behavior)
              : [
                {
                  allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
                  compress: true,
                  isDefaultBehavior: true,
                },
              ],
        },
      ],
      viewerCertificate: ViewerCertificate.fromAcmCertificate(props.websiteCertificate, {
        aliases: [this.hostname],
        securityPolicy: SecurityPolicyProtocol.TLS_V1_1_2016,
        sslMethod: SSLMethod.SNI,
      }),
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    })

    // Create DNS record (conditionally)
    if (props.createDns) {
      new CnameRecord(this, 'ServiceCNAME', {
        recordName: this.hostname,
        comment: this.hostname,
        domainName: this.cloudfront.distributionDomainName,
        zone: HostedZone.fromHostedZoneAttributes(this, 'ImportedHostedZone', {
          hostedZoneId: props.hostedZoneId as string,
          zoneName: props.domainName,
        }),
        ttl: cdk.Duration.minutes(15),
      })
    }

    new StringParameter(this, 'BucketParameter', {
      parameterName: `/all/stacks/${stack.stackName}/site-bucket-name`,
      description: 'Bucket where the stack website deploys to.',
      stringValue: this.bucket.bucketName,
    })

    new StringParameter(this, 'DistributionParameter', {
      parameterName: `/all/stacks/${stack.stackName}/distribution-id`,
      description: 'ID of the CloudFront distribution.',
      stringValue: this.cloudfront.distributionId,
    })

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: this.cloudfront.distributionDomainName,
      description: 'The cloudfront distribution domain name.',
    })
  }

  protected validate(): string[] {
    const errors = []
    if (this.inProps.createDns && !this.inProps.hostedZoneId) {
      errors.push('hostedZoneId is required when createDns is true')
    }

    return errors
  }
}
