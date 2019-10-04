import { expect, haveResource } from '@aws-cdk/assert';
import { Stack } from "@aws-cdk/core";
import { DeepArchiveBucket, GlacierBucket } from '../src/index';

test('Glacier S3 Bucket has Glacier Transition', () => {
  const stack = new Stack();
  const bucket = new GlacierBucket(stack, 'Bucket',{});
    expect(stack).to(haveResource('AWS::S3::Bucket', {
        LifecycleConfiguration: {
            Rules: [{
                Transitions: [{
                    StorageClass: 'GLACIER',
                    TransitionInDays: 0
                }],
                Status: "Enabled"
            }]
        }}))});

test('Glacier S3 Bucket is not publicly accessible', () => {
    const stack = new Stack();
    const bucket = new GlacierBucket(stack, 'Bucket', {});
        expect(stack).to(haveResource('AWS::S3::Bucket',{
            PublicAccessBlockConfiguration: {
            BlockPublicAcls: true,
            BlockPublicPolicy: true,
            IgnorePublicAcls: true,
            RestrictPublicBuckets: true
        }
    }))});

test('Deep Archive S3 Bucket has Deep Archive Transition', () => {
    const stack = new Stack();
    const bucket = new DeepArchiveBucket(stack, 'Bucket',{});
        expect(stack).to(haveResource('AWS::S3::Bucket', {
            LifecycleConfiguration: {
                Rules: [{
                    Transitions: [{
                        StorageClass: 'DEEP_ARCHIVE',
                        TransitionInDays: 0
                    }],
                    Status: "Enabled"
                }]
            }}))});

test('Deep Archive S3 Bucket is not publicly accessible', () => {
    const stack = new Stack();
    const bucket = new DeepArchiveBucket(stack, 'Bucket', {});
        expect(stack).to(haveResource('AWS::S3::Bucket',{
            PublicAccessBlockConfiguration: {
                BlockPublicAcls: true,
                BlockPublicPolicy: true,
                IgnorePublicAcls: true,
                RestrictPublicBuckets: true
            }
        }))})