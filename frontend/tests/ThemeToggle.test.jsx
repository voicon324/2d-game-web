import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '../src/components/ThemeToggle';

// Mock the ThemeContext
const mockToggleTheme = vi.fn();
let mockIsDark = false;

vi.mock('../src/context/ThemeContext', () => ({
  useTheme: () => ({
    isDark: mockIsDark,
    toggleTheme: mockToggleTheme
  })
}));

describe('ThemeToggle Component', () => {
  it('renders toggle button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows dark_mode icon when in light mode (to switch to dark)', () => {
    render(<ThemeToggle />);
    // When in light mode (isDark=false), it shows the dark_mode icon to switch TO dark
    expect(screen.getByText('dark_mode')).toBeInTheDocument();
  });

  it('has correct aria-label', () => {
    render(<ThemeToggle />);
    expect(screen.getByLabelText('Toggle Dark Mode')).toBeInTheDocument();
  });

  it('calls toggleTheme when clicked', async () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('shows light_mode icon when in dark mode', () => {
    mockIsDark = true;
    render(<ThemeToggle />);
    expect(screen.getByText('light_mode')).toBeInTheDocument();
    mockIsDark = false; // Reset for other tests if needed
  });
});
