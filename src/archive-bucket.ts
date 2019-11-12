import s3 = require('@aws-cdk/aws-s3');
import cdk = require('@aws-cdk/core');

export interface IArchiveBucketProps extends s3.BucketProps {
  /**
   * When false (default), will use standard Glacier. If true, will use deep archive.
   * See https://aws.amazon.com/s3/storage-classes/#Archive for a comparison.
   */
  readonly deepArchive?: boolean;
}

const defaults = {
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  deepArchive: false,
};

export class ArchiveBucket extends s3.Bucket {
  /**
   * Class is designed to create a Glacier or Deep Archive archival system - immediately transitioning
   * objects from S3 to Glacier upon deposit. This is not designed to leave objects
   * in S3, and should not be leveraged for a tiered storage system as no objects should
   * remain in S3. It is merely designed to provide a mechanism to easily deposit items
   * into an Archive, which could be via console, CLI, or an API
   */
  constructor(scope: cdk.Construct, id: string, props?: IArchiveBucketProps) {
    super(scope, id, { ...defaults, ...props });
    const storageClass = props && props.deepArchive === true ? s3.StorageClass.DEEP_ARCHIVE : s3.StorageClass.GLACIER;
    this.addLifecycleRule({
      transitions: [
        {
          storageClass,
          transitionAfter: cdk.Duration.hours(0),
        },
      ],
    });
  }
}
