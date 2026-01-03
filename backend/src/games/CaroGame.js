import BaseGame from '../engine/BaseGame.js';

/**
 * CaroGame - Gomoku/Caro (5 in a row) implementation
 * Turn-based game for 2 players
 */
class CaroGame extends BaseGame {
  constructor(config = {}) {
    super({
      ...config,
      live: false, // Turn-based
      turnTimeout: config.turnTimeout || 30000
    });
    
    this.boardSize = config.boardSize || 15;
    this.winLength = config.winLength || 5;
  }
  
  load(config) {
    // Initialize empty board
    this.state = {
      board: Array(this.boardSize).fill(null).map(() => 
        Array(this.boardSize).fill(null)
      ),
      lastMove: null,
      moves: [],
      symbols: ['X', 'O']
    };
  }
  
  handleAction(action, playerId) {
    const { type, data } = action;
    
    if (type !== 'PLACE') return false;
    
    const { x, y } = data;
    
    // Validate move
    if (x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize) {
      return false;
    }
    
    if (this.state.board[y][x] !== null) {
      return false; // Cell already occupied
    }
    
    // Check if it's this player's turn
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== playerId) {
      return false;
    }
    
    // Place the piece
    const playerIndex = this.players.findIndex(p => p.id === playerId);
    const symbol = this.state.symbols[playerIndex];
    
    this.state.board[y][x] = symbol;
    this.state.lastMove = { x, y, playerId, symbol };
    this.state.moves.push({ x, y, playerId, symbol, time: Date.now() });
    
    // Advance turn
    this.nextTurn();
    
    return true;
  }
  
  isWin() {
    const { board, lastMove } = this.state;
    
    if (!lastMove) return null;
    
    const { x, y, symbol, playerId } = lastMove;
    
    // Check all directions
    const directions = [
      [[0, 1], [0, -1]],   // Horizontal
      [[1, 0], [-1, 0]],   // Vertical
      [[1, 1], [-1, -1]], // Diagonal \
      [[1, -1], [-1, 1]]  // Diagonal /
    ];
    
    for (const [dir1, dir2] of directions) {
      let count = 1;
      
      // Count in first direction
      count += this._countInDirection(x, y, dir1[0], dir1[1], symbol);
      // Count in opposite direction
      count += this._countInDirection(x, y, dir2[0], dir2[1], symbol);
      
      if (count >= this.winLength) {
        return {
          winner: playerId,
          reason: `${this.winLength} in a row!`
        };
      }
    }
    
    // Check for draw (board full)
    const isBoardFull = board.every(row => row.every(cell => cell !== null));
    if (isBoardFull) {
      this._finished = true;
      return {
        winner: null,
        reason: 'Draw - Board is full',
        isDraw: true
      };
    }
    
    return null;
  }
  
  _countInDirection(startX, startY, dx, dy, symbol) {
    let count = 0;
    let x = startX + dx;
    let y = startY + dy;
    
    while (
      x >= 0 && x < this.boardSize &&
      y >= 0 && y < this.boardSize &&
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
      boardSize: this.boardSize,
      winLength: this.winLength,
      players: this.players.map((p, i) => ({
        ...p,
        symbol: this.state.symbols[i]
      })),
      currentTurn: this._currentTurn,
      currentPlayer: this.getCurrentPlayer(),
      isFinished: this._finished,
      movesCount: this.state.moves.length
    };
  }
}

export default CaroGame;
