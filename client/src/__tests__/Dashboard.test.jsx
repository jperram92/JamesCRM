import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';

describe('Dashboard component', () => {
  it('renders dashboard correctly', () => {
    render(<Dashboard />);
    
    // Check if important elements are rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome to JamesCRM Dashboard')).toBeInTheDocument();
  });
});
