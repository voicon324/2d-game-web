import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Toast from '../src/components/Toast';

describe('Toast Component', () => {
  it('renders when show is true', () => {
    render(<Toast show={true} title="Success" message="Operation completed" />);
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
  });

  it('does not render when show is false', () => {
    render(<Toast show={false} title="Hidden" message="Should not show" />);
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('renders different types', () => {
    const { rerender } = render(
      <Toast show={true} type="success" title="Success" message="Done" />
    );
    expect(screen.getByText('check_circle')).toBeInTheDocument();
    
    rerender(<Toast show={true} type="error" title="Error" message="Failed" />);
    expect(screen.getByText('error')).toBeInTheDocument();
    
    rerender(<Toast show={true} type="warning" title="Warning" message="Caution" />);
    expect(screen.getByText('warning')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(
      <Toast show={true} title="Closable" message="Click to close" onClose={onClose} />
    );
    
    const closeButton = screen.getByRole('button');
    await closeButton.click();
    
    expect(onClose).toHaveBeenCalled();
  });

  it('auto-closes after duration', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    
    render(
      <Toast show={true} title="Auto" message="Closes in 3s" duration={3000} onClose={onClose} />
    );
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
