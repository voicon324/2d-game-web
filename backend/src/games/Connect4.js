import BaseGame from '../engine/BaseGame.js';

class Connect4 extends BaseGame {
  constructor(config = {}) {
    super({
      ...config,
      live: false,
      turnTimeout: config.turnTimeout || 30000
    });
    
    this.rows = 6;
    this.cols = 7;
    this.winLength = 4;
  }
  
  load(config) {
    this.state = {
      board: Array(this.rows).fill(null).map(() => 
        Array(this.cols).fill(null)
      ),
      lastMove: null,
      moves: [],
      symbols: ['R', 'Y'] // Red, Yellow
    };
  }
  
  handleAction(action, playerId) {
    const { type, data } = action;
    if (type !== 'PLACE') return false;
    
    // User clicks a cell, but we only care about the Column (data.x)
    const { x } = data;
    if (x < 0 || x >= this.cols) return false;
    
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== playerId) return false;
    
    // Find lowest empty row in column x
    let y = -1;
    for (let r = this.rows - 1; r >= 0; r--) {
        if (this.state.board[r][x] === null) {
            y = r;
            break;
        }
    }
    
    if (y === -1) return false; // Column full
    
    const playerIndex = this.players.findIndex(p => p.id === playerId);
    const symbol = this.state.symbols[playerIndex];
    
    this.state.board[y][x] = symbol;
    this.state.lastMove = { x, y, playerId, symbol };
    this.state.moves.push({ x, y, playerId, symbol, time: Date.now() });
    
    this.nextTurn();
    return true;
  }
  
  isWin() {
    const { board, lastMove } = this.state;
    if (!lastMove) return null;
    
    const { x, y, symbol, playerId } = lastMove;
    
    const directions = [
      [[0, 1], [0, -1]],   // Horizontal
      [[1, 0], [-1, 0]],   // Vertical
      [[1, 1], [-1, -1]], // Diagonal \
      [[1, -1], [-1, 1]]  // Diagonal /
    ];
    
    for (const [dir1, dir2] of directions) {
      let count = 1;
      count += this._countInDirection(x, y, dir1[0], dir1[1], symbol);
      count += this._countInDirection(x, y, dir2[0], dir2[1], symbol);
      
      if (count >= this.winLength) {
        return { winner: playerId, reason: '4 in a row!' };
      }
    }
    
    // Draw
    const isFull = board.every(row => row.every(cell => cell !== null));
    if (isFull) return { winner: null, isDraw: true, reason: 'Board Full' };
    
    return null;
  }

  _countInDirection(startX, startY, dx, dy, symbol) {
    let count = 0;
    let x = startX + dx;
    let y = startY + dy;
    
    while (
      x >= 0 && x < this.cols &&
      y >= 0 && y < this.rows &&
      this.state.board[y][x] === symbol
    ) {
      count++;
      x += dx;
      y += dy;
    }
    return count;
  }
  
  getState() {
    return {
      board: this.state.board,
      lastMove: this.state.lastMove,
      rows: this.rows,
      cols: this.cols,
      boardSize: Math.max(this.rows, this.cols), // Helper for frontend generic sizing
      players: this.players.map((p, i) => ({
        ...p,
        symbol: this.state.symbols[i]
      })),
      currentTurn: this._currentTurn,
      currentPlayer: this.getCurrentPlayer(),
      isFinished: this._finished
    };
  }
}

export default Connect4;
