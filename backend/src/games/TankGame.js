import BaseGame from '../engine/BaseGame.js';

/**
 * TankGame - Real-time tank battle game
 * Real-time game for 2 players
 */
class TankGame extends BaseGame {
  constructor(config = {}) {
    super({
      ...config,
      live: true, // Real-time
      timePerStep: 16 // ~60fps
    });
    
    this.mapWidth = config.boardWidth || 800;
    this.mapHeight = config.boardHeight || 600;
    this.tankSpeed = 150; // pixels per second
    this.bulletSpeed = 400;
    this.tankSize = 40;
    this.maxHealth = 3;
    this.shootCooldown = 500; // ms
  }
  
  load(config) {
    this.state = {
      tanks: {},
      bullets: [],
      walls: this._generateWalls(),
      gameTime: 0
    };
  }
  
  _generateWalls() {
    // Generate some random walls for cover
    const walls = [];
    const wallCount = 8;
    
    for (let i = 0; i < wallCount; i++) {
      walls.push({
        x: 100 + Math.random() * (this.mapWidth - 200),
        y: 100 + Math.random() * (this.mapHeight - 200),
        width: 20 + Math.random() * 60,
        height: 20 + Math.random() * 60
      });
    }
    
    return walls;
  }
  
  addPlayer(player) {
    const result = super.addPlayer(player);
    if (result) {
      // Spawn tank at random position
      const spawnPoints = [
        { x: 100, y: 100 },
        { x: this.mapWidth - 100, y: this.mapHeight - 100 },
        { x: 100, y: this.mapHeight - 100 },
        { x: this.mapWidth - 100, y: 100 }
      ];
      
      const spawn = spawnPoints[this.players.length - 1] || spawnPoints[0];
      
      this.state.tanks[player.id] = {
        x: spawn.x,
        y: spawn.y,
        rotation: 0,
        health: this.maxHealth,
        score: 0,
        lastShot: 0,
        velocity: { x: 0, y: 0 },
        color: this.players.length === 1 ? '#4CAF50' : '#2196F3'
      };
    }
    return result;
  }
  
  handleAction(action, playerId) {
    const { type, data } = action;
    const tank = this.state.tanks[playerId];
    
    if (!tank || tank.health <= 0) return false;
    
    switch (type) {
      case 'MOVE':
        // data: { direction: 'up'|'down'|'left'|'right' }
        const moveSpeed = this.tankSpeed / 60; // Per frame
        switch (data.direction) {
          case 'up':
            tank.velocity.y = -moveSpeed;
            tank.rotation = -90;
            break;
          case 'down':
            tank.velocity.y = moveSpeed;
            tank.rotation = 90;
            break;
          case 'left':
            tank.velocity.x = -moveSpeed;
            tank.rotation = 180;
            break;
          case 'right':
            tank.velocity.x = moveSpeed;
            tank.rotation = 0;
            break;
        }
        return true;
        
      case 'STOP':
        tank.velocity.x = 0;
        tank.velocity.y = 0;
        return true;
        
      case 'SHOOT':
        const now = Date.now();
        if (now - tank.lastShot < this.shootCooldown) {
          return false; // Cooldown not ready
        }
        
        // Create bullet
        const radians = (tank.rotation * Math.PI) / 180;
        this.state.bullets.push({
          id: `${playerId}-${now}`,
          ownerId: playerId,
          x: tank.x + Math.cos(radians) * (this.tankSize / 2),
          y: tank.y + Math.sin(radians) * (this.tankSize / 2),
          vx: Math.cos(radians) * this.bulletSpeed / 60,
          vy: Math.sin(radians) * this.bulletSpeed / 60,
          createdAt: now
        });
        
        tank.lastShot = now;
        return true;
        
      case 'ROTATE':
        // data: { angle: number }
        tank.rotation = data.angle;
        return true;
        
      default:
        return false;
    }
  }
  
  update(dt) {
    const dtSeconds = dt / 1000;
    this.state.gameTime += dt;
    
    // Update tanks
    for (const playerId in this.state.tanks) {
      const tank = this.state.tanks[playerId];
      if (tank.health <= 0) continue;
      
      // Move tank
      const newX = tank.x + tank.velocity.x * dt / 16;
      const newY = tank.y + tank.velocity.y * dt / 16;
      
      // Check bounds
      tank.x = Math.max(this.tankSize / 2, Math.min(this.mapWidth - this.tankSize / 2, newX));
      tank.y = Math.max(this.tankSize / 2, Math.min(this.mapHeight - this.tankSize / 2, newY));
      
      // Check wall collision
      for (const wall of this.state.walls) {
        if (this._checkCollision(
          { x: tank.x, y: tank.y, width: this.tankSize, height: this.tankSize },
          wall
        )) {
          // Push tank back
          tank.x -= tank.velocity.x * dt / 16;
          tank.y -= tank.velocity.y * dt / 16;
          break;
        }
      }
    }
    
    // Update bullets
    for (let i = this.state.bullets.length - 1; i >= 0; i--) {
      const bullet = this.state.bullets[i];
      
      // Move bullet
      bullet.x += bullet.vx * dt / 16;
      bullet.y += bullet.vy * dt / 16;
      
      // Remove if out of bounds
      if (bullet.x < 0 || bullet.x > this.mapWidth || 
          bullet.y < 0 || bullet.y > this.mapHeight) {
        this.state.bullets.splice(i, 1);
        continue;
      }
      
      // Check wall collision
      let hitWall = false;
      for (const wall of this.state.walls) {
        if (this._pointInRect(bullet.x, bullet.y, wall)) {
          this.state.bullets.splice(i, 1);
          hitWall = true;
          break;
        }
      }
      if (hitWall) continue;
      
      // Check tank collision
      for (const playerId in this.state.tanks) {
        if (playerId === bullet.ownerId) continue; // Don't hit own tank
        
        const tank = this.state.tanks[playerId];
        if (tank.health <= 0) continue;
        
        const distance = Math.sqrt(
          (bullet.x - tank.x) ** 2 + (bullet.y - tank.y) ** 2
        );
        
        if (distance < this.tankSize / 2) {
          // Hit!
          tank.health--;
          this.state.tanks[bullet.ownerId].score++;
          this.state.bullets.splice(i, 1);
          
          console.log(`Tank ${playerId} hit! Health: ${tank.health}`);
          break;
        }
      }
      
      // Remove old bullets (5 second lifetime)
      if (Date.now() - bullet.createdAt > 5000) {
        this.state.bullets.splice(i, 1);
      }
    }
  }
  
  _checkCollision(rect1, rect2) {
    return (
      rect1.x - rect1.width / 2 < rect2.x + rect2.width &&
      rect1.x + rect1.width / 2 > rect2.x &&
      rect1.y - rect1.height / 2 < rect2.y + rect2.height &&
      rect1.y + rect1.height / 2 > rect2.y
    );
  }
  
  _pointInRect(x, y, rect) {
    return (
      x >= rect.x && x <= rect.x + rect.width &&
      y >= rect.y && y <= rect.y + rect.height
    );
  }
  
  isWin() {
    const aliveTanks = Object.entries(this.state.tanks).filter(
      ([id, tank]) => tank.health > 0
    );
    
    // If only one tank alive and game has started
    if (this.players.length >= 2 && aliveTanks.length === 1) {
      const [winnerId] = aliveTanks[0];
      return {
        winner: winnerId,
        reason: 'Last tank standing!'
      };
    }
    
    // If all tanks dead (shouldn't happen but safety check)
    if (aliveTanks.length === 0 && this.players.length >= 2) {
      return {
        winner: null,
        reason: 'Draw - All tanks destroyed',
        isDraw: true
      };
    }
    
    return null;
  }
  
  getState() {
    return {
      tanks: this.state.tanks,
      bullets: this.state.bullets.map(b => ({
        id: b.id,
        x: b.x,
        y: b.y,
        ownerId: b.ownerId
      })),
      walls: this.state.walls,
      mapWidth: this.mapWidth,
      mapHeight: this.mapHeight,
      tankSize: this.tankSize,
      gameTime: this.state.gameTime,
      players: this.players,
      isFinished: this._finished
    };
  }
}

export default TankGame;
