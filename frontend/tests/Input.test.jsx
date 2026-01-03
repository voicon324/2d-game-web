import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../src/components/Input';

describe('Input Component', () => {
  it('renders with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('renders placeholder text', () => {
    render(<Input placeholder="Enter username" />);
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
  });

  it('shows input icon when provided', () => {
    render(<Input icon="person" />);
    expect(screen.getByText('person')).toBeInTheDocument();
  });

  it('handles text input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);
    
    const input = screen.getByPlaceholderText('Type here');
    await user.type(input, 'Hello World');
    
    expect(input).toHaveValue('Hello World');
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<Input type="password" placeholder="Password" />);
    
    const input = screen.getByPlaceholderText('Password');
    expect(input).toHaveAttribute('type', 'password');
    
    // Find and click the visibility toggle
    const toggleBtn = screen.getByRole('button');
    await user.click(toggleBtn);
    
    expect(input).toHaveAttribute('type', 'text');
  });

  it('displays error message when provided', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    render(<Input error="Error" placeholder="With error" />);
    const input = screen.getByPlaceholderText('With error');
    expect(input.className).toContain('border-red-500');
  });
});
