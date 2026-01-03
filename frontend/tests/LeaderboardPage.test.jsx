import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LeaderboardPage from '../src/pages/LeaderboardPage';
import api from '../src/services/api';
import { ThemeProvider } from '../src/context/ThemeContext';
import { vi } from 'vitest';

// Mocks
vi.mock('../src/services/api', () => ({
  default: {
    users: {
      getLeaderboard: vi.fn(),
    },
    auth: {
      getCurrentUser: vi.fn().mockReturnValue({ _id: '123', username: 'testuser' })
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

describe('LeaderboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders top players and list', async () => {
    const mockUsers = [
      { _id: '1', username: 'Player1', stats: { gamesWon: 100, gamesDraw: 5 } }, // Rank 1
      { _id: '2', username: 'Player2', stats: { gamesWon: 80, gamesDraw: 2 } },  // Rank 2
      { _id: '3', username: 'Player3', stats: { gamesWon: 60, gamesDraw: 0 } },  // Rank 3
      { _id: '4', username: 'Player4', stats: { gamesWon: 40, gamesDraw: 10 } } // List
    ];
    
    api.users.getLeaderboard.mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <ThemeProvider>
          <LeaderboardPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Initial loading
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    // After load
    expect(await screen.findByText('Player1')).toBeInTheDocument();
    
    // Check for other players
    expect(screen.getByText('Player2')).toBeInTheDocument(); 
    expect(screen.getByText('Player3')).toBeInTheDocument();
    expect(screen.getByText('Player4')).toBeInTheDocument();
    
    // Check Ranks
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  test('calculates scores correctly', async () => {
    const mockUsers = [
      { _id: '1', username: 'Scorer', stats: { gamesWon: 10, gamesDraw: 5 } } 
    ];
    api.users.getLeaderboard.mockResolvedValue(mockUsers);

    render(
      <MemoryRouter>
        <ThemeProvider>
          <LeaderboardPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Expecting 1,100 because (10 * 100) + (5 * 20) = 1100
    expect(await screen.findByText('1,100')).toBeInTheDocument();
  });
});
