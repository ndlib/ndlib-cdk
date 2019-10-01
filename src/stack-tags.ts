import { ConstructNode, IAspect, IConstruct, Stack } from '@aws-cdk/core';

/**
 * Aspect that adds our expected stack tags to all stacks using values from context
 */
export class StackTags implements IAspect {
  public visit(node: IConstruct) {
    if (node instanceof Stack) {
      const projectName = this.getContext('projectName', node.node);
      // Not sure this makes sense to do for multistack applications, but for now it applies only
      // one description to all stacks. Perhaps this should just change to test if this tag was added
      const description = this.getContext('description', node.node);
      const contact = this.getContext('contact', node.node);
      const owner = this.getContext('owner', node.node);

      node.tags.setTag('ProjectName', projectName);
      node.tags.setTag('Name', node.stackName);
      node.tags.setTag('Contact', contact);
      node.tags.setTag('Owner', owner);
      node.tags.setTag('Description', description);
    }
  }

  /**
   *
   * @param keyName The name of the key to get from context
   * @param node The node to add errors to if the key does not exist
   */
  private getContext(keyName: string, node: ConstructNode): string {
    const value = node.tryGetContext(keyName);
    if (value === undefined) {
      node.addError(`Expected context key "${keyName}"`);
    }
    return value;
  }
}
