import { AnyPrincipal, Effect, PolicyStatement } from '@aws-cdk/aws-iam';
import s3 = require('@aws-cdk/aws-s3');
import cdk = require('@aws-cdk/core');
import { RemovalPolicy } from '@aws-cdk/core';

const defaults = {
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    removalPolicy: RemovalPolicy.DESTROY
};

export class ArtifactBucket extends s3.Bucket {
    /**
     * 
     * Class is designed to create a standard bucket for holding
     * built artifacts from CodeBuild or CodePipeline.
     * It is a fairly standard item and needed for any project with CI/CD,
     * so it is a good idea to create a construct to ensure that this is done
     * in the same way with each project.
     */ 
    constructor(scope: cdk.Construct, id: string, props: s3.BucketProps) {
        super (scope, id, {...defaults, ...props })
        this.addToResourcePolicy(new PolicyStatement({
            principals: [new AnyPrincipal()],
            effect: Effect.DENY,
            actions: ['s3:*'],
            conditions: {
                'Bool': { 'aws:SecureTransport': false }
            },
            resources: [this.bucketArn + '*']
            }
        ))
    }
}