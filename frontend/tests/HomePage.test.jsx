import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../src/pages/HomePage';
import api from '../src/services/api';
import { ThemeProvider } from '../src/context/ThemeContext'; // Import this
import { vi } from 'vitest';

// Mock API
vi.mock('../src/services/api', () => ({
  default: {
    games: {
      getAll: vi.fn(),
      createRoom: vi.fn()
    },
    auth: {
      getCurrentUser: vi.fn().mockReturnValue({ username: 'testuser' })
    }
  }
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders games list after loading', async () => {
    const mockGames = [
      {
        _id: '1',
        name: 'Cờ Caro',
        slug: 'caro',
        description: 'Strategy game',
        type: 'turn-based',
        minPlayers: 2,
        maxPlayers: 2
      }
    ];
    
    api.games.getAll.mockResolvedValue(mockGames);

    render(
      <MemoryRouter>
        <ThemeProvider>
          <HomePage />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Initial loading state might be visible, but we wait for game
    await waitFor(() => {
      expect(screen.getByText('Cờ Caro')).toBeInTheDocument();
      expect(screen.getByText('Strategy game')).toBeInTheDocument();
    });
  });

  test('renders empty state if no games', async () => {
    api.games.getAll.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ThemeProvider>
          <HomePage />
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
        expect(screen.getByText('No games found')).toBeInTheDocument();
    });
  });
});
