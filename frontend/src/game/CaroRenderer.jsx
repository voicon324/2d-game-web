import { useRef, useEffect, useCallback } from 'react';

/**
 * CaroRenderer - Canvas-based renderer for Caro/Gomoku game
 */
export default function CaroRenderer({ gameState, onCellClick, currentUserId }) {
  const canvasRef = useRef(null);
  const cellSize = 40;
  const padding = 20;

  // Draw the game board
  useEffect(() => {
    if (!gameState || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { board, boardSize, lastMove, currentPlayer } = gameState;

    const size = boardSize * cellSize + padding * 2;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.fillStyle = '#f5d9a8';
    ctx.fillRect(0, 0, size, size);

    // Draw grid
    ctx.strokeStyle = '#8b7355';
    ctx.lineWidth = 1;

    for (let i = 0; i <= boardSize; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(padding + i * cellSize, padding);
      ctx.lineTo(padding + i * cellSize, padding + boardSize * cellSize);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(padding, padding + i * cellSize);
      ctx.lineTo(padding + boardSize * cellSize, padding + i * cellSize);
      ctx.stroke();
    }

    // Draw pieces
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        const piece = board[y][x];
        if (piece) {
          const centerX = padding + x * cellSize + cellSize / 2;
          const centerY = padding + y * cellSize + cellSize / 2;
          const radius = cellSize * 0.4;

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          
          if (piece === 'X') {
            // X is black with gradient
            const gradient = ctx.createRadialGradient(
              centerX - radius * 0.3, centerY - radius * 0.3, 0,
              centerX, centerY, radius
            );
            gradient.addColorStop(0, '#4a4a4a');
            gradient.addColorStop(1, '#1a1a1a');
            ctx.fillStyle = gradient;
          } else {
            // O is white with gradient
            const gradient = ctx.createRadialGradient(
              centerX - radius * 0.3, centerY - radius * 0.3, 0,
              centerX, centerY, radius
            );
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(1, '#cccccc');
            ctx.fillStyle = gradient;
          }
          
          ctx.fill();
          ctx.strokeStyle = piece === 'X' ? '#000' : '#888';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }

    // Highlight last move
    if (lastMove) {
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        padding + lastMove.x * cellSize + 2,
        padding + lastMove.y * cellSize + 2,
        cellSize - 4,
        cellSize - 4
      );
    }

    // Draw turn indicator
    const isMyTurn = currentPlayer?.id === currentUserId;
    ctx.fillStyle = isMyTurn ? '#4CAF50' : '#666';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      isMyTurn ? '🎯 Your Turn!' : `⏳ ${currentPlayer?.username}'s Turn`,
      size / 2,
      size - 5
    );
  }, [gameState, currentUserId]);

  // Handle click
  const handleClick = useCallback((e) => {
    if (!gameState || !onCellClick) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellX = Math.floor((x - padding) / cellSize);
    const cellY = Math.floor((y - padding) / cellSize);

    if (cellX >= 0 && cellX < gameState.boardSize && 
        cellY >= 0 && cellY < gameState.boardSize) {
      onCellClick(cellX, cellY);
    }
  }, [gameState, onCellClick]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{ 
          cursor: 'pointer',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}
      />
    </div>
  );
}
