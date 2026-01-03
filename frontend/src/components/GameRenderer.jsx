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
  
  // Tic Tac Toe: X and O (Large)
  tictactoe: (value, isLastMove) => {
    if (!value) return null;
    const isX = value === 'X' || value === 1;
    return (
      <span className={`text-4xl sm:text-6xl font-bold ${isX ? 'text-pink-500' : 'text-blue-500'} animate-pop`}>
        {isX ? '×' : '○'}
      </span>
    );
  },

  // Connect 4 (Discs)
  connect4: (value) => {
    if (!value) return (
       <div className="w-4/5 h-4/5 rounded-full bg-slate-100 dark:bg-slate-800 shadow-inner" />
    );
    // R = Red, Y = Yellow
    const color = value === 'R' ? 'bg-red-500' : 'bg-yellow-400';
    return (
      <div className={`w-4/5 h-4/5 rounded-full ${color} shadow-lg animate-bounce-drop`} />
    );
  },

  // Match 3 (Gems)
  match3: (value) => {
    if (!value) return null;
    const colors = {
        'R': 'bg-red-500', 
        'G': 'bg-green-500', 
        'B': 'bg-blue-500', 
        'Y': 'bg-yellow-400', 
        'P': 'bg-purple-500', 
        'O': 'bg-orange-500'
    };
    const shape = {
        'R': 'rounded-full', 
        'G': 'rounded-lg rotate-45', 
        'B': 'rounded-sm', 
        'Y': 'rounded-full border-4 border-yellow-600', 
        'P': 'rounded-t-lg', 
        'O': 'rounded-xl' 
    };
    return (
      <div className={`w-3/4 h-3/4 ${colors[value] || 'bg-gray-400'} ${shape[value]} shadow-lg hover:scale-110 transition-transform`} />
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
  },

  // Memory (Cards)
  memory: (value) => {
      const isRevealed = value?.status === 'revealed' || value?.status === 'matched';
      if (isRevealed) {
          return (
              <div className={`w-full h-full flex items-center justify-center text-3xl bg-white dark:bg-slate-200 rounded-lg shadow-md animate-flip-in ${value.status === 'matched' ? 'ring-2 ring-green-500' : ''}`}>
                  {value.icon}
              </div>
          );
      }
      return (
          <div className="w-full h-full bg-indigo-500 rounded-lg shadow-md flex items-center justify-center text-white/20 hover:bg-indigo-400 transition-colors">?</div>
      );
  },

  // Drawing (Pixels)
  drawing: (value) => {
    return (
      <div 
          className="w-full h-full"
          style={{ backgroundColor: value || '#FFFFFF' }}
      />
    );
  },

  // Tank Game Renderer
  tank: (value) => {
    if (!value) return null;
    
    if (value.type === 'WALL') {
        return <div className="w-full h-full bg-amber-800 border-2 border-amber-900 rounded-sm" />;
    }
    
    if (value.type === 'BULLET') {
        return <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_5px_rgba(250,204,21,0.8)] animate-pulse" />;
    }
    
    if (value.type === 'TANK') {
        // Tank Direction helper
        const getTransform = (dir) => {
            switch(dir) {
                case 'UP': return 'rotate(0deg)';
                case 'DOWN': return 'rotate(180deg)';
                case 'LEFT': return 'rotate(-90deg)';
                case 'RIGHT': return 'rotate(90deg)';
                default: return 'rotate(0deg)';
            }
        };
        
        return (
            <div 
                className={`flex items-center justify-center w-full h-full text-white font-bold text-xs relative`}
                style={{ 
                    transform: getTransform(value.direction),
                    backgroundColor: value.color || 'green'
                }}
            >
                {/* Tank Body */}
                <span className="mb-1">▲</span> 
            </div>
        );
    }
    return null;
  },

  // Snake Game Renderer
  snake: (value) => {
      if (!value) return null;

      if (value.type === 'FOOD') {
          return (
             <div className="w-4/5 h-4/5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
          );
      }

      if (value.type === 'SNAKE') {
          return (
              <div 
                  className="w-full h-full rounded-sm"
                  style={{ backgroundColor: value.color || '#22c55e' }}
              />
          );
      }
      return null;
  }
};

// Board background styles for different games
const BOARD_STYLES = {
  caro: 'bg-amber-100 dark:bg-amber-900/30',
  chess: 'bg-amber-800',
  dots: 'bg-slate-200 dark:bg-slate-700',
  tank: 'bg-green-900/80 border-4 border-green-950',
  tictactoe: 'gap-2 bg-slate-300 dark:bg-slate-700 p-4',
  connect4: 'gap-2 bg-blue-700 p-4 rounded-xl',
  match3: 'gap-1 bg-slate-800/50 p-2 rounded-xl backdrop-blur-sm',
  memory: 'gap-3 bg-slate-200 dark:bg-slate-800 p-4',
  memory: 'gap-3 bg-slate-200 dark:bg-slate-800 p-4',
  drawing: 'gap-0 border border-slate-300 dark:border-slate-700 shadow-inner bg-white',
  snake: 'bg-slate-900 border-4 border-slate-700'
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
    
    const cellValue = board[y]?.[x];
    const canClickOccupied = ['drawing', 'memory', 'match3'].includes(gameType);
    
    if (cellValue !== null && cellValue !== 0 && !canClickOccupied) return; // Cell occupied
    
    onCellClick(x, y);
  }, [disabled, isMyTurn, board, onCellClick, gameType]);
  
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
              data-cell="true"
              data-x={x}
              data-y={y}
              onClick={() => handleClick(x, y)}
              disabled={disabled || !isMyTurn || (cell !== null && cell !== 0 && !['drawing', 'memory', 'match3'].includes(gameType))}
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

      {gameType === 'tank' && (
        <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
             Use <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-mono">WASD</kbd> or <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-mono">Arrows</kbd> to Move
             <span className="mx-2">•</span>
             <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-mono">SPACE</kbd> to Shoot
        </div>
      )}

      {gameType === 'drawing' && (
        <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
             <span className="material-icons text-base align-middle mr-1">brush</span>
             Click to paint pixels.
        </div>
      )}

      {gameType === 'snake' && (
        <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
             Use Arrow Keys to move. Eat apples! 🍎
        </div>
      )}

      {gameType === 'memory' && (
        <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
             Find matching pairs of icons.
        </div>
      )}

      {gameType === 'match3' && (
        <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
             Swap adjacent gems to match 3 or more.
        </div>
      )}

      {gameType === 'connect4' && (
        <div className="mt-4 flex gap-6 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span>Player 1</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
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
