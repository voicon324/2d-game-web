import BaseGame from '../engine/BaseGame.js';

class TicTacToe extends BaseGame {
  constructor(config = {}) {
    super({
      ...config,
      live: false,
      turnTimeout: config.turnTimeout || 15000
    });
    
    this.boardSize = 3;
    this.winLength = 3;
  }
  
  load(config) {
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
    if (x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize) return false;
    if (this.state.board[y][x] !== null) return false;
    
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== playerId) return false;
    
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
    
    const symbols = board.flatMap(row => row);
    
    // Check rows
    for(let r=0; r<3; r++) {
        if(board[r][0] && board[r][0] === board[r][1] && board[r][0] === board[r][2]) {
             return { winner: this.getPlayerBySymbol(board[r][0]), reason: '3 in a row!' };
        }
    }
    // Check cols
    for(let c=0; c<3; c++) {
        if(board[0][c] && board[0][c] === board[1][c] && board[0][c] === board[2][c]) {
             return { winner: this.getPlayerBySymbol(board[0][c]), reason: '3 in a row!' };
        }
    }
    // Diagonals
    if(board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
        return { winner: this.getPlayerBySymbol(board[0][0]), reason: '3 in a row!' };
    }
    if(board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
        return { winner: this.getPlayerBySymbol(board[0][2]), reason: '3 in a row!' };
    }

    // Draw
    if (symbols.every(c => c !== null)) {
      return { winner: null, isDraw: true, reason: 'Draw!' };
    }
    return null;
  }

  getPlayerBySymbol(symbol) {
      const idx = this.state.symbols.indexOf(symbol);
      return idx >= 0 ? this.players[idx].id : null;
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
      isFinished: this._finished
    };
  }
}

export default TicTacToe;
