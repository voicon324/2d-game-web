import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ReplayPlayerPage from '../src/pages/ReplayPlayerPage';
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

const mockReplay = {
  _id: 'replay123',
  match: 'match123',
  gameSlug: 'caro',
  players: [
    { id: 'p1', username: 'Player1', avatar: null },
    { id: 'p2', username: 'Player2', avatar: null }
  ],
  initialState: { board: [], currentTurn: 0 },
  actions: [
    { playerId: 'p1', action: { type: 'PLACE', x: 7, y: 7 }, timestamp: 1000, resultState: { board: [[7, 7]] } },
    { playerId: 'p2', action: { type: 'PLACE', x: 8, y: 8 }, timestamp: 2500, resultState: { board: [[7, 7], [8, 8]] } },
    { playerId: 'p1', action: { type: 'PLACE', x: 7, y: 8 }, timestamp: 4000, resultState: { board: [[7, 7], [8, 8], [7, 8]] } }
  ],
  result: { winnerId: 'p1', reason: 'Five in a row', isDraw: false },
  duration: 30000,
  game: { name: 'Cờ Caro', slug: 'caro', type: 'turn-based' }
};

describe('ReplayPlayerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRoute = (matchId = 'match123') => {
    return render(
      <MemoryRouter initialEntries={[`/replay/${matchId}`]}>
        <ThemeProvider>
          <Routes>
            <Route path="/replay/:matchId" element={<ReplayPlayerPage />} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  test('shows loading state initially', async () => {
    global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithRoute();
    
    expect(screen.getByText(/loading replay/i)).toBeInTheDocument();
  });

  test('shows error state when replay not found', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Not found' })
    });

    renderWithRoute('nonexistent');
    
    await waitFor(() => {
      expect(screen.getByText('Replay Not Found')).toBeInTheDocument();
    });
  });

  test('displays replay page title', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockReplay)
    });

    renderWithRoute();
    
    await waitFor(() => {
      expect(screen.getByText('Match Replay')).toBeInTheDocument();
    });
  });

  test('shows playback controls', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockReplay)
    });

    renderWithRoute();
    
    await waitFor(() => {
      // Play button should be visible
      expect(screen.getByTitle('Restart')).toBeInTheDocument();
      expect(screen.getByTitle('Previous action')).toBeInTheDocument();
      expect(screen.getByTitle('Next action')).toBeInTheDocument();
    });
  });

  test('shows speed selector', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockReplay)
    });

    renderWithRoute();
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('1x')).toBeInTheDocument();
    });
  });

  test('shows action timeline', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockReplay)
    });

    renderWithRoute();
    
    await waitFor(() => {
      expect(screen.getByText('Action Timeline')).toBeInTheDocument();
      // Should show action entries
      expect(screen.getByText(/001/)).toBeInTheDocument();
      expect(screen.getByText(/002/)).toBeInTheDocument();
      expect(screen.getByText(/003/)).toBeInTheDocument();
    });
  });

  test('can change playback speed', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockReplay)
    });

    renderWithRoute();
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    const speedSelect = screen.getByRole('combobox');
    fireEvent.change(speedSelect, { target: { value: '2' } });
    
    expect(speedSelect.value).toBe('2');
  });

  test('displays Back link to profile', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockReplay)
    });

    renderWithRoute();
    
    await waitFor(() => {
      expect(screen.getByText('← Back')).toBeInTheDocument();
    });
  });

  test('shows match ID', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockReplay)
    });

    renderWithRoute();
    
    await waitFor(() => {
      expect(screen.getByText(/match id:/i)).toBeInTheDocument();
    });
  });
});
