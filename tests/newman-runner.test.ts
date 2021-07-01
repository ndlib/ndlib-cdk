import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert'
import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline'
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam'
import { Stack } from '@aws-cdk/core'
import { NewmanRunner } from '../src'
import { FakeSourceAction } from './fake-source-action'

describe('NewmanRunner', () => {
  test('does not error with minimal props', () => {
    const stack = new Stack()
    new NewmanRunner(stack, 'TestProject', {
      sourceArtifact: new Artifact(),
      collectionPath: 'collection.json',
      collectionVariables: {},
    })
    expectCDK(stack).to(
      haveResourceLike('AWS::CodeBuild::Project', {
        Source: {
          BuildSpec: // eslint-disable-next-line max-len
            '{\n  "version": "0.2",\n  "phases": {\n    "install": {\n      "runtime-versions": {\n        "nodejs": "14.x"\n      },\n      "commands": [\n        "npm install -g newman@5.2.2",\n        "echo \\"Ensure that the Newman spec is readable\\"",\n        "chmod 755 collection.json"\n      ]\n    },\n    "build": {\n      "commands": [\n        "newman run collection.json "\n      ]\n    }\n  }\n}',
          Type: 'CODEPIPELINE',
        },
      }),
    )
  })

  describe('with more props', () => {
    const stack = new Stack()
    const sourceArtifact = new Artifact()
    const pipeline = new Pipeline(stack, 'CodePipeline', {
      stages: [
        {
          stageName: 'Source',
          actions: [
            new FakeSourceAction({
              actionName: 'Source',
              output: sourceArtifact,
            }),
          ],
        },
      ],
    })

    const newmanRunner = new NewmanRunner(stack, 'TestProject', {
      sourceArtifact: sourceArtifact,
      collectionPath: 'test/newman/collection.json',
      collectionVariables: {
        hostname: 'https://www.example.com',
        foo: 'bar',
      },
      actionName: 'MySmokeTestAction',
      runOrder: 90,
      role: new Role(stack, 'ExampleRole', {
        assumedBy: new ServicePrincipal('codebuild.amazonaws.com'),
      }),
    })
    pipeline.addStage({
      stageName: 'Stage',
      actions: [newmanRunner.action],
    })

    test('creates a codebuild project with props', () => {
      expectCDK(stack).to(
        haveResourceLike('AWS::CodeBuild::Project', {
          Environment: {
            Image: 'aws/codebuild/standard:5.0',
          },
          ServiceRole: {
            'Fn::GetAtt': ['ExampleRole576372CE', 'Arn'],
          },
          Source: {
            BuildSpec: // eslint-disable-next-line max-len
              '{\n  "version": "0.2",\n  "phases": {\n    "install": {\n      "runtime-versions": {\n        "nodejs": "14.x"\n      },\n      "commands": [\n        "npm install -g newman@5.2.2",\n        "echo \\"Ensure that the Newman spec is readable\\"",\n        "chmod 755 test/newman/collection.json"\n      ]\n    },\n    "build": {\n      "commands": [\n        "newman run test/newman/collection.json --env-var hostname=\\"https://www.example.com\\" --env-var foo=\\"bar\\""\n      ]\n    }\n  }\n}',
            Type: 'CODEPIPELINE',
          },
        }),
      )
    })

    test('creates an action for the codebuild project in a pipeline', () => {
      expectCDK(stack).to(
        haveResourceLike('AWS::CodePipeline::Pipeline', {
          Stages: [
            {
              Actions: [
                {
                  ActionTypeId: {
                    Category: 'Source',
                    Owner: 'AWS',
                    Provider: 'Fake',
                  },
                  Name: 'Source',
                },
              ],
            },
            {
              Actions: [
                {
                  ActionTypeId: {
                    Category: 'Build',
                    Owner: 'AWS',
                    Provider: 'CodeBuild',
                  },
                  Configuration: {
                    ProjectName: {
                      Ref: 'TestProject2F1D5F9F',
                    },
                  },
                  Name: 'MySmokeTestAction',
                  RunOrder: 90,
                },
              ],
            },
          ],
        }),
      )
    })
  })
})
