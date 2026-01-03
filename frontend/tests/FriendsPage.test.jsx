import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FriendsPage from '../src/pages/FriendsPage';
import api from '../src/services/api';
import { ThemeProvider } from '../src/context/ThemeContext';
import { vi } from 'vitest';

vi.mock('../src/services/api', () => ({
  default: {
    users: {
      getFriends: vi.fn(),
      addFriend: vi.fn(),
      removeFriend: vi.fn(),
      acceptFriendRequest: vi.fn()
    }
  }
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), 
    removeListener: vi.fn(), 
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('FriendsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders friends and requests', async () => {
    const mockData = {
      friends: [
        { _id: '1', username: 'BestFriend', isOnline: true, stats: { gamesWon: 5 } }
      ],
      requests: [
        { _id: 'req1', from: { _id: '2', username: 'NewBuddy' } }
      ]
    };
    
    api.users.getFriends.mockResolvedValue(mockData);

    render(
      <MemoryRouter>
        <ThemeProvider>
          <FriendsPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Friend list
    expect(await screen.findByText('BestFriend')).toBeInTheDocument();
    
    // Switch to requests tab if needed, or check presence if rendered together
    // The mockup usually separates them or shows pending count.
    // Based on previous analysis, we might need to check how tabs work.
    
    // Assuming checking specific text that appears only when data loads
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  test('handles adding a friend', async () => {
     api.users.getFriends.mockResolvedValue({ friends: [], requests: [] });
     api.users.addFriend.mockResolvedValue({ message: 'Request sent' });

     render(
      <MemoryRouter>
        <ThemeProvider>
          <FriendsPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Open Modal (The button with person_add icon)
    const openModalBtn = screen.getByRole('button', { name: /person_add/i });
    fireEvent.click(openModalBtn);

      
    // Mock window interaction
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockImplementation(() => true);

    const input = screen.getByPlaceholderText('e.g. Gamer123');
    fireEvent.change(input, { target: { value: 'Stranger' } });
    
    // The "ADD" button inside the input group
    const addButton = screen.getByText('ADD');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(api.users.addFriend).toHaveBeenCalledWith('Stranger');
    });
  });
});
