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

describe('MatchmakingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
