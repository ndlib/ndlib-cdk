import { expect, haveResource, haveResourceLike } from '@aws-cdk/assert';
import { BlockPublicAccess } from '@aws-cdk/aws-s3';
import { Stack } from '@aws-cdk/core';
import { ArtifactBucket } from '../src/index';

test('Artifact Bucket is not publicly accessible', () => {
  const stack = new Stack();
  const bucket = new ArtifactBucket(stack, 'Bucket', {});
  expect(stack).to(
    haveResource('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    }),
  );
});

test('Artifact Bucket cannot be accessed via non-secure methods', () => {
  const stack = new Stack();
  const bucket = new ArtifactBucket(stack, 'Bucket', {});
  expect(stack).to(
    haveResourceLike('AWS::S3::BucketPolicy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 's3:*',
            Condition: {
              Bool: { 'aws:SecureTransport': false },
            },
            Effect: 'Deny',
            Principal: '*',
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
    }),
  );
});
