import { useState, useEffect, useMemo } from 'react';

/**
 * CaroBoard - Interactive Caro/Gomoku game board component
 * 
 * @param {Object} props
 * @param {Array} props.board - 2D array of board state
 * @param {number} props.boardSize - Size of the board (default 15)
 * @param {Object} props.lastMove - Last move { x, y }
 * @param {Object} props.currentPlayer - Current player info
 * @param {boolean} props.isMyTurn - Whether it's the current user's turn
 * @param {Function} props.onCellClick - Callback when cell is clicked
 * @param {boolean} props.disabled - Disable interactions
 */
export default function CaroBoard({
  board = [],
  boardSize = 15,
  lastMove = null,
  currentPlayer = null,
  isMyTurn = false,
  onCellClick = () => {},
  disabled = false
}) {
  const [hoverCell, setHoverCell] = useState(null);
  
  // Calculate cell size based on board size
  const cellSize = useMemo(() => {
    return Math.min(30, 400 / boardSize);
  }, [boardSize]);
  
  const handleCellClick = (x, y) => {
    if (disabled || !isMyTurn) return;
    if (board[y]?.[x] !== null && board[y]?.[x] !== 0) return;
    
    onCellClick(x, y);
  };
  
  const renderCell = (value, x, y) => {
    const isLastMove = lastMove?.x === x && lastMove?.y === y;
    const isHovered = hoverCell?.x === x && hoverCell?.y === y;
    const isEmpty = value === null || value === 0;
    
    let content = '';
    let textColor = 'text-transparent';
    
    if (value === 'X' || value === 1) {
      content = '×';
      textColor = 'text-pink-500';
    } else if (value === 'O' || value === 2) {
      content = '○';
      textColor = 'text-blue-500';
    }
    
    return (
      <button
        key={`${x}-${y}`}
        data-testid={`cell-${x}-${y}`}
        onClick={() => handleCellClick(x, y)}
        onMouseEnter={() => setHoverCell({ x, y })}
        onMouseLeave={() => setHoverCell(null)}
        disabled={disabled || !isMyTurn || !isEmpty}
        className={`
          aspect-square flex items-center justify-center
          border border-slate-300 dark:border-slate-600
          text-2xl font-bold transition-all duration-150
          ${isEmpty && isMyTurn && !disabled
            ? 'hover:bg-pink-50 dark:hover:bg-pink-900/20 cursor-pointer'
            : 'cursor-default'
          }
          ${isLastMove
            ? 'bg-yellow-100 dark:bg-yellow-900/30 ring-2 ring-yellow-400'
            : 'bg-white dark:bg-slate-800'
          }
          ${isHovered && isEmpty && isMyTurn
            ? 'bg-pink-50 dark:bg-pink-900/20'
            : ''
          }
          ${textColor}
        `}
        style={{ 
          width: `${cellSize}px`, 
          height: `${cellSize}px`,
          fontSize: `${cellSize * 0.6}px`
        }}
      >
        {content}
      </button>
    );
  };
  
  return (
    <div className="flex flex-col items-center">
      {/* Turn indicator */}
      <div className="mb-4 text-center">
        {isMyTurn ? (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Your turn
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
            <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
            Waiting for opponent
          </span>
        )}
      </div>
      
      {/* Game board */}
      <div 
        className="inline-grid bg-slate-200 dark:bg-slate-700 p-1 rounded-lg shadow-lg"
        style={{ 
          gridTemplateColumns: `repeat(${boardSize}, ${cellSize}px)`,
          gap: '1px'
        }}
      >
        {board.map((row, y) =>
          row.map((cell, x) => renderCell(cell, x, y))
        )}
      </div>
      
      {/* Legend */}
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
    </div>
  );
}
