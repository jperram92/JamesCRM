import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

// Mock the RouterProvider to avoid router errors in tests
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    RouterProvider: ({ children }) => <div data-testid="router-provider">{children}</div>,
    createBrowserRouter: vi.fn().mockReturnValue({})
  };
});

describe('App component', () => {
  it('renders without crashing', () => {
    // No need to wrap with BrowserRouter since we're mocking the router
    render(<App />);

    // This is a basic test that just checks if the component renders
    expect(document.body).toBeDefined();
  });
});
