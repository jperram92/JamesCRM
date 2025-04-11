/**
 * Simple test file to verify Jest setup
 */

describe('Simple Tests', () => {
  test('true should be true', () => {
    expect(true).toBe(true);
  });

  test('1 + 1 should equal 2', () => {
    expect(1 + 1).toBe(2);
  });

  test('string comparison should work', () => {
    expect('hello').toBe('hello');
  });

  test('array comparison should work', () => {
    expect([1, 2, 3]).toEqual([1, 2, 3]);
  });

  test('object comparison should work', () => {
    expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 });
  });
});
