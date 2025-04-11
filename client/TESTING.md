# Testing Guide for JamesCRM Client

This document provides information on how to run tests and add new tests to the JamesCRM client application.

## Testing Setup

The JamesCRM project has two testing systems:

1. **Main Test Suite**: Located in the `/tests` directory at the project root, containing 1000+ tests
   - Uses Jest as the test runner
   - Organized into unit, integration, and end-to-end tests
   - Provides comprehensive coverage of the entire application

2. **Client-Specific Tests**: Located in the `/client/src/__tests__` directory
   - Uses Vitest as the test runner (compatible with Vite)
   - React Testing Library for testing React components
   - JSDOM for simulating a browser environment

## Running Tests

### Running All Tests

To run both the main test suite and the client-specific tests:

```bash
# From the client directory
npm test
```

This will first run the client-specific Vitest tests, then run the main Jest test suite.

### Running Only Client-Specific Tests

```bash
# Run only the client-specific tests
npm run test:vitest

# Run client tests in watch mode (tests will re-run when files change)
npm run test:watch

# Run client tests with coverage report
npm run test:coverage
```

### Running Only the Main Test Suite

```bash
# From the project root
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Test Structure

Tests are located in the `src/__tests__` directory. Each test file should follow the naming convention of `ComponentName.test.jsx`.

## Writing Tests

### Basic Component Test

Here's a basic example of testing a component:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../path/to/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Testing User Interactions

To test user interactions like clicking buttons or filling forms:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Form from '../path/to/Form';

describe('Form', () => {
  it('handles form submission', () => {
    const mockSubmit = vi.fn();
    render(<Form onSubmit={mockSubmit} />);

    // Fill form fields
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Check if submission handler was called
    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });
});
```

### Testing Components with Router

For components that use React Router:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NavComponent from '../path/to/NavComponent';

describe('NavComponent', () => {
  it('renders navigation links', () => {
    render(
      <BrowserRouter>
        <NavComponent />
      </BrowserRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });
});
```

### Mocking Dependencies

To mock dependencies like API calls:

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import UserProfile from '../path/to/UserProfile';
import * as userService from '../services/userService';

// Mock the service
vi.mock('../services/userService');

describe('UserProfile', () => {
  it('displays user data', async () => {
    // Setup mock return value
    userService.getUser.mockResolvedValue({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com'
    });

    render(<UserProfile userId={1} />);

    // Wait for async operations to complete
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    // Verify the service was called correctly
    expect(userService.getUser).toHaveBeenCalledWith(1);
  });
});
```

## Best Practices

1. **Test behavior, not implementation**: Focus on what the component does, not how it does it.
2. **Use semantic queries**: Prefer queries like `getByRole`, `getByLabelText`, and `getByText` over `getByTestId`.
3. **Keep tests isolated**: Each test should be independent and not rely on the state from other tests.
4. **Mock external dependencies**: API calls, browser APIs, etc. should be mocked.
5. **Test edge cases**: Include tests for error states, loading states, and boundary conditions.

## Troubleshooting

If you encounter issues with tests:

1. Check that all dependencies are installed
2. Verify that the component is being rendered correctly
3. Use `screen.debug()` to see the rendered HTML
4. Check for console errors during test execution

For more help, refer to the documentation for:
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
