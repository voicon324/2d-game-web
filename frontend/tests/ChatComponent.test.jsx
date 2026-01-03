import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatComponent from '../src/components/ChatComponent';

describe('ChatComponent', () => {
  const mockUser = { username: 'testuser' };
  const mockMessages = [
    { sender: 'testuser', text: 'Hello!', timestamp: Date.now() },
    { sender: 'other', text: 'Hi there!', timestamp: Date.now() }
  ];
  const mockSendMessage = vi.fn();

  it('renders chat input when active', () => {
    render(
      <ChatComponent 
        isActive={true} 
        messages={[]} 
        onSendMessage={mockSendMessage}
        user={mockUser}
      />
    );
    expect(screen.getByTestId('chat-input')).toBeInTheDocument();
  });

  it('displays messages', () => {
    render(
      <ChatComponent 
        isActive={true} 
        messages={mockMessages} 
        onSendMessage={mockSendMessage}
        user={mockUser}
      />
    );
    expect(screen.getByText('Hello!')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('shows usernames for messages', () => {
    render(
      <ChatComponent 
        isActive={true} 
        messages={mockMessages} 
        onSendMessage={mockSendMessage}
        user={mockUser}
      />
    );
    expect(screen.getByText('other')).toBeInTheDocument();
  });

  it('calls onSendMessage when submitting', async () => {
    const user = userEvent.setup();
    render(
      <ChatComponent 
        isActive={true} 
        messages={[]} 
        onSendMessage={mockSendMessage}
        user={mockUser}
      />
    );
    
    const input = screen.getByTestId('chat-input');
    await user.type(input, 'New message{enter}');
    
    expect(mockSendMessage).toHaveBeenCalledWith('New message');
  });

  it('does not render when not active', () => {
    render(
      <ChatComponent 
        isActive={false} 
        messages={mockMessages} 
        onSendMessage={mockSendMessage}
        user={mockUser}
      />
    );
    expect(screen.queryByTestId('chat-input')).not.toBeInTheDocument();
  });

  it('shows empty state when no messages', () => {
    render(
      <ChatComponent 
        isActive={true} 
        messages={[]} 
        onSendMessage={mockSendMessage}
        user={mockUser}
      />
    );
    expect(screen.getByText('No messages yet')).toBeInTheDocument();
  });
});
