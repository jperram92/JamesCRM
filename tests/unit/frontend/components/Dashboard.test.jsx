/**
 * Unit tests for Dashboard component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../../../../client/src/pages/Dashboard';

describe('Dashboard Component', () => {
  it('renders the dashboard header', () => {
    // Arrange & Act
    render(<Dashboard />);

    // Assert
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders the welcome message', () => {
    // Arrange & Act
    render(<Dashboard />);

    // Assert
    expect(screen.getByText('Welcome to JamesCRM Dashboard')).toBeInTheDocument();
  });

  it('has the correct layout structure', () => {
    // Arrange & Act
    const { container } = render(<Dashboard />);

    // Assert
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('.border-dashed')).toBeInTheDocument(); // Content area
  });
});
