import { DockerImageOptions, IBuildImage, LinuxBuildImage, WindowsBuildImage } from '@aws-cdk/aws-codebuild'
import { Secret } from '@aws-cdk/aws-secretsmanager'
import cdk = require('@aws-cdk/core')

export interface IDockerCodeBuildAction extends DockerImageOptions {
  /**
   * Defines the image and tag of a container image on DockerHub to be used in a CodeBuild Project
   *
   * Can be defined as `image` or `image:tag`
   */
  readonly image: string
  /**
   * Defines the path in Secrets Manager where DockerHub Credentials are stored.
   *
   * @see  https://aws.amazon.com/premiumsupport/knowledge-center/codebuild-docker-pull-image-error/
   */
  readonly credentialsContextKeyName: string
}
export class DockerCodeBuildAction {
  public static fromLinuxDockerImage(scope: cdk.Construct, id: string, options: IDockerCodeBuildAction): IBuildImage {
    return LinuxBuildImage.fromDockerRegistry(options.image, {
      secretsManagerCredentials: Secret.fromSecretNameV2(scope, `${id}-Credentials`, options.credentialsContextKeyName),
    })
  }

  /**
   * Returns a Windows Build Image using the provided DockerHub Image tag and auth credentials
   *
   * @param scope The scope that this image is being created within
   * @param id A unique identifier for this image
   * @param credentialsContextKeyName A required path to look for the credentials secret in Secrets Manager.
   * @param image The DockerHub image that should be used for this action
   */

  public static fromWindowsDockerImage(scope: cdk.Construct, id: string, options: IDockerCodeBuildAction): IBuildImage {
    return WindowsBuildImage.fromDockerRegistry(options.image, {
      secretsManagerCredentials: Secret.fromSecretNameV2(scope, `${id}-Credentials`, options.credentialsContextKeyName),
    })
  }
}
