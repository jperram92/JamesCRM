/**
 * Unit tests for Login component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../../../client/src/pages/Login';

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login form', () => {
    // Arrange & Act
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Assert
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles form submission with valid credentials', async () => {
    // Arrange
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Act
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'admin@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Assert
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays an error message with invalid credentials', async () => {
    // Arrange
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Act
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    // Arrange
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Act - Submit without filling in fields
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Assert - Form should not submit due to HTML validation
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
