import { expect, haveResource } from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';
import { ArchiveBucket } from '../src/index';
import { BlockPublicAccess } from '@aws-cdk/aws-s3';

test('Glacier S3 Bucket has Glacier Transition', () => {
  const stack = new Stack();
  const bucket = new ArchiveBucket(stack, 'Bucket');
  expect(stack).to(
    haveResource('AWS::S3::Bucket', {
      LifecycleConfiguration: {
        Rules: [
          {
            Transitions: [
              {
                StorageClass: 'GLACIER',
                TransitionInDays: 0,
              },
            ],
            Status: 'Enabled',
          },
        ],
      },
    }),
  );
});

test('Glacier S3 Bucket is not publicly accessible', () => {
  const stack = new Stack();
  const bucket = new ArchiveBucket(stack, 'Bucket');
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

test('Deep Archive S3 Bucket has Deep Archive Transition', () => {
  const stack = new Stack();
  const bucket = new ArchiveBucket(stack, 'Bucket', { deepArchive: true });
  expect(stack).to(
    haveResource('AWS::S3::Bucket', {
      LifecycleConfiguration: {
        Rules: [
          {
            Transitions: [
              {
                StorageClass: 'DEEP_ARCHIVE',
                TransitionInDays: 0,
              },
            ],
            Status: 'Enabled',
          },
        ],
      },
    }),
  );
});

test('Deep Archive S3 Bucket is not publicly accessible', () => {
  const stack = new Stack();
  const bucket = new ArchiveBucket(stack, 'Bucket', { deepArchive: true });
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

test('Deep Archive S3 Bucket is publicly accessible when default is overridden as undefined', () => {
  const stack = new Stack();
  const overrides = { blockPublicAccess: undefined, deepArchive: true };
  const bucket = new ArchiveBucket(stack, 'Bucket', { ...overrides });
  expect(stack).notTo(
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

test('Glacier S3 Bucket is publicly accessible when default is overridden as undefined', () => {
  const stack = new Stack();
  const overrides = { blockPublicAccess: undefined, deepArchive: true };
  const bucket = new ArchiveBucket(stack, 'Bucket', { ...overrides });
  expect(stack).notTo(
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

test('Glacier S3 Bucket blocks Public ACLs when default is overridden to block ACLs', () => {
  const stack = new Stack();
  const overrides = { blockPublicAccess: BlockPublicAccess.BLOCK_ACLS, deepArchive: true };
  const bucket = new ArchiveBucket(stack, 'Bucket', { ...overrides });
  expect(stack).to(
    haveResource('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        IgnorePublicAcls: true,
      },
    }),
  );
});

test('Glacier S3 Bucket does not block public access when default is overridden to block ACLs', () => {
  const stack = new Stack();
  const overrides = { blockPublicAccess: BlockPublicAccess.BLOCK_ACLS, deepArchive: true };
  const bucket = new ArchiveBucket(stack, 'Bucket', { ...overrides });
  expect(stack).notTo(
    haveResource('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicPolicy: true,
        RestrictPublicBuckets: true,
      },
    }),
  );
});

test('Deep Archive S3 Bucket does not block public access when default is overridden to block ACLs', () => {
  const stack = new Stack();
  const overrides = { blockPublicAccess: BlockPublicAccess.BLOCK_ACLS, deepArchive: true };
  const bucket = new ArchiveBucket(stack, 'Bucket', { ...overrides });
  expect(stack).notTo(
    haveResource('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicPolicy: true,
        RestrictPublicBuckets: true,
      },
    }),
  );
});

test('Deep Archive Bucket blocks Public ACLs when default is overridden to block ACLs', () => {
  const stack = new Stack();
  const overrides = { blockPublicAccess: BlockPublicAccess.BLOCK_ACLS, deepArchive: true };
  const bucket = new ArchiveBucket(stack, 'Bucket', { ...overrides });
  expect(stack).to(
    haveResource('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        IgnorePublicAcls: true,
      },
    }),
  );
});
