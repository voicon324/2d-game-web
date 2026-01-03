/**
 * BaseGame - Abstract base class for all games
 * All games MUST extend this class and implement all required methods
 */
class BaseGame {
  constructor(config = {}) {
    this.state = {};
    this.players = [];
    this.config = config;
    
    // Game type configuration
    this.live = config.live || false;           // real-time game?
    this.timePerStep = config.timePerStep || 16; // ms per tick (60fps default)
    this.turnTimeout = config.turnTimeout || 30000; // ms per turn
    
    // Board configuration
    this.boardWidth = config.boardWidth || 800;
    this.boardHeight = config.boardHeight || 600;
    
    // Internal state
    this._started = false;
    this._finished = false;
    this._currentTurn = 0;
  }
  
  /**
   * Initialize game state
   * Called once when game starts
   * @param {Object} config - Game configuration
   */
  load(config) {
    throw new Error('BaseGame.load() must be implemented');
  }
  
  /**
   * Handle player action/input
   * Called when a player sends an action
   * @param {Object} action - The action object { type, data }
   * @param {string} playerId - The player's ID
   * @returns {boolean} - Whether the action was valid
   */
  handleAction(action, playerId) {
    throw new Error('BaseGame.handleAction() must be implemented');
  }
  
  /**
   * Update game state (for real-time games)
   * Called every tick for live games
   * @param {number} dt - Delta time in milliseconds
   */
  update(dt) {
    // Optional - only needed for real-time games
  }
  
  /**
   * Check win condition
   * @returns {Object|null} - { winner: playerId, reason: string } or null if no winner yet
   */
  isWin() {
    return null;
  }
  
  /**
   * Check if game is over
   * @returns {boolean}
   */
  isGameOver() {
    return this.isWin() !== null || this._finished;
  }
  
  /**
   * Get current game state to send to clients
   * @returns {Object} - State object
   */
  getState() {
    return {
      ...this.state,
      players: this.players,
      currentTurn: this._currentTurn,
      isFinished: this._finished
    };
  }
  
  /**
   * Add a player to the game
   * @param {Object} player - { id, username, avatar }
   */
  addPlayer(player) {
    if (!this._started) {
      this.players.push({
        id: player.id,
        username: player.username,
        avatar: player.avatar,
        index: this.players.length
      });
      return true;
    }
    return false;
  }
  
  /**
   * Remove a player from the game
   * @param {string} playerId
   */
  removePlayer(playerId) {
    const index = this.players.findIndex(p => p.id === playerId);
    if (index !== -1) {
      this.players.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * Get the current player (for turn-based games)
   * @returns {Object|null}
   */
  getCurrentPlayer() {
    if (this.players.length === 0) return null;
    return this.players[this._currentTurn % this.players.length];
  }
  
  /**
   * Advance to next turn (for turn-based games)
   */
  nextTurn() {
    this._currentTurn++;
  }
  
  /**
   * Start the game
   */
  start() {
    this._started = true;
  }
  
  /**
   * End the game
   */
  finish() {
    this._finished = true;
  }
}

export default BaseGame;
