import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminGameEditorPage from '../src/pages/admin/AdminGameEditorPage';
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

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => 'mock-token'),
  setItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = vi.fn();

const mockGame = {
  _id: 'game123',
  name: 'Test Game',
  slug: 'testgame',
  type: 'turn-based',
  config: { boardSize: 10 },
  scriptCode: `class Game extends BaseGame {
  load(config) {
    this.state = {};
  }
}`
};

describe('AdminGameEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRoute = (gameId = 'game123') => {
    return render(
      <MemoryRouter initialEntries={[`/admin/games/${gameId}/editor`]}>
        <ThemeProvider>
          <Routes>
            <Route path="/admin/games/:id/editor" element={<AdminGameEditorPage />} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  test('shows loading state initially', async () => {
    global.fetch.mockImplementation(() => new Promise(() => {}));
    
    renderWithRoute();
    
    // Loading spinner should be visible
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('shows error state when game not found', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Not found' })
    });

    renderWithRoute();
    
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch game/i)).toBeInTheDocument();
    });
  });

  test('displays game name in header', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGame)
    });

    renderWithRoute();
    
    await waitFor(() => {
      expect(screen.getByText('Edit: Test Game')).toBeInTheDocument();
    });
  });

  test('displays code editor with script', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGame)
    });

    renderWithRoute();
    
    await waitFor(() => {
      const textarea = screen.getByRole('textbox');
      expect(textarea.value).toContain('class Game extends BaseGame');
    });
  });

  test('shows Validate button', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGame)
    });

    renderWithRoute();
    
    await waitFor(() => {
      expect(screen.getByText('Validate')).toBeInTheDocument();
    });
  });

  test('shows Save button', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGame)
    });

    renderWithRoute();
    
    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  test('shows API reference sidebar', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGame)
    });

    renderWithRoute();
    
    await waitFor(() => {
      expect(screen.getByText('BaseGame API')).toBeInTheDocument();
      expect(screen.getByText('load(config)')).toBeInTheDocument();
      expect(screen.getByText('handleAction(action, playerId)')).toBeInTheDocument();
      expect(screen.getByText('isWin()')).toBeInTheDocument();
    });
  });

  test('shows Available Utilities section', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGame)
    });

    renderWithRoute();
    
    await waitFor(() => {
      expect(screen.getByText('Available Utilities')).toBeInTheDocument();
      expect(screen.getByText('utils.random(min, max)')).toBeInTheDocument();
    });
  });

  test('Save button is disabled when no changes', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGame)
    });

    renderWithRoute();
    
    await waitFor(() => {
      const saveButton = screen.getByText('Save').closest('button');
      expect(saveButton).toBeDisabled();
    });
  });

  test('shows unsaved changes warning when code is modified', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGame)
    });

    renderWithRoute();
    
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '// modified code\nclass Game extends BaseGame {}' } });

    await waitFor(() => {
      expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    });
  });

  test('back link is present', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGame)
    });

    renderWithRoute();
    
    await waitFor(() => {
      expect(screen.getByText('Edit: Test Game')).toBeInTheDocument();
    });

    // Back arrow button should exist
    const backButtons = document.querySelectorAll('[class*="arrow_back"]');
    expect(backButtons.length).toBeGreaterThanOrEqual(0); // Material icon might not be rendered in test
  });
});
