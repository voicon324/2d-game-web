import { useRef, useEffect, useCallback } from 'react';

/**
 * TankRenderer - Canvas-based renderer for Tank battle game
 */
export default function TankRenderer({ gameState, currentUserId, keysPressed }) {
  const canvasRef = useRef(null);
  const animationRef = useRef();

  // Draw the game
  useEffect(() => {
    if (!gameState || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { tanks, bullets, walls, mapWidth, mapHeight, tankSize } = gameState;

    canvas.width = mapWidth;
    canvas.height = mapHeight;

    // Clear canvas
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(0, 0, mapWidth, mapHeight);

    // Draw grass pattern
    ctx.fillStyle = '#3d6a37';
    for (let x = 0; x < mapWidth; x += 20) {
      for (let y = 0; y < mapHeight; y += 20) {
        if ((x + y) % 40 === 0) {
          ctx.fillRect(x, y, 10, 10);
        }
      }
    }

    // Draw walls
    ctx.fillStyle = '#8b4513';
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    for (const wall of walls) {
      ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
      ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
    }

    // Draw bullets
    ctx.fillStyle = '#ffcc00';
    for (const bullet of bullets) {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Bullet glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff6600';
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw tanks
    for (const [playerId, tank] of Object.entries(tanks)) {
      if (tank.health <= 0) continue;

      ctx.save();
      ctx.translate(tank.x, tank.y);
      ctx.rotate((tank.rotation * Math.PI) / 180);

      // Tank body
      const isCurrentPlayer = playerId === currentUserId;
      ctx.fillStyle = tank.color;
      ctx.strokeStyle = isCurrentPlayer ? '#fff' : '#333';
      ctx.lineWidth = isCurrentPlayer ? 3 : 2;
      
      // Tank body rectangle
      ctx.fillRect(-tankSize / 2, -tankSize / 3, tankSize, tankSize * 0.66);
      ctx.strokeRect(-tankSize / 2, -tankSize / 3, tankSize, tankSize * 0.66);

      // Tank turret
      ctx.fillStyle = isCurrentPlayer ? '#388E3C' : '#1565C0';
      ctx.fillRect(0, -tankSize / 6, tankSize / 2 + 10, tankSize / 3);

      ctx.restore();

      // Health bar
      const healthBarWidth = tankSize;
      const healthBarHeight = 6;
      const healthPercent = tank.health / 3;
      
      ctx.fillStyle = '#333';
      ctx.fillRect(
        tank.x - healthBarWidth / 2,
        tank.y - tankSize / 2 - 15,
        healthBarWidth,
        healthBarHeight
      );
      
      ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#ff9800' : '#f44336';
      ctx.fillRect(
        tank.x - healthBarWidth / 2,
        tank.y - tankSize / 2 - 15,
        healthBarWidth * healthPercent,
        healthBarHeight
      );
    }

    // Draw game time
    const minutes = Math.floor(gameState.gameTime / 60000);
    const seconds = Math.floor((gameState.gameTime % 60000) / 1000);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`,
      mapWidth / 2,
      30
    );

    // Draw scores
    ctx.textAlign = 'left';
    let scoreY = 50;
    for (const [playerId, tank] of Object.entries(tanks)) {
      const player = gameState.players.find(p => p.id === playerId);
      ctx.fillStyle = tank.color;
      ctx.fillText(
        `${player?.username || 'Player'}: ${tank.score} kills | ❤️ ${tank.health}`,
        10,
        scoreY
      );
      scoreY += 25;
    }
  }, [gameState, currentUserId]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        style={{ 
          outline: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}
      />
      <div className="mt-4 text-center text-sm text-gray-400">
        <p>🎮 Controls: WASD or Arrow Keys to move | SPACE to shoot</p>
      </div>
    </div>
  );
}
