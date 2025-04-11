import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { BrowserRouter } from 'react-router-dom';

describe('App component', () => {
  it('renders without crashing', () => {
    // Wrap with BrowserRouter since App likely uses React Router
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // This is a basic test that just checks if the component renders
    expect(document.body).toBeDefined();
  });
});
