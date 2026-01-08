import BaseGame from '../engine/BaseGame.js';

class Drawing extends BaseGame {
  constructor(config = {}) {
    super({
      ...config,
      live: true, // Realtime
    });
    
    this.boardSize = 16;
  }
  
  load(config) {
    this.boardSize = config.boardSize || this.boardSize;
    this.state = {
      board: Array(this.boardSize).fill(null).map(() => 
        Array(this.boardSize).fill('#FFFFFF') // White canvas
      )
    };
  }
  
  handleAction(action, playerId) {
    const { type, data } = action;
    if (type !== 'PLACE') return false; // Used for painting
    // data: { x, y, color }
    
    const { x, y, color } = data;
    if (x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize) return false;
    
    this.state.board[y][x] = color || '#000000';
    return true; // Action successful
  }
  
  getState() {
    return {
      board: this.state.board,
      boardSize: this.boardSize,
      players: this.players,
      currentTurn: this._currentTurn,
      isFinished: this._finished
    };
  }
}

export default Drawing;
