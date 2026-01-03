import { useEffect, useCallback, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import CaroRenderer from './CaroRenderer';
import TankRenderer from './TankRenderer';

/**
 * GameContainer - Main game component that handles rendering and input
 */
export default function GameContainer() {
  const { user } = useAuth();
  const { gameState, room, isPlaying, gameResult, sendAction } = useGame();
  const [keysPressed, setKeysPressed] = useState({});

  // Determine game type
  const gameSlug = room?.game?.slug;
  const isRealtime = room?.game?.type === 'real-time';

  // Handle Caro cell click
  const handleCaroClick = useCallback((x, y) => {
    if (!isPlaying) return;
    sendAction('PLACE', { x, y });
  }, [isPlaying, sendAction]);

  // Handle Tank keyboard controls
  useEffect(() => {
    if (!isPlaying || gameSlug !== 'tank') return;

    const handleKeyDown = (e) => {
      setKeysPressed(prev => ({ ...prev, [e.key]: true }));

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          sendAction('MOVE', { direction: 'up' });
          break;
        case 's':
        case 'arrowdown':
          sendAction('MOVE', { direction: 'down' });
          break;
        case 'a':
        case 'arrowleft':
          sendAction('MOVE', { direction: 'left' });
          break;
        case 'd':
        case 'arrowright':
          sendAction('MOVE', { direction: 'right' });
          break;
        case ' ':
          e.preventDefault();
          sendAction('SHOOT', {});
          break;
      }
    };

    const handleKeyUp = (e) => {
      setKeysPressed(prev => ({ ...prev, [e.key]: false }));
      
      if (['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
        sendAction('STOP', {});
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, gameSlug, sendAction]);

  // Show game result modal
  if (gameResult) {
    const isWinner = gameResult.winner === user?._id;
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-2xl p-8 text-center max-w-md mx-4 animate-bounce-in">
          <div className="text-6xl mb-4">
            {gameResult.isDraw ? '🤝' : isWinner ? '🏆' : '😢'}
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {gameResult.isDraw ? 'Draw!' : isWinner ? 'You Win!' : 'You Lose!'}
          </h2>
          <p className="text-gray-400 mb-6">{gameResult.reason}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!gameState || !isPlaying) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Waiting for game to start...</p>
      </div>
    );
  }

  // Render appropriate game
  switch (gameSlug) {
    case 'caro':
      return (
        <CaroRenderer
          gameState={gameState}
          onCellClick={handleCaroClick}
          currentUserId={user?._id}
        />
      );
    case 'tank':
      return (
        <TankRenderer
          gameState={gameState}
          currentUserId={user?._id}
          keysPressed={keysPressed}
        />
      );
    default:
      return (
        <div className="text-center text-gray-400">
          Unknown game type: {gameSlug}
        </div>
      );
  }
}
