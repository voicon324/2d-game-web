import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SpectatePage from '../src/pages/SpectatePage';
import api from '../src/services/api';
import { ThemeProvider } from '../src/context/ThemeContext';
import { vi } from 'vitest';

vi.mock('../src/services/api', () => ({
  default: {
    matches: {
      getLive: vi.fn(),
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

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SpectatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders live matches', async () => {
    const mockMatches = [
      {
        _id: '1',
        roomCode: 'ROOM1',
        game: { name: 'Pixel Dots', slug: 'caro' },
        players: [
          { user: { username: 'ProPlayer', stats: { gamesWon: 10 } } },
          { user: { username: 'Newbie', stats: { gamesWon: 1 } } }
        ],
        spectators: ['u1', 'u2'],
        status: 'playing'
      }
    ];
    
    api.matches.getLive.mockResolvedValue(mockMatches);

    render(
      <MemoryRouter>
        <ThemeProvider>
          <SpectatePage />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('Pixel Dots')).toBeInTheDocument();
    expect(screen.getByText('ProPlayer')).toBeInTheDocument();
    expect(screen.getByText('Newbie')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Viewer count
  });

  test('handles watch match navigation', async () => {
    const mockMatches = [
      {
        _id: '1',
        roomCode: 'ROOM1',
        game: { name: 'Pixel Dots', slug: 'caro' },
        players: [],
        status: 'playing'
      }
    ];

    api.matches.getLive.mockResolvedValue(mockMatches);

    render(
      <MemoryRouter>
        <ThemeProvider>
          <SpectatePage />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Wait for load
    await screen.findByText('Pixel Dots');

    const watchBtn = screen.getByText('Watch Match');
    fireEvent.click(watchBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/game?type=caro&room=ROOM1');
  });
});
