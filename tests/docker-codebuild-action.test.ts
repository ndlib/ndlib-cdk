import { expect, haveResourceLike } from '@aws-cdk/assert'
import { Stack } from '@aws-cdk/core'
import { BuildSpec, Project, PipelineProject } from '@aws-cdk/aws-codebuild'
import { DockerCodeBuildAction } from '../src/index'

describe('PipelineProject Behavior', () => {
  test('Dont break default behavior', () => {
    const stack = new Stack()
    new PipelineProject(stack, 'Action')
    expect(stack).to(
      haveResourceLike('AWS::CodeBuild::Project', {
        Environment: {
          ComputeType: 'BUILD_GENERAL1_SMALL',
          Image: 'aws/codebuild/standard:1.0',
          ImagePullCredentialsType: 'CODEBUILD',
          PrivilegedMode: false,
          Type: 'LINUX_CONTAINER',
        },
      }),
    )
  })

  describe('Linux BuildImages', () => {
    test('Factory Method pulls provided image', () => {
      // given
      const stack = new Stack()
      const image = 'test-image:1.0.1'

      // when
      new PipelineProject(stack, 'test-project', {
        environment: {
          buildImage: DockerCodeBuildAction.fromLinuxDockerImage(stack, 'test-docker', {
            image: image,
            credentialsContextKeyName: '/test/credentials/path',
          }),
        },
      })

      // then
      expect(stack).to(
        haveResourceLike('AWS::CodeBuild::Project', {
          Environment: {
            Image: 'test-image:1.0.1',
            Type: 'LINUX_CONTAINER',
          },
        }),
      )
    })

    test('Factory method uses provided Secrets Manager path', () => {
      //given
      const secretsManagerPath = '/test/credentials/path'
      const stack = new Stack()

      //when
      new PipelineProject(stack, 'test-pipeline-project', {
        environment: {
          buildImage: DockerCodeBuildAction.fromLinuxDockerImage(stack, 'test-docker', {
            image: 'scratch',
            credentialsContextKeyName: secretsManagerPath,
          }),
        },
      })

      //then
      expect(stack).to(
        haveResourceLike('AWS::CodeBuild::Project', {
          Environment: {
            RegistryCredential: {
              Credential: '/test/credentials/path',
              CredentialProvider: 'SECRETS_MANAGER',
            },
            Type: 'LINUX_CONTAINER',
          },
        }),
      )
    })
  })

  describe('Windows BuildImages', () => {
    test('Factory method pulls provided image', () => {
      //given
      const image = 'test-image:1.0.1'
      const stack = new Stack()

      //when
      new PipelineProject(stack, 'test-pipeline-project', {
        environment: {
          buildImage: DockerCodeBuildAction.fromWindowsDockerImage(stack, 'test-docker', {
            image,
            credentialsContextKeyName: '/test/credentials/path',
          }),
        },
      })

      //then
      expect(stack).to(
        haveResourceLike('AWS::CodeBuild::Project', {
          Environment: {
            Image: 'test-image:1.0.1',
            Type: 'WINDOWS_CONTAINER',
          },
        }),
      )
    })

    test('Factory method uses provided Secrets Manager path', () => {
      //given
      const secretsManagerPath = '/test/credentials/path'
      const stack = new Stack()

      //when
      new PipelineProject(stack, 'test-project', {
        environment: {
          buildImage: DockerCodeBuildAction.fromWindowsDockerImage(stack, 'test-docker', {
            image: 'scratch',
            credentialsContextKeyName: secretsManagerPath,
          }),
        },
      })

      //then
      expect(stack).to(
        haveResourceLike('AWS::CodeBuild::Project', {
          Environment: {
            RegistryCredential: {
              Credential: '/test/credentials/path',
              CredentialProvider: 'SECRETS_MANAGER',
            },
            Type: 'WINDOWS_CONTAINER',
          },
        }),
      )
    })
  })
})

describe('Project Behavior', () => {
  test('Dont break default behavior', () => {
    const stack = new Stack()
    new Project(stack, 'Action', {
      buildSpec: BuildSpec.fromObject({
        phases: {
          build: {
            commands: ['ls'],
          },
        },
        version: '0.2',
      }),
    })
    expect(stack).to(
      haveResourceLike('AWS::CodeBuild::Project', {
        Environment: {
          ComputeType: 'BUILD_GENERAL1_SMALL',
          Image: 'aws/codebuild/standard:1.0',
          ImagePullCredentialsType: 'CODEBUILD',
          PrivilegedMode: false,
          Type: 'LINUX_CONTAINER',
        },
      }),
    )
  })

  describe('Linux BuildImages', () => {
    test('Factory method pulls provided image', () => {
      //given
      const image = 'test-image:1.0.1'
      const stack = new Stack()

      //when
      new Project(stack, 'test-project', {
        buildSpec: BuildSpec.fromObject({
          phases: {
            build: {
              commands: ['ls'],
            },
          },
          version: '0.2',
        }),
        environment: {
          buildImage: DockerCodeBuildAction.fromLinuxDockerImage(stack, 'test-docker', {
            image,
            credentialsContextKeyName: '/test/credentials',
          }),
        },
      })

      //then
      expect(stack).to(
        haveResourceLike('AWS::CodeBuild::Project', {
          Environment: {
            ComputeType: 'BUILD_GENERAL1_SMALL',
            Image: 'test-image:1.0.1',
            ImagePullCredentialsType: 'SERVICE_ROLE',
            PrivilegedMode: false,
            Type: 'LINUX_CONTAINER',
          },
        }),
      )
    })
    test('Factory method uses provided Secrets Manager path', () => {
      //given
      const secretsManagerPath = '/test/credentials/path'
      const stack = new Stack()

      //when
      new Project(stack, 'test-project', {
        buildSpec: BuildSpec.fromObject({
          phases: {
            build: {
              commands: ['ls'],
            },
          },
          version: '0.2',
        }),
        environment: {
          buildImage: DockerCodeBuildAction.fromLinuxDockerImage(stack, 'test-docker', {
            image: 'scratch',
            credentialsContextKeyName: secretsManagerPath,
          }),
        },
      })

      //then
      expect(stack).to(
        haveResourceLike('AWS::CodeBuild::Project', {
          Environment: {
            ComputeType: 'BUILD_GENERAL1_SMALL',
            Image: 'scratch',
            ImagePullCredentialsType: 'SERVICE_ROLE',
            PrivilegedMode: false,
            RegistryCredential: {
              Credential: '/test/credentials/path',
              CredentialProvider: 'SECRETS_MANAGER',
            },
            Type: 'LINUX_CONTAINER',
          },
        }),
      )
    })
  })
  describe('Windows BuildImages', () => {
    test('Factory method pulls provided image', () => {
      //given
      const image = 'test-image:1.0.1'
      const stack = new Stack()

      //when
      new Project(stack, 'test-pipeline-project', {
        buildSpec: BuildSpec.fromObject({
          phases: {
            build: {
              commands: ['ls'],
            },
          },
          version: '0.2',
        }),
        environment: {
          buildImage: DockerCodeBuildAction.fromWindowsDockerImage(stack, 'test-docker', {
            image,
            credentialsContextKeyName: '/test/credentials/path',
          }),
        },
      })

      //then
      expect(stack).to(
        haveResourceLike('AWS::CodeBuild::Project', {
          Environment: {
            Image: 'test-image:1.0.1',
            Type: 'WINDOWS_CONTAINER',
          },
        }),
      )
    })

    test('Factory method uses provided Secrets Manager path', () => {
      //given
      const secretsManagerPath = '/test/credentials/path'
      const stack = new Stack()

      //when
      new Project(stack, 'test-project', {
        buildSpec: BuildSpec.fromObject({
          phases: {
            build: {
              commands: ['ls'],
            },
          },
          version: '0.2',
        }),
        environment: {
          buildImage: DockerCodeBuildAction.fromWindowsDockerImage(stack, 'test-docker', {
            image: 'scratch',
            credentialsContextKeyName: secretsManagerPath,
          }),
        },
      })

      //then
      expect(stack).to(
        haveResourceLike('AWS::CodeBuild::Project', {
          Environment: {
            RegistryCredential: {
              Credential: '/test/credentials/path',
              CredentialProvider: 'SECRETS_MANAGER',
            },
            Type: 'WINDOWS_CONTAINER',
          },
        }),
      )
    })
  })
})
