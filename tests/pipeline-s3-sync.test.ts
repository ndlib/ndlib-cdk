import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert'
import { Artifact } from '@aws-cdk/aws-codepipeline'
import { Stack } from '@aws-cdk/core'
import { PipelineS3Sync } from '../src'

describe('PipelineS3Sync', () => {
  describe('with minimal props', () => {
    test('should create codebuild project with expected props', () => {
      const stack = new Stack()
      new PipelineS3Sync(stack, 'S3SyncTest', {
        bucketNamePrefix: stack.stackName,
        bucketParamPath: '/my/path/to/site-bucket-name',
        cloudFrontParamPath: 'my/path/to/distribution-id',
        inputBuildArtifact: new Artifact(),
      })
      expectCDK(stack).to(
        haveResourceLike('AWS::CodeBuild::Project', {
          Environment: {
            EnvironmentVariables: [
              {
                Name: 'DEST_BUCKET',
                Type: 'PARAMETER_STORE',
                Value: '/my/path/to/site-bucket-name',
              },
              {
                Name: 'DISTRIBUTION_ID',
                Type: 'PARAMETER_STORE',
                Value: 'my/path/to/distribution-id',
              },
            ],
          },
          Source: {
            BuildSpec: // eslint-disable-next-line max-len
              '{\n  "phases": {\n    "pre_build": {\n      "commands": [\n        "aws s3 rm s3://$DEST_BUCKET --recursive"\n      ]\n    },\n    "build": {\n      "commands": [\n        "cd .",\n        "aws s3 cp --recursive . s3://$DEST_BUCKET/ --include \\"*\\""\n      ]\n    },\n    "post_build": {\n      "commands": [\n        "aws cloudFront create-invalidation --distribution-id $DISTRIBUTION_ID --paths \\"/*\\""\n      ]\n    }\n  },\n  "version": "0.2"\n}',
            Type: 'CODEPIPELINE',
          },
        }),
      )
    })
  })

  describe('with more props', () => {
    test('should create codebuild project with expected commands', () => {
      const stack = new Stack()
      new PipelineS3Sync(stack, 'S3SyncTest', {
        bucketNamePrefix: stack.stackName,
        bucketParamPath: '/my/path/to/site-bucket-name',
        cloudFrontParamPath: 'my/path/to/distribution-id',
        inputBuildArtifact: new Artifact(),
        subdirectory: 'myFolder/somewhere',
        invalidateCache: false, // Defaults to true, so make sure disabling cache invalidation works
        contentTypePatterns: [
          {
            pattern: '*.pdf',
            contentType: 'application/pdf',
          },
          {
            pattern: '*.csv',
            contentType: 'text/plain',
          },
        ],
      })
      expectCDK(stack).to(
        haveResourceLike('AWS::CodeBuild::Project', {
          Source: {
            BuildSpec: // eslint-disable-next-line max-len
              '{\n  \"phases\": {\n    \"pre_build\": {\n      \"commands\": [\n        \"aws s3 rm s3://$DEST_BUCKET --recursive\"\n      ]\n    },\n    \"build\": {\n      \"commands\": [\n        \"cd myFolder/somewhere\",\n        \"aws s3 cp --recursive . s3://$DEST_BUCKET/ --include \\\"*\\\" --exclude \\\"*.pdf,*.csv\\\"\",\n        \"aws s3 cp --recursive . s3://$DEST_BUCKET/                   --exclude \\\"*\\\"                   --include \\\"*.pdf\\\"                   --content-type \\\"application/pdf\\\"\",\n        \"aws s3 cp --recursive . s3://$DEST_BUCKET/                   --exclude \\\"*\\\"                   --include \\\"*.csv\\\"                   --content-type \\\"text/plain\\\"\"\n      ]\n    },\n    \"post_build\": {\n      \"commands\": []\n    }\n  },\n  \"version\": \"0.2\"\n}',
            Type: 'CODEPIPELINE',
          },
        }),
      )
    })
  })
})
