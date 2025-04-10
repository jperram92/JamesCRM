/**
 * Simple test runner for GitHub Actions workflow tests
 */

console.log('Running GitHub Actions workflow tests...');

// Import and run the tests
require('./workflow.test');
require('./branch-protection.test');

console.log('All tests completed successfully! ✅');
