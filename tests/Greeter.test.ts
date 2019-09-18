import { Greeter } from '../src/index';
test('World Greeter', () => {
  expect(Greeter('World')).toBe('Hello World');
});