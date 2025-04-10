/**
 * Simple tests to demonstrate GitHub Actions workflow
 */

// Test 1: Basic addition
test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3);
});

// Test 2: String concatenation
test('concatenates "Hello" and "World"', () => {
  expect('Hello' + 'World').toBe('HelloWorld');
});

// Test 3: Array operations
test('array contains the correct elements', () => {
  const array = ['a', 'b', 'c'];
  expect(array).toContain('b');
  expect(array.length).toBe(3);
});
