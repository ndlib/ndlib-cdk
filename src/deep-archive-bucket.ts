import s3 = require('@aws-cdk/aws-s3');
import cdk = require('@aws-cdk/core');

const defaults = { blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL };

export class DeepArchiveBucket extends s3.Bucket {
  /* Class is designed to create a Glacier Deep Archive archival system - immediately transitioning
        objects from S3 to Glacier upon deposit. This is not designed to leave objects
        in S3, and should not be leveraged for a tiered storage system as no objects should
        remain in S3. It is merely designed to provide a mechanism to easily deposit items
        into Deep Archive, which could be via console, CLI, or an API */

  constructor(scope: cdk.Construct, id: string, props: s3.BucketProps) {
    super(scope, id, { ...defaults, ...props });
    this.addLifecycleRule({
      transitions: [
        {
          storageClass: s3.StorageClass.DEEP_ARCHIVE,
          transitionAfter: cdk.Duration.hours(0),
        },
      ],
    });
  }
}
