import BaseGame from '../engine/BaseGame.js';

/**
 * TankGame - Grid-based Tank Battle
 * Unified 2D Matrix implementation
 */
class TankGame extends BaseGame {
  constructor(config = {}) {
    super({
      ...config,
      live: true,
      timePerStep: 200 // Slower tick for grid movement (5 fps is enough for grid)
    });
    
    this.boardSize = config.boardSize || 20; // 20x20 grid
    this.tankSize = 1; // 1 cell
  }
  
  load(config) {
    // Initialize empty board
    this.state = {
      board: Array(this.boardSize).fill(null).map(() => 
        Array(this.boardSize).fill(null)
      ),
      tanks: {},
      gameTime: 0
    };

    // Generate random walls
    this._generateWalls();
  }
  
  _generateWalls() {
    const wallCount = 30;
    for (let i = 0; i < wallCount; i++) {
        const x = Math.floor(Math.random() * this.boardSize);
        const y = Math.floor(Math.random() * this.boardSize);
        // Avoid center spawn area roughly
        if (x > 5 && x < 15 && y > 5 && y < 15) continue;
        this.state.board[y][x] = { type: 'WALL' };
    }
  }
  
  addPlayer(player) {
    const result = super.addPlayer(player);
    if (result) {
      // Find empty spot
      let x, y;
      do {
        x = Math.floor(Math.random() * this.boardSize);
        y = Math.floor(Math.random() * this.boardSize);
      } while (this.state.board[y][x] !== null);

      const tank = {
        type: 'TANK',
        id: player.id,
        x,
        y,
        direction: 'UP', // UP, DOWN, LEFT, RIGHT
        score: 0,
        color: this.players.length === 1 ? 'green' : 'blue'
      };

      this.state.tanks[player.id] = tank;
      this.state.board[y][x] = tank;
    }
    return result;
  }
  
  removePlayer(playerId) {
    const tank = this.state.tanks[playerId];
    if (tank) {
        this.state.board[tank.y][tank.x] = null;
        delete this.state.tanks[playerId];
    }
    super.removePlayer(playerId);
  }
  
  handleAction(action, playerId) {
    const { type, data } = action;
    const tank = this.state.tanks[playerId];
    
    if (!tank) return false;
    
    switch (type) {
      case 'MOVE':
        // data.direction: 'up', 'down', 'left', 'right'
        return this._moveTank(tank, data.direction);
        
      case 'SHOOT':
        return this._shoot(tank);
        
      default:
        return false;
    }
  }
  
  _moveTank(tank, direction) {
    let dx = 0, dy = 0;
    const dir = direction.toUpperCase();
    
    if (dir === 'UP') dy = -1;
    else if (dir === 'DOWN') dy = 1;
    else if (dir === 'LEFT') dx = -1;
    else if (dir === 'RIGHT') dx = 1;
    
    // Always update direction
    tank.direction = dir;
    
    const newX = tank.x + dx;
    const newY = tank.y + dy;
    
    // Check bounds
    if (newX < 0 || newX >= this.boardSize || newY < 0 || newY >= this.boardSize) {
        return true; // Just rotated
    }
    
    // Check collision
    if (this.state.board[newY][newX] !== null) {
        return true; // Blocked, but action 'handled' (rotated)
    }
    
    // Move
    this.state.board[tank.y][tank.x] = null;
    tank.x = newX;
    tank.y = newY;
    this.state.board[newY][newX] = tank;
    
    return true;
  }
  
  _shoot(tank) {
    let dx = 0, dy = 0;
    if (tank.direction === 'UP') dy = -1;
    else if (tank.direction === 'DOWN') dy = 1;
    else if (tank.direction === 'LEFT') dx = -1;
    else if (tank.direction === 'RIGHT') dx = 1;
    
    const bx = tank.x + dx;
    const by = tank.y + dy;
    
    // Check bounds
    if (bx < 0 || bx >= this.boardSize || by < 0 || by >= this.boardSize) {
        return false;
    }
    
    // Check immediate collision
    const target = this.state.board[by][bx];
    if (target) {
        this._handleBulletHit(tank, bx, by, target);
        return true;
    }
    
    // Spawn bullet
    this.state.board[by][bx] = {
        type: 'BULLET',
        ownerId: tank.id,
        direction: tank.direction,
        x: bx,
        y: by
    };
    
    return true;
  }
  
  _handleBulletHit(shooterTank, x, y, target) {
    if (target.type === 'TANK') {
        const victimId = target.id;
        // Respawn victim
        this.state.board[y][x] = null; // Remove tank from board
        
        // Find new spawn
        let sx, sy;
        do {
            sx = Math.floor(Math.random() * this.boardSize);
            sy = Math.floor(Math.random() * this.boardSize);
        } while (this.state.board[sy][sx] !== null);
        
        target.x = sx;
        target.y = sy;
        this.state.board[sy][sx] = target;
        
        shooterTank.score++;
    } else if (target.type === 'WALL') {
        // Destroy wall
        this.state.board[y][x] = null;
    } else if (target.type === 'BULLET') {
        // Bullets collide and destroy each other
        this.state.board[y][x] = null;
    }
  }

  update(dt) {
    this.state.gameTime += dt;
    
    // Move bullets
    // We need to move them one step. 
    // To avoid double moving, we can collect them first.
    const bullets = [];
    for(let y=0; y<this.boardSize; y++) {
        for(let x=0; x<this.boardSize; x++) {
            const cell = this.state.board[y][x];
            if (cell && cell.type === 'BULLET') {
                bullets.push({ ...cell, processed: false });
            }
        }
    }
    
    // Process bullets
    // Note: This naive approach might have issues with order, but okay for simple grid
    // For a proper grid update, we usually ping-pong buffers or marking.
    // Let's iterate backwards or mark processed to specific IDs? 
    // actually constructing a new board transition might be safer but expensive.
    // Let's just try moving them.
    
    // We need to mark bullets that have moved so we don't move them again in same frame if we iterate board.
    // But since we gathered them in a list, we can just process the list.
    
    // However, we need to update the board state.
    // A bullet at (5,5) moving RIGHT goes to (6,5).
    // If we process (6,5) later, we shouldn't move it again.
    // So processing the snapshot 'bullets' list is correct.
    
    for (const b of bullets) {
        // Current position in board might have changed if another bullet hit this one?
        // Check if it still exists
        const currentCell = this.state.board[b.y][b.x];
        if (!currentCell || currentCell.type !== 'BULLET' || currentCell.ownerId !== b.ownerId) {
            continue; // Already destroyed or moved?
        }
        
        let dx = 0, dy = 0;
        if (b.direction === 'UP') dy = -1;
        else if (b.direction === 'DOWN') dy = 1;
        else if (b.direction === 'LEFT') dx = -1;
        else if (b.direction === 'RIGHT') dx = 1;
        
        const nx = b.x + dx;
        const ny = b.y + dy;
        
        // Remove from current pos
        this.state.board[b.y][b.x] = null;
        
        // Check bounds
        if (nx < 0 || nx >= this.boardSize || ny < 0 || ny >= this.boardSize) {
            continue; // Out of bounds, destroy
        }
        
        // Check collision
        const target = this.state.board[ny][nx];
        if (target) {
            const shooter = this.state.tanks[b.ownerId];
            if (shooter) {
                this._handleBulletHit(shooter, nx, ny, target);
            }
        } else {
            // Move there
            b.x = nx;
            b.y = ny;
            this.state.board[ny][nx] = b;
        }
    }
  }
  
  isWin() {
    // Score based? Or simple endless deathmatch?
    // Let's stick to infinite for now or score limit.
    return null; 
  }
  
  getState() {
    return {
      board: this.state.board,
      boardSize: this.boardSize,
      gameTime: this.state.gameTime,
      players: this.players, // Includes scores in tank objects? No, tank objects are separate.
      // We should merge tank data into players for the scoreboard if needed.
      tanks: this.state.tanks // Frontend might can use this for scoreboard
    };
  }
}

export default TankGame;
