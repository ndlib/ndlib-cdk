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
                  '*',
                ],
              ],
            },
          },
        ],
      },
    }),
  );
});

// test('Glacier S3 Bucket is not publicly accessible', () => {
//   const stack = new Stack();
//   const bucket = new ArtifactBucket(stack, 'Bucket');
//   expect(stack).to(
//     haveResource('AWS::S3::Bucket', {
//       PublicAccessBlockConfiguration: {
//         BlockPublicAcls: true,
//         BlockPublicPolicy: true,
//         IgnorePublicAcls: true,
//         RestrictPublicBuckets: true,
//       },
//     }),
//   );
// });

// test('Deep Archive S3 Bucket has Deep Archive Transition', () => {
//   const stack = new Stack();
//   const bucket = new ArtifactBucket(stack, 'Bucket', { deepArchive: true });
//   expect(stack).to(
//     haveResource('AWS::S3::Bucket', {
//       LifecycleConfiguration: {
//         Rules: [
//           {
//             Transitions: [
//               {
//                 StorageClass: 'DEEP_ARCHIVE',
//                 TransitionInDays: 0,
//               },
//             ],
//             Status: 'Enabled',
//           },
//         ],
//       },
//     }),
//   );
// });

// test('Deep Archive S3 Bucket is not publicly accessible', () => {
//   const stack = new Stack();
//   const bucket = new ArtifactBucket(stack, 'Bucket', { deepArchive: true });
//   expect(stack).to(
//     haveResource('AWS::S3::Bucket', {
//       PublicAccessBlockConfiguration: {
//         BlockPublicAcls: true,
//         BlockPublicPolicy: true,
//         IgnorePublicAcls: true,
//         RestrictPublicBuckets: true,
//       },
//     }),
//   );
// });

// test('Deep Archive S3 Bucket is publicly accessible when default is overridden as undefined', () => {
//   const stack = new Stack();
//   const overrides = { blockPublicAccess: undefined, deepArchive: true };
//   const bucket = new ArtifactBucket(stack, 'Bucket', { ...overrides });
//   expect(stack).notTo(
//     haveResource('AWS::S3::Bucket', {
//       PublicAccessBlockConfiguration: {
//         BlockPublicAcls: true,
//         BlockPublicPolicy: true,
//         IgnorePublicAcls: true,
//         RestrictPublicBuckets: true,
//       },
//     }),
//   );
// });

// test('Glacier S3 Bucket is publicly accessible when default is overridden as undefined', () => {
//   const stack = new Stack();
//   const overrides = { blockPublicAccess: undefined, deepArchive: true };
//   const bucket = new ArtifactBucket(stack, 'Bucket', { ...overrides });
//   expect(stack).notTo(
//     haveResource('AWS::S3::Bucket', {
//       PublicAccessBlockConfiguration: {
//         BlockPublicAcls: true,
//         BlockPublicPolicy: true,
//         IgnorePublicAcls: true,
//         RestrictPublicBuckets: true,
//       },
//     }),
//   );
// });

// test('Glacier S3 Bucket blocks Public ACLs when default is overridden to block ACLs', () => {
//   const stack = new Stack();
//   const overrides = { blockPublicAccess: BlockPublicAccess.BLOCK_ACLS, deepArchive: true };
//   const bucket = new ArtifactBucket(stack, 'Bucket', { ...overrides });
//   expect(stack).to(
//     haveResource('AWS::S3::Bucket', {
//       PublicAccessBlockConfiguration: {
//         BlockPublicAcls: true,
//         IgnorePublicAcls: true,
//       },
//     }),
//   );
// });

// test('Glacier S3 Bucket does not block public access when default is overridden to block ACLs', () => {
//   const stack = new Stack();
//   const overrides = { blockPublicAccess: BlockPublicAccess.BLOCK_ACLS, deepArchive: true };
//   const bucket = new ArtifactBucket(stack, 'Bucket', { ...overrides });
//   expect(stack).notTo(
//     haveResource('AWS::S3::Bucket', {
//       PublicAccessBlockConfiguration: {
//         BlockPublicPolicy: true,
//         RestrictPublicBuckets: true,
//       },
//     }),
//   );
// });

// test('Deep Archive S3 Bucket does not block public access when default is overridden to block ACLs', () => {
//   const stack = new Stack();
//   const overrides = { blockPublicAccess: BlockPublicAccess.BLOCK_ACLS, deepArchive: true };
//   const bucket = new ArtifactBucket(stack, 'Bucket', { ...overrides });
//   expect(stack).notTo(
//     haveResource('AWS::S3::Bucket', {
//       PublicAccessBlockConfiguration: {
//         BlockPublicPolicy: true,
//         RestrictPublicBuckets: true,
//       },
//     }),
//   );
// });

// test('Deep Archive Bucket blocks Public ACLs when default is overridden to block ACLs', () => {
//   const stack = new Stack();
//   const overrides = { blockPublicAccess: BlockPublicAccess.BLOCK_ACLS, deepArchive: true };
//   const bucket = new ArtifactBucket(stack, 'Bucket', { ...overrides });
//   expect(stack).to(
//     haveResource('AWS::S3::Bucket', {
//       PublicAccessBlockConfiguration: {
//         BlockPublicAcls: true,
//         IgnorePublicAcls: true,
//       },
//     }),
//   );
// });
