import { SynthUtils } from '@aws-cdk/assert';
import { NestedStack } from '@aws-cdk/aws-cloudformation';
import { App, Construct, Stack } from '@aws-cdk/core';
import { StackTags } from '../src/index';

test('StackTags can be applied as an Aspect', () => {
  expect(() => {
    const app = new App();
    app.node.applyAspect(new StackTags());
  }).not.toThrow();
});

test('StackTags visit adds all tags from context', () => {
  const stack = new Stack(undefined, 'testStack');
  const visitor = new StackTags();

  stack.node.setContext('owner', 'owner-value');
  stack.node.setContext('contact', 'contact-value');
  stack.node.setContext('projectName', 'projectName-value');
  stack.node.setContext('description', 'description-value');

  // Can assume cdk will properly call visit, so calling it
  // directly for this test
  visitor.visit(stack);
  const expectedTags = [
    { Key: 'Contact', Value: 'contact-value' },
    { Key: 'Description', Value: 'description-value' },
    { Key: 'Owner', Value: 'owner-value' },
    { Key: 'ProjectName', Value: 'projectName-value' },
    { Key: 'Name', Value: 'testStack' },
  ];
  expectedTags.forEach(kvp => expect(stack.tags.renderTags()).toContainEqual(kvp));
});

test('StackTags visit adds all tags on NestedStack', () => {
  const app = new App();
  const stack = new Stack(app, 'testStack');
  const nestedStack = new NestedStack(stack, 'testNestedStack');
  const visitor = new StackTags();

  nestedStack.node.setContext('owner', 'owner-value');
  nestedStack.node.setContext('contact', 'contact-value');
  nestedStack.node.setContext('projectName', 'projectName-value');
  nestedStack.node.setContext('description', 'description-value');

  // Can assume cdk will properly call visit, so calling it
  // directly for this test
  visitor.visit(nestedStack);
  const expectedTags = [
    { Key: 'Contact', Value: 'contact-value' },
    { Key: 'Description', Value: 'description-value' },
    { Key: 'Owner', Value: 'owner-value' },
    { Key: 'ProjectName', Value: 'projectName-value' },
    { Key: 'ParentStackName', Value: 'testStack' },
  ];
  expectedTags.forEach(kvp => expect(nestedStack.tags.renderTags()).toContainEqual(kvp));
});

test('StackTags visit ignores non-stacks', () => {
  const app = new App();
  const stack = new Stack(app, 'testStack');
  const construct = new Construct(stack, 'testConstruct');
  const visitor = new StackTags();
  app.node.applyAspect(visitor);
  jest.spyOn(visitor, 'visit');

  // Force cdk to do its processing and call the aspects
  SynthUtils.synthesize(stack);

  // Not really sure of a better way to test this other than to add a few additional types of things and make
  // sure it doesn't die inside of the visit function when it tries to add tags to an object that doesn't have tags
  expect(visitor.visit).toHaveBeenCalledWith(app);
  expect(visitor.visit).toHaveBeenCalledWith(stack);
  expect(visitor.visit).toHaveBeenCalledWith(construct);
});

test('StackTags visit adds an error to the stack node if "owner" does not exist in context', () => {
  const stack = new Stack();
  const visitor = new StackTags();

  stack.node.setContext('contact', 'contact-value');
  stack.node.setContext('projectName', 'projectName-value');
  stack.node.setContext('description', 'description-value');
  visitor.visit(stack);
  expect(stack.node.metadata).toContainEqual(expect.objectContaining({ type: 'aws:cdk:error' }));
});

test('StackTags visit adds an error to the stack node if "contact" does not exist in context', () => {
  const stack = new Stack();
  const visitor = new StackTags();

  stack.node.setContext('owner', 'owner-value');
  stack.node.setContext('projectName', 'projectName-value');
  stack.node.setContext('description', 'description-value');
  visitor.visit(stack);
  expect(stack.node.metadata).toContainEqual(expect.objectContaining({ type: 'aws:cdk:error' }));
});

test('StackTags visit adds an error to the stack node if "projectName" does not exist in context', () => {
  const stack = new Stack();
  const visitor = new StackTags();

  stack.node.setContext('owner', 'owner-value');
  stack.node.setContext('contact', 'contact-value');
  stack.node.setContext('description', 'description-value');
  visitor.visit(stack);
  expect(stack.node.metadata).toContainEqual(expect.objectContaining({ type: 'aws:cdk:error' }));
});

test('StackTags visit adds an error to the stack node if "description" does not exist in context', () => {
  const stack = new Stack();
  const visitor = new StackTags();

  stack.node.setContext('owner', 'owner-value');
  stack.node.setContext('contact', 'contact-value');
  stack.node.setContext('projectName', 'projectName-value');
  visitor.visit(stack);
  expect(stack.node.metadata).toContainEqual(expect.objectContaining({ type: 'aws:cdk:error' }));
});
