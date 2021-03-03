import { IBuildImage, LinuxBuildImage, PipelineProject, WindowsBuildImage } from '@aws-cdk/aws-codebuild';
import { Secret } from '@aws-cdk/aws-secretsmanager';
import cdk = require('@aws-cdk/core');

export class DockerCodeBuildAction extends PipelineProject {
  /**
   * Returns a LinuxBuild Image using the provided DockerHub Image tag and auth credentials
   *
   * @param scope The scope that this image is being created within
   * @param id A unique identifier for this image
   * @param credentialsContextKeyName A required path to look for the credentials secret in Secrets Manager.
   * @param image The DockerHub image that should be used for this action
   */

  public static fromLinuxDockerImage(
    scope: cdk.Construct,
    id: string,
    image: string,
    credentialsContextKeyName: string,
  ): IBuildImage {
    return LinuxBuildImage.fromDockerRegistry(image, {
      secretsManagerCredentials: Secret.fromSecretNameV2(scope, `${id}-Credentials`, credentialsContextKeyName),
    });
  }

  /**
   * Returns a Windows Build Image using the provided DockerHub Image tag and auth credentials
   *
   * @param scope The scope that this image is being created within
   * @param id A unique identifier for this image
   * @param credentialsContextKeyName A required path to look for the credentials secret in Secrets Manager.
   * @param image The DockerHub image that should be used for this action
   */

  public static fromWindowsDockerImage(
    scope: cdk.Construct,
    id: string,
    image: string,
    credentialsContextKeyName: string,
  ): IBuildImage {
    return WindowsBuildImage.fromDockerRegistry(image, {
      secretsManagerCredentials: Secret.fromSecretNameV2(scope, `${id}-Credentials`, credentialsContextKeyName),
    });
  }
}
