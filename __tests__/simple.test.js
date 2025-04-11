/**
 * Simple test file
 */

describe('Simple Tests', () => {
  it('should pass a simple test', () => {
    expect(true).toBe(true);
  });

  it('should pass a math test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should pass a string test', () => {
    expect('hello').toBe('hello');
  });

  it('should pass an array test', () => {
    expect([1, 2, 3]).toEqual([1, 2, 3]);
  });

  it('should pass an object test', () => {
    expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 });
  });
});
