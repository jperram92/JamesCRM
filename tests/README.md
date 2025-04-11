# JamesCRM Testing Repository

This directory contains all tests for the JamesCRM application, including unit tests, integration tests, and end-to-end tests.

## Test Structure

- `unit/`: Unit tests for individual components, functions, and modules
  - `backend/`: Backend unit tests
  - `frontend/`: Frontend unit tests
- `integration/`: Tests that verify the interaction between different parts of the application
- `e2e/`: End-to-end tests that simulate user flows
- `mocks/`: Mock data and services for testing
- `config/`: Test configuration files
- `utils/`: Test utilities and helpers

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run backend unit tests
npm run test:unit:backend

# Run frontend unit tests
npm run test:unit:frontend
```

### Integration Tests

```bash
# Run all integration tests
npm run test:integration
```

### End-to-End Tests

```bash
# Run all end-to-end tests
npm run test:e2e
```

### All Tests

```bash
# Run all tests
npm run test
```

## Writing Tests

### Unit Tests

Unit tests should be small, focused, and test a single unit of functionality. They should be fast and not depend on external services.

Example:

```javascript
// tests/unit/backend/controllers/userController.test.js
const { getUserById } = require('../../../../server/src/controllers/users');
const { User } = require('../../../../server/src/models');
const httpMocks = require('node-mocks-http');

jest.mock('../../../../server/src/models');

describe('User Controller', () => {
  describe('getUserById', () => {
    it('should return a user when a valid ID is provided', async () => {
      // Arrange
      const mockUser = { id: 1, first_name: 'John', last_name: 'Doe' };
      User.findByPk.mockResolvedValue(mockUser);
      
      const req = httpMocks.createRequest({
        params: { id: 1 }
      });
      const res = httpMocks.createResponse();
      
      // Act
      await getUserById(req, res);
      
      // Assert
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockUser);
    });
  });
});
```

### Integration Tests

Integration tests verify that different parts of the application work together correctly.

Example:

```javascript
// tests/integration/api/users.test.js
const request = require('supertest');
const app = require('../../../server/src/app');
const { sequelize } = require('../../../server/src/models');

describe('User API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });
  
  afterAll(async () => {
    await sequelize.close();
  });
  
  describe('GET /api/users/:id', () => {
    it('should return a user when a valid ID is provided', async () => {
      // Create a test user
      const user = await User.create({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      });
      
      // Make request
      const response = await request(app)
        .get(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', user.id);
    });
  });
});
```

### End-to-End Tests

End-to-end tests simulate user flows and verify that the application works correctly from the user's perspective.

Example:

```javascript
// tests/e2e/flows/authentication.test.js
describe('Authentication Flow', () => {
  it('should allow a user to log in', async () => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // Fill in login form
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Assert that we're redirected to the dashboard
    await page.waitForNavigation();
    expect(page.url()).toContain('/dashboard');
  });
});
```

## Best Practices

1. **Isolation**: Tests should be isolated from each other and not depend on the state of other tests.
2. **Mocking**: Use mocks for external dependencies to ensure tests are fast and reliable.
3. **Naming**: Use descriptive names for test files and test cases.
4. **Assertions**: Make specific assertions about the expected behavior.
5. **Coverage**: Aim for high test coverage, especially for critical paths.
