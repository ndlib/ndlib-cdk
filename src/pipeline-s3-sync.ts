import {
  BuildEnvironmentVariableType,
  BuildSpec,
  LinuxBuildImage,
  PipelineProject,
  PipelineProjectProps,
} from '@aws-cdk/aws-codebuild';
import { Artifact } from '@aws-cdk/aws-codepipeline';
import { CodeBuildAction } from '@aws-cdk/aws-codepipeline-actions';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { Construct, Duration, Fn } from '@aws-cdk/core';

export interface IPipelineS3SyncProps extends PipelineProjectProps {
  /**
   * The partial name of the bucket that this project will deploy to.
   * Wildcard will be added to the name, since S3 buckets created with cdk
   * may receive random identifiers appended to the end.
   * Usually corresponds with stack name.
   * Bucket may not exist at synth time since it could be created in the
   * same pipeline, so we use this to provide permissions.
   */
  readonly bucketNamePrefix: string;

  /**
   * SSM path for parameter with the full bucket name, fetched at runtime.
   */
  readonly bucketParamPath: string;

  /**
   * SSM path for parameter with the cloudFront ID, fetched at runtime.
   */
  readonly cloudFrontParamPath: string;

  /**
   * Artifact that contains the build which needs to be synced to the s3 bucket.
   * Presumably the output from a previous codebuild project or source action.
   */
  readonly inputBuildArtifact: Artifact;

  /**
   * Subdirectory of files to sync. Optional; will sync everything by default.
   */
  readonly subdirectory?: string;

  /**
   * Whether or not to invalidate the cloudFront cache after pushing files.
   * Defaults to true.
   */
  readonly invalidateCache?: boolean;

  /**
   * If provided, files which match given patterns will be assigned the
   * specified content-type as they are uploaded to s3. By default,
   * Content-Type is set by S3 based on file extension.
   */
  readonly contentTypePatterns?: Array<{
    /**
     * File path pattern to match on.
     */
    pattern: string;

    /**
     * MIME type to pass for matching files.
     */
    contentType: string;
  }>;
}

export class PipelineS3Sync extends Construct {
  public readonly project: PipelineProject;
  public readonly action: CodeBuildAction;

  constructor(scope: Construct, id: string, props: IPipelineS3SyncProps) {
    super(scope, id);

    const patternPairs = props.contentTypePatterns || [];
    // List of all the patterns that have specific content types provided
    // Ex: *.shtml,*.pdf,*.jpe?g
    const allTypePatterns = patternPairs.map(pair => pair.pattern).join(',');

    this.project = new PipelineProject(scope, `${id}SyncProject`, {
      description: 'Deploys built web components to bucket',
      timeout: Duration.minutes(10),
      environment: {
        buildImage: LinuxBuildImage.STANDARD_5_0,
        privileged: true,
      },
      environmentVariables: {
        // The stack that deploys these needs to export these parameters to the right path. This is necessary
        // since we can't know the distribution id until the pipeline has run to set up the cloudFront!
        DEST_BUCKET: {
          value: props.bucketParamPath,
          type: BuildEnvironmentVariableType.PARAMETER_STORE,
        },
        DISTRIBUTION_ID: {
          value: props.cloudFrontParamPath,
          type: BuildEnvironmentVariableType.PARAMETER_STORE,
        },
      },
      buildSpec: BuildSpec.fromObject({
        phases: {
          pre_build: {
            commands: [
              // Remove existing files from the s3 bucket
              `aws s3 rm s3://$DEST_BUCKET --recursive`,
            ],
          },
          build: {
            commands: [
              // Copy new build to the site s3 bucket
              `cd ${props.subdirectory || '.'}`,
              'aws s3 cp --recursive . s3://$DEST_BUCKET/ --include "*"' +
                (allTypePatterns ? ` --exclude "${allTypePatterns}"` : ''),
            ].concat(
              patternPairs.map(
                pair =>
                  `aws s3 cp --recursive . s3://$DEST_BUCKET/ --exclude "*" --include "${pair.pattern}" --content-type "${pair.contentType}"`,
              ),
            ),
          },
          post_build: {
            commands:
              props.invalidateCache ?? true
                ? [`aws cloudFront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"`]
                : [],
          },
        },
        version: '0.2',
      }),
    });

    this.project.addToRolePolicy(
      new PolicyStatement({
        actions: ['cloudFront:CreateInvalidation'],
        resources: ['*'],
      }),
    );
    // We don't know exactly what the bucket's name will be until runtime, but it starts with the stack's name
    this.project.addToRolePolicy(
      new PolicyStatement({
        actions: ['s3:*'],
        resources: [Fn.sub('arn:aws:s3:::' + props.bucketNamePrefix + '*')],
      }),
    );
    this.project.addToRolePolicy(
      new PolicyStatement({
        actions: ['ssm:GetParametersByPath', 'ssm:GetParameter', 'ssm:GetParameters'],
        resources: [
          Fn.sub('arn:aws:ssm:${AWS::Region}:${AWS::AccountId}:parameter' + props.bucketParamPath),
          Fn.sub('arn:aws:ssm:${AWS::Region}:${AWS::AccountId}:parameter' + props.cloudFrontParamPath),
        ],
      }),
    );

    this.action = new CodeBuildAction({
      actionName: 'Sync_Build_Files_To_S3',
      input: props.inputBuildArtifact,
      project: this.project,
      runOrder: 2,
    });
  }
}
