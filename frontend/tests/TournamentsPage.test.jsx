import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TournamentsPage from '../src/pages/TournamentsPage';
import api from '../src/services/api';
import { ThemeProvider } from '../src/context/ThemeContext';
import { vi } from 'vitest';

vi.mock('../src/services/api', () => ({
  default: {
    tournaments: {
      getAll: vi.fn(),
      join: vi.fn(),
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

describe('TournamentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders list of tournaments', async () => {
    const mockTournaments = [
      { 
        _id: '1', 
        name: 'Summer Championship', 
        game: { name: 'Pixel Dots' }, 
        status: 'active',
        prize: '$500', 
        participants: [],
        entryFee: 'Free'
      },
      { 
        _id: '2', 
        name: 'Winter Blitz', 
        game: { name: 'Chess' }, 
        status: 'upcoming', 
        prize: '$1000', 
        participants: [],
        entryFee: '100 Coins'
      }
    ];
    
    api.tournaments.getAll.mockResolvedValue(mockTournaments);

    render(
      <MemoryRouter>
        <ThemeProvider>
          <TournamentsPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Initial loading state or direct render
    expect(await screen.findByText('Summer Championship')).toBeInTheDocument();
    expect(screen.getByText('Winter Blitz')).toBeInTheDocument();
    expect(screen.getByText('Pixel Dots')).toBeInTheDocument();
  });

  test('handles joining a tournament', async () => {
    const mockTournaments = [
      { 
        _id: '1', 
        name: 'Open Cup', 
        game: { name: 'Pixel Dots' }, 
        status: 'upcoming', 
        prize: '$100', 
        participants: [],
        entryFee: 'Free'
      }
    ];

    api.tournaments.getAll.mockResolvedValue(mockTournaments);
    api.tournaments.join.mockResolvedValue({ message: 'Joined successfully' });

    // Mock window interactions
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockImplementation(() => true);

    render(
      <MemoryRouter>
        <ThemeProvider>
          <TournamentsPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Wait for render
    await screen.findByText('Open Cup');
    
    // Find Join button (Register Now for upcoming)
    const joinButtons = screen.getAllByText('Register Now');
    fireEvent.click(joinButtons[0]);

    await waitFor(() => {
      expect(api.tournaments.join).toHaveBeenCalledWith('1');
    });
  });
});
