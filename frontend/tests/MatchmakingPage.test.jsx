import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MatchmakingPage from '../src/pages/MatchmakingPage';
import { ThemeProvider } from '../src/context/ThemeContext';
import { vi } from 'vitest';

// Mock window.matchMedia
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

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => createMockToken()),
  setItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;

// Helper to create a valid-looking JWT
const createMockToken = () => {
  const payload = btoa(JSON.stringify({ id: 'user123', username: 'testuser' }));
  return `header.${payload}.signature`;
};



// Mock socket.io-client
const { mockSocket } = vi.hoisted(() => {
  const socket = {
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  };
  return { mockSocket: socket };
});

vi.mock('socket.io-client', () => {
  const mockIo = vi.fn(() => {
     return mockSocket;
  });
  return {
    io: mockIo,
    default: mockIo, // Handle default import case just in case
  };
});

describe('MatchmakingPage', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset individual mock methods
    mockSocket.on.mockReset();
    mockSocket.emit.mockReset();
    mockSocket.disconnect.mockReset();

    // Default socket implementation for events
    mockSocket.on.mockImplementation((event, callback) => {
      if (event === 'connect') {
        // execute immediately
        callback();
      }
    });

    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { _id: '1', name: 'Cờ Caro', slug: 'caro', type: 'turn-based' },
        { _id: '2', name: 'TicTacToe', slug: 'tictactoe', type: 'turn-based' }
      ])
    });
  });

  const renderWithProviders = (params = {}) => {
    return render(
      <MemoryRouter initialEntries={[params.route || '/matchmaking']}>
        <ThemeProvider>
          <MatchmakingPage />
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  test('renders matchmaking title', async () => {
    renderWithProviders();
    
    expect(screen.getByText('Matchmaking')).toBeInTheDocument();
  });

  test('loads and displays games in dropdown', async () => {
    renderWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('Cờ Caro')).toBeInTheDocument();
      expect(screen.getByText('TicTacToe')).toBeInTheDocument();
    });
  });

  test('Find Match button is disabled when no game selected', async () => {
    renderWithProviders();
    
    const button = screen.getByRole('button', { name: /find match/i });
    expect(button).toBeDisabled();
  });

  test('Find Match button enables after selecting a game', async () => {
    renderWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('Cờ Caro')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'caro' } });

    const button = screen.getByRole('button', { name: /find match/i });
    expect(button).not.toBeDisabled();
  });

  test('shows searching state when Find Match is clicked', async () => {
    renderWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('Cờ Caro')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'caro' } });

    const button = screen.getByRole('button', { name: /find match/i });
    fireEvent.click(button);

    // Verify socket connection
    await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith('matchmaking:join', expect.any(Object));
    });

    // Simulate joining event
    // Find the callback registered regarding 'matchmaking:joined'
    // We check all calls to .on()
    await waitFor(() => {
        const calls = mockSocket.on.mock.calls;
        const joinedCall = calls.find(call => call[0] === 'matchmaking:joined');
        expect(joinedCall).toBeDefined(); 
        if(joinedCall) {
             // Execute the callback
             joinedCall[1]({ rating: 1200 });
        }
    });

    await waitFor(() => {
      expect(screen.getByText(/searching for opponent/i)).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  test('returns to idle state when Cancel is clicked', async () => {
    renderWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('Cờ Caro')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'caro' } });

    const findButton = screen.getByRole('button', { name: /find match/i });
    fireEvent.click(findButton);


    // Simulate joining event to transition state
    await waitFor(() => {
        const calls = mockSocket.on.mock.calls;
        const joinedCall = calls.find(call => call[0] === 'matchmaking:joined');
        expect(joinedCall).toBeDefined();
         if (joinedCall) {
            joinedCall[1]({ rating: 1200 });
        }
    });

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /find match/i })).toBeInTheDocument();
    });
  });

  test('displays how matchmaking works info', async () => {
    renderWithProviders();
    
    expect(screen.getByText('How Matchmaking Works')).toBeInTheDocument();
    expect(screen.getByText(/players are matched based on their skill rating/i)).toBeInTheDocument();
  });
});
