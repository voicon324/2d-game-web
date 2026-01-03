import BaseGame from '../engine/BaseGame.js';

class Match3 extends BaseGame {
  constructor(config = {}) {
    super({
      ...config,
      live: false, // Turn-based swaps
      turnTimeout: config.turnTimeout || 60000
    });
    
    this.size = 8;
    this.colors = ['R', 'G', 'B', 'Y', 'P', 'O']; // 6 colors
  }
  
  load(config) {
    this.state = {
      board: this.generateBoard(),
      lastMove: null,
      score: {}, // PlayerID -> Score
      selected: null
    };
    // Init scores
    this.players.forEach(p => this.state.score[p.id] = 0);
  }

  generateBoard() {
      // Basic random generation, ideally ensures no matches initially, but simplifying for now
      return Array(this.size).fill(null).map(() => 
          Array(this.size).fill(null).map(() => this.colors[Math.floor(Math.random() * this.colors.length)])
      );
  }
  
  handleAction(action, playerId) {
    const { type, data } = action;
    
    // We handle 'SELECT' and 'SWAP' implicitly via 'PLACE' or custom types.
    // Let's use 'CLICK' or 'PLACE' as generic input.
    // If 'PLACE' (click):
    // If nothing selected: Select it.
    // If one selected: 
    //   If adjacent: SWAP.
    //   If not adjacent: Select new.
    
    if (type !== 'PLACE') return false; 
    // Or we could define type='SWAP' explicitly if frontend sends it. 
    // But unified renderer usually sends 'PLACE' x,y on click.
    
    const { x, y } = data;
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) return false;

    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== playerId) return false;

    if (!this.state.selected) {
        this.state.selected = { x, y };
        return true; // Just state update, no turn end
    } else {
        const sX = this.state.selected.x;
        const sY = this.state.selected.y;
        
        // Check if same cell - deselect
        if (sX === x && sY === y) {
            this.state.selected = null;
            return true;
        }

        // Check adjacency
        const isAdj = (Math.abs(sX - x) === 1 && sY === y) || (Math.abs(sY - y) === 1 && sX === x);
        
        if (isAdj) {
            // Swap
            this.swap(sX, sY, x, y);
            this.state.selected = null;
            
            // Check matches
            const points = this.processBoard();
            if (points > 0) {
                this.state.score[playerId] = (this.state.score[playerId] || 0) + points;
                this.nextTurn(); // Valid move ends turn
            } else {
                // Invalid swap (no match), swap back? 
                // Classic match3 swaps back if no match.
                this.swap(sX, sY, x, y); // Undo
                // Do not end turn
            }
        } else {
            // Select new
            this.state.selected = { x, y };
        }
        return true;
    }
  }

  swap(x1, y1, x2, y2) {
      const temp = this.state.board[y1][x1];
      this.state.board[y1][x1] = this.state.board[y2][x2];
      this.state.board[y2][x2] = temp;
  }

  processBoard() {
      // Find matches, clear them, drop, refill.
      // Returns total points.
      let totalPoints = 0;
      let matched = true;
      let passes = 0; // Avoid infinite loop
      
      while(matched && passes < 10) {
          const matches = this.findMatches();
          if (matches.length === 0) {
              matched = false;
          } else {
              totalPoints += matches.length * 10;
              // Clear
              matches.forEach(({x, y}) => {
                  this.state.board[y][x] = null;
              });
              // Drop & Refill
              this.applyGravity();
              passes++;
          }
      }
      return totalPoints;
  }

  findMatches() {
      const matches = new Set();
      // Horizontal
      for (let y = 0; y < this.size; y++) {
          for (let x = 0; x < this.size - 2; x++) {
              const c = this.state.board[y][x];
              if (c && c === this.state.board[y][x+1] && c === this.state.board[y][x+2]) {
                  matches.add(`${x},${y}`);
                  matches.add(`${x+1},${y}`);
                  matches.add(`${x+2},${y}`);
              }
          }
      }
      // Vertical
      for (let x = 0; x < this.size; x++) {
          for (let y = 0; y < this.size - 2; y++) {
              const c = this.state.board[y][x];
              if (c && c === this.state.board[y+1][x] && c === this.state.board[y+2][x]) {
                  matches.add(`${x},${y}`);
                  matches.add(`${x},${y+1}`);
                  matches.add(`${x},${y+2}`);
              }
          }
      }
      return Array.from(matches).map(s => {
          const [x, y] = s.split(',').map(Number);
          return { x, y };
      });
  }

  applyGravity() {
      // For each column
      for (let x = 0; x < this.size; x++) {
          let emptyY = this.size - 1;
          for (let y = this.size - 1; y >= 0; y--) {
              if (this.state.board[y][x] !== null) {
                  // Shift down
                  if (y !== emptyY) {
                      this.state.board[emptyY][x] = this.state.board[y][x];
                      this.state.board[y][x] = null;
                  }
                  emptyY--;
              }
          }
          // Fill top with random
          for (let y = 0; y <= emptyY; y++) {
               this.state.board[y][x] = this.colors[Math.floor(Math.random() * this.colors.length)];
          }
      }
  }
  
  isWin() {
     // Score limit or Move limit?
     // Let's say first to 1000 points?
     // Or just endless until disconnect.
     // For 'win' condition, let's say who has more score after 20 turns?
     
     // Currently Basic Match3.
     return null;
  }
  
  getState() {
    return {
      board: this.state.board,
      selected: this.state.selected,
      score: this.state.score,
      boardSize: this.size,
      players: this.players, // Just user info
      currentTurn: this._currentTurn,
      currentPlayer: this.getCurrentPlayer(),
      isFinished: this._finished
    };
  }
}

export default Match3;
