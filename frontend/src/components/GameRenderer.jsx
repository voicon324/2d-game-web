import { useMemo, useCallback } from 'react';

/**
 * GameRenderer - Universal game board renderer
 * Renders different game types based on gameType and gameState
 * 
 * Supported game types:
 * - 'caro' / 'gomoku': Cờ Caro 15x15
 * - 'chess': Cờ vua 8x8
 * - 'dots': Dot matching game (default)
 * - 'tank': Real-time tank game (canvas-based)
 */

// Cell renderers for different game types
const CELL_RENDERERS = {
  // Caro/Gomoku: X and O
  caro: (value, isLastMove) => {
    if (value === null || value === 0) return null;
    const isX = value === 'X' || value === 1;
    return (
      <span className={`text-2xl font-bold ${isX ? 'text-pink-500' : 'text-blue-500'}`}>
        {isX ? '×' : '○'}
      </span>
    );
  },
  
  // Chess: Unicode pieces
  chess: (value) => {
    if (!value) return null;
    const pieces = {
      'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
      'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };
    const isWhite = value === value.toUpperCase();
    return (
      <span className={`text-3xl ${isWhite ? 'text-slate-100 drop-shadow-md' : 'text-slate-900'}`}>
        {pieces[value] || value}
      </span>
    );
  },
  
  // Default dots game
  dots: (value) => {
    const colors = {
      0: 'bg-white dark:bg-slate-700',
      1: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]',
      2: 'bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]',
      3: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]',
      4: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]',
      5: 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]',
      6: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
      7: 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]',
    };
    return <div className={`w-full h-full rounded-full ${colors[value] || colors[0]}`} />;
  }
};

// Board background styles for different games
const BOARD_STYLES = {
  caro: 'bg-amber-100 dark:bg-amber-900/30',
  chess: 'bg-amber-800',
  dots: 'bg-slate-200 dark:bg-slate-700'
};

export default function GameRenderer({
  gameType = 'dots',
  gameState = null,
  boardSize = 15,
  isMyTurn = false,
  onCellClick = () => {},
  disabled = false,
  className = ''
}) {
  // Get board from gameState or create empty
  const board = useMemo(() => {
    if (gameState?.board) return gameState.board;
    // Create empty board
    return Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
  }, [gameState?.board, boardSize]);
  
  const lastMove = gameState?.lastMove;
  const cellRenderer = CELL_RENDERERS[gameType] || CELL_RENDERERS.dots;
  const boardStyle = BOARD_STYLES[gameType] || BOARD_STYLES.dots;
  
  // Calculate cell size
  const cellSize = useMemo(() => {
    return Math.max(20, Math.min(40, 500 / boardSize));
  }, [boardSize]);
  
  // Handle cell click
  const handleClick = useCallback((x, y) => {
    if (disabled || !isMyTurn) return;
    const value = board[y]?.[x];
    if (value !== null && value !== 0) return; // Cell occupied
    onCellClick(x, y);
  }, [disabled, isMyTurn, board, onCellClick]);
  
  // Chess uses alternating colors
  const getCellBg = useCallback((x, y) => {
    if (gameType === 'chess') {
      const isLight = (x + y) % 2 === 0;
      return isLight ? 'bg-amber-200' : 'bg-amber-600';
    }
    if (gameType === 'caro') {
      return 'bg-amber-50 dark:bg-amber-800/50';
    }
    return 'bg-white dark:bg-slate-800';
  }, [gameType]);
  
  // Check if cell is highlighted (last move)
  const isHighlighted = useCallback((x, y) => {
    return lastMove?.x === x && lastMove?.y === y;
  }, [lastMove]);
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Turn indicator */}
      <div className="mb-4 text-center">
        {gameState ? (
          isMyTurn ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Your turn
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
              <span className="w-2 h-2 bg-slate-400 rounded-full" />
              Opponent's turn
            </span>
          )
        ) : (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
            Waiting for game...
          </span>
        )}
      </div>
      
      {/* Game board */}
      <div 
        className={`inline-grid p-1 rounded-lg shadow-lg ${boardStyle}`}
        style={{ 
          gridTemplateColumns: `repeat(${boardSize}, ${cellSize}px)`,
          gap: gameType === 'dots' ? '4px' : '1px'
        }}
      >
        {board.map((row, y) =>
          row.map((cell, x) => (
            <button
              key={`${x}-${y}`}
              onClick={() => handleClick(x, y)}
              disabled={disabled || !isMyTurn || (cell !== null && cell !== 0)}
              className={`
                flex items-center justify-center transition-all duration-150
                ${getCellBg(x, y)}
                ${isHighlighted(x, y) ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}
                ${gameType === 'dots' ? 'rounded-full' : 'rounded-sm'}
                ${!disabled && isMyTurn && (cell === null || cell === 0)
                  ? 'hover:bg-pink-100 dark:hover:bg-pink-900/30 cursor-pointer'
                  : 'cursor-default'
                }
                border border-slate-200/50 dark:border-slate-600/30
              `}
              style={{ 
                width: `${cellSize}px`, 
                height: `${cellSize}px`,
              }}
            >
              {cellRenderer(cell, isHighlighted(x, y))}
            </button>
          ))
        )}
      </div>
      
      {/* Legend based on game type */}
      {gameType === 'caro' && (
        <div className="mt-4 flex gap-6 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-pink-500 text-lg font-bold">×</span>
            <span>Player 1</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500 text-lg font-bold">○</span>
            <span>Player 2</span>
          </div>
        </div>
      )}
      
      {/* Move count */}
      {gameState?.movesCount !== undefined && (
        <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Moves: {gameState.movesCount}
        </div>
      )}
    </div>
  );
}
