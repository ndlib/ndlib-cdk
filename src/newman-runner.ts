import { BuildSpec, LinuxBuildImage, PipelineProject, PipelineProjectProps } from '@aws-cdk/aws-codebuild'
import { Artifact } from '@aws-cdk/aws-codepipeline'
import { CodeBuildAction } from '@aws-cdk/aws-codepipeline-actions'
import { Role } from '@aws-cdk/aws-iam'
import { Construct } from '@aws-cdk/core'

export interface INewmanRunnerProps extends PipelineProjectProps {
  /**
   * The artifact which contains the newman collection file.
   */
  readonly sourceArtifact: Artifact

  /**
   * Path to the newman collection file the project should execute.
   */
  readonly collectionPath: string

  /**
   * Key-value pairs of environment variables to pass to the collection runner.
   */
  readonly collectionVariables: {
    [key: string]: string
  }

  /**
   * Display name for the action in a CodePipeline. Defaults to construct id.
   */
  readonly actionName?: string

  /**
   * Order in the pipeline stage when this action should take place. Defaults to 98 so that approval can come after.
   */
  readonly runOrder?: number

  /**
   * Role that should run the CodeBuild Project.
   * If omitted, a default service role may be created for the project. See AWS CDK documentation:
   * https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-codebuild.PipelineProject.html#role
   */
  readonly role?: Role
}

export class NewmanRunner {
  /**
   * CodeBuild project that will execute the newman collection.
   */
  public readonly project: PipelineProject

  /**
   * Action to be included in a CodePipeline stage.
   */
  public readonly action: CodeBuildAction

  constructor(scope: Construct, id: string, props: INewmanRunnerProps) {
    const environmentVars = Object.entries(props.collectionVariables).map(pair => `--env-var ${pair[0]}="${pair[1]}"`)
    const projectProps = {
      ...props,
      environment: {
        buildImage: LinuxBuildImage.STANDARD_5_0,
      },
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              nodejs: '14.x',
            },
            commands: [
              'npm install -g newman@5.2.2',
              'echo "Ensure that the Newman spec is readable"',
              `chmod 755 ${props.collectionPath}`,
            ],
          },
          build: {
            commands: [`newman run ${props.collectionPath} ${environmentVars.join(' ')}`],
          },
        },
      }),
    }
    this.project = new PipelineProject(scope, id, projectProps)

    this.action = new CodeBuildAction({
      input: props.sourceArtifact,
      project: this.project,
      actionName: props.actionName || id,
      runOrder: props.runOrder ?? 98,
    })
  }
}

export default NewmanRunner
