/**
 * GameLoop - Manages game update cycles
 * Handles both real-time and turn-based games
 */
class GameLoop {
  constructor(game, options = {}) {
    this.game = game;
    this.tickRate = options.tickRate || 60; // ticks per second
    this.interval = 1000 / this.tickRate;
    
    this._running = false;
    this._lastTime = 0;
    this._timer = null;
    this._onStateChange = options.onStateChange || (() => {});
    this._onGameEnd = options.onGameEnd || (() => {});
  }
  
  /**
   * Start the game loop
   */
  start() {
    if (this._running) return;
    
    this._running = true;
    this._lastTime = Date.now();
    this.game.start();
    
    if (this.game.live) {
      // Real-time game: continuous update loop
      this._timer = setInterval(() => this._tick(), this.interval);
    }
    
    // Emit initial state
    this._onStateChange(this.game.getState());
  }
  
  /**
   * Stop the game loop
   */
  stop() {
    this._running = false;
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
  
  /**
   * Game tick - called every frame for real-time games
   */
  _tick() {
    if (!this._running) return;
    
    const now = Date.now();
    const dt = now - this._lastTime;
    this._lastTime = now;
    
    // Update game state
    const hasChanged = this.game.update(dt);
    
    // Check win condition
    const result = this.game.isWin();
    if (result) {
      this.stop();
      this.game.finish();
      this._onGameEnd(result);
      return;
    }
    
    // Emit state change only if changed
    if (hasChanged) {
      this._onStateChange(this.game.getState());
    }
  }
  
  /**
   * Handle player action
   * @param {Object} action - { type, data }
   * @param {string} playerId - Player ID
   */
  handleAction(action, playerId) {
    if (!this._running) return { success: false, error: 'Game not running' };
    
    // Validate it's the player's turn (for turn-based games)
    if (!this.game.live) {
      const currentPlayer = this.game.getCurrentPlayer();
      if (currentPlayer && currentPlayer.id !== playerId) {
        return { success: false, error: 'Not your turn' };
      }
    }
    
    // Handle the action
    const result = this.game.handleAction(action, playerId);
    
    if (result) {
      // Check win condition after action
      const winResult = this.game.isWin();
      if (winResult) {
        this.stop();
        this.game.finish();
        this._onGameEnd(winResult);
      } else {
        // Emit state change
        this._onStateChange(this.game.getState());
      }
    }
    
    return { success: result, state: this.game.getState() };
  }
  
  /**
   * Get current game state
   */
  getState() {
    return this.game.getState();
  }
  
  /**
   * Check if game is running
   */
  isRunning() {
    return this._running;
  }
}

export default GameLoop;
