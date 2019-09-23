import { App, Stack } from "@aws-cdk/core";
import { StackTags } from '../src/index';

test('StackTags can be applied as an Aspect', () => {
  expect(() => {
    const app = new App();
    app.node.applyAspect(new StackTags())
  }).not.toThrow();
});

test('StackTags visit adds all tags from context', () => {
  const stack = new Stack();
  const visitor = new StackTags();

  stack.node.setContext('owner', 'owner-value');
  stack.node.setContext('contact', 'contact-value');
  stack.node.setContext('projectName', 'projectName-value');
  stack.node.setContext('description', 'description-value');

  // Can assume cdk will properly call visit, so calling it
  // directly for this test
  visitor.visit(stack);
  const expectedTags = [
    { 'Key': 'Contact', 'Value': 'contact-value' },
    { 'Key': 'Description', 'Value': 'description-value' },
    { 'Key': 'Owner', 'Value': 'owner-value' },
    { 'Key': 'ProjectName', 'Value': 'projectName-value' },
  ];
  expectedTags.forEach(kvp => expect(stack.tags.renderTags()).toContainEqual(kvp));
});

test('StackTags visit adds an error to the stack node if "owner" does not exist in context', () => {
  const stack = new Stack();
  const visitor = new StackTags();

  stack.node.setContext('contact', 'contact-value');
  stack.node.setContext('projectName', 'projectName-value');
  stack.node.setContext('description', 'description-value');
  visitor.visit(stack);
  expect(stack.node.metadata).toContainEqual(expect.objectContaining({ type: "aws:cdk:error" }));
});

test('StackTags visit adds an error to the stack node if "contact" does not exist in context', () => {
  const stack = new Stack();
  const visitor = new StackTags();

  stack.node.setContext('owner', 'owner-value');
  stack.node.setContext('projectName', 'projectName-value');
  stack.node.setContext('description', 'description-value');
  visitor.visit(stack);
  expect(stack.node.metadata).toContainEqual(expect.objectContaining({ type: "aws:cdk:error" }));
});

test('StackTags visit adds an error to the stack node if "projectName" does not exist in context', () => {
  const stack = new Stack();
  const visitor = new StackTags();

  stack.node.setContext('owner', 'owner-value');
  stack.node.setContext('contact', 'contact-value');
  stack.node.setContext('description', 'description-value');
  visitor.visit(stack);
  expect(stack.node.metadata).toContainEqual(expect.objectContaining({ type: "aws:cdk:error" }));
});

test('StackTags visit adds an error to the stack node if "description" does not exist in context', () => {
  const stack = new Stack();
  const visitor = new StackTags();

  stack.node.setContext('owner', 'owner-value');
  stack.node.setContext('contact', 'contact-value');
  stack.node.setContext('projectName', 'projectName-value');
  visitor.visit(stack);
  expect(stack.node.metadata).toContainEqual(expect.objectContaining({ type: "aws:cdk:error" }));
});