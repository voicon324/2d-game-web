import BaseGame from '../engine/BaseGame.js';

/**
 * SnakeGame - Classic Snake Implementation
 * Supports multiplayer (each player controls a snake)
 */
class SnakeGame extends BaseGame {
  constructor(config = {}) {
    super({
      ...config,
      live: true,
      timePerStep: config.timePerStep || 200 // Default 200ms per tick (5 TPS)
    });
    
    this.boardSize = config.boardSize || 20;
    this.initialSnakeLength = 3;
  }
  
  load(config) {
    this.state = {
      board: Array(this.boardSize).fill(null).map(() => 
        Array(this.boardSize).fill(null)
      ),
      snakes: {}, // map playerId -> snake object
      food: null,
      gameTime: 0
    };
    
    // Spawn initial food
    this._spawnFood();
  }
  
  addPlayer(player) {
    const result = super.addPlayer(player);
    if (result) {
      // Spawn snake for new player
      this._spawnSnake(player.id);
    }
    return result;
  }
  
  removePlayer(playerId) {
    const snake = this.state.snakes[playerId];
    if (snake) {
      // Remove snake body from board
      for (const segment of snake.body) {
         if (this._isValid(segment.x, segment.y)) {
             this.state.board[segment.y][segment.x] = null;
         }
      }
      delete this.state.snakes[playerId];
    }
    super.removePlayer(playerId);
  }
  
  _spawnSnake(playerId) {
      // Find a safe spot
      let startX, startY;
      let attempts = 0;
      do {
          startX = Math.floor(Math.random() * (this.boardSize - 10)) + 5;
          startY = Math.floor(Math.random() * (this.boardSize - 10)) + 5;
          attempts++;
      } while (this.state.board[startY][startX] !== null && attempts < 100);

      // Default color based on player count (or random)
      const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899']; // Green, Blue, Amber, Pink
      const color = colors[Object.keys(this.state.snakes).length % colors.length];

      const snake = {
          id: playerId,
          body: [], // Array of {x, y}
          direction: 'RIGHT', // UP, DOWN, LEFT, RIGHT
          nextDirection: 'RIGHT', // Buffer for next input
          score: 0,
          color: color,
          isDead: false
      };

      // Create initial body
      for (let i = 0; i < this.initialSnakeLength; i++) {
          snake.body.push({ x: startX - i, y: startY });
          this.state.board[startY][startX - i] = { type: 'SNAKE', ownerId: playerId, color };
      }

      this.state.snakes[playerId] = snake;
  }

  _spawnFood() {
      let x, y;
      let attempts = 0;
      do {
          x = Math.floor(Math.random() * this.boardSize);
          y = Math.floor(Math.random() * this.boardSize);
          attempts++;
      } while (this.state.board[y][x] !== null && attempts < 100);
      
      this.state.food = { x, y };
      this.state.board[y][x] = { type: 'FOOD' };
  }
  
  handleAction(action, playerId) {
    const { type, data } = action;
    const snake = this.state.snakes[playerId];
    
    if (!snake || snake.isDead) return false;
    
    if (type === 'MOVE') {
        const newDir = data.direction;
        const currentDir = snake.direction;
        
        // Prevent 180 degree turns
        if (newDir === 'UP' && currentDir === 'DOWN') return false;
        if (newDir === 'DOWN' && currentDir === 'UP') return false;
        if (newDir === 'LEFT' && currentDir === 'RIGHT') return false;
        if (newDir === 'RIGHT' && currentDir === 'LEFT') return false;
        
        snake.nextDirection = newDir;
        return true;
    }
    
    return false;
  }
  
  update(dt) {
      this.state.gameTime += dt;
      
      // Move all snakes
      Object.values(this.state.snakes).forEach(snake => {
          if (snake.isDead) return;
          this._moveSnake(snake);
      });
  }
  
  _moveSnake(snake) {
      snake.direction = snake.nextDirection;
      
      const head = snake.body[0];
      let dx = 0, dy = 0;
      
      switch(snake.direction) {
          case 'UP': dy = -1; break;
          case 'DOWN': dy = 1; break;
          case 'LEFT': dx = -1; break;
          case 'RIGHT': dx = 1; break;
      }
      
      const newHead = { x: head.x + dx, y: head.y + dy };
      
      // Check collision with walls
      if (!this._isValid(newHead.x, newHead.y)) {
          this._killSnake(snake);
          return;
      }
      
      // Check collision with objects
      const cell = this.state.board[newHead.y][newHead.x];
      
      // Tail collision handled implicitly? 
      // Actually, if we move tail before checking, it allows chasing tail.
      // But we move head first usually.
      // Let's check cell type.
      
      let ateFood = false;
      
      if (cell) {
          if (cell.type === 'FOOD') {
              ateFood = true;
          } else if (cell.type === 'SNAKE') {
              // Crash into self or other
              // Special case: if it hits its own TAIL, and the tail is about to move...
              // But strictly, if cell is occupied, it's a crash.
              // EXCEPT if it's the very last tail segment that is moving away...
              // For simplicity, crash.
              this._killSnake(snake);
              return;
          }
      }
      
      // Move: Add new head
      snake.body.unshift(newHead);
      this.state.board[newHead.y][newHead.x] = { type: 'SNAKE', ownerId: snake.id, color: snake.color };
      
      // If not ate food, remove tail
      if (!ateFood) {
          const tail = snake.body.pop();
          // Clear tail from board ONLY if it's not also the current head (length 1 snake.. wait length is min 3)
          // Or if another snake didn't just move there (handled by order of updates? generic turn.. no parallel)
          // Just clear it.
          this.state.board[tail.y][tail.x] = null;
      } else {
          // Ate food
          snake.score += 10;
          this._spawnFood();
      }
  }
  
  _killSnake(snake) {
      snake.isDead = true;
      // Convert body to walls or just food? Or nothing?
      // Let's remove form board to keep it clean, maybe leave "dead block"?
      // Standard snake: Game over.
      // Multiplayer snake: Eliminated.
      
      // For now, just clear from board
      for (const segment of snake.body) {
          if (this._isValid(segment.x, segment.y)) {
             // Only clear if it matches this snake (could be overwritten? unlikely)
             const cell = this.state.board[segment.y][segment.x];
             if (cell && cell.ownerId === snake.id) {
                 this.state.board[segment.y][segment.x] = null;
             }
          }
      }
      
      // Check if all players dead
      const aliveSnakes = Object.values(this.state.snakes).filter(s => !s.isDead);
      if (aliveSnakes.length === 0 && this.players.length > 0) {
          this.finish(); // BaseGame method
      } else if (this.players.length > 1 && aliveSnakes.length === 1) {
          // Last man standing wins?
          // We can let them play until they die OR end immediately.
          // Let's end.
          this.finish();
      }
  }

  isWin() {
      // Return result if game finished
      if (this._finished) {
          // Find winner based on score or survival
          const snakes = Object.values(this.state.snakes);
          
          // Sort by survival (not dead) then score
          snakes.sort((a, b) => {
              if (a.isDead !== b.isDead) return a.isDead ? 1 : -1; // Alive first
              return b.score - a.score; // High score first
          });
          
          const winner = snakes[0];
          
          if (!winner) return { isDraw: true, reason: 'No players' };
          
          // If multiplayer and everyone crashes same tick?
          // If standard single player
          if (this.players.length === 1) {
              return { 
                  winner: winner.id, 
                  reason: `Game Over! Score: ${winner.score}` 
              };
          }
          
          // Multiplayer
          if (winner.isDead) { // Everyone dead
              return { isDraw: true, reason: 'Create Draw!' };
          }
          
          return {
              winner: winner.id,
              reason: 'Last Snake Standing!'
          };
      }
      return null;
  }
  
  _isValid(x, y) {
      return x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize;
  }
  
  getState() {
    return {
      board: this.state.board,
      boardSize: this.boardSize,
      gameTime: this.state.gameTime,
      snakes: this.state.snakes,
      players: this.players,
      isFinished: this._finished
    };
  }
}

export default SnakeGame;
