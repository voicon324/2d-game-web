/**
 * TimeManager - Utility for time-based operations
 */
class TimeManager {
  constructor() {
    this._startTime = 0;
    this._pausedTime = 0;
    this._isPaused = false;
  }
  
  /**
   * Start the timer
   */
  start() {
    this._startTime = Date.now();
    this._pausedTime = 0;
    this._isPaused = false;
  }
  
  /**
   * Pause the timer
   */
  pause() {
    if (!this._isPaused) {
      this._pausedTime = Date.now();
      this._isPaused = true;
    }
  }
  
  /**
   * Resume the timer
   */
  resume() {
    if (this._isPaused) {
      const pauseDuration = Date.now() - this._pausedTime;
      this._startTime += pauseDuration;
      this._isPaused = false;
    }
  }
  
  /**
   * Get elapsed time in milliseconds
   */
  getElapsed() {
    if (this._isPaused) {
      return this._pausedTime - this._startTime;
    }
    return Date.now() - this._startTime;
  }
  
  /**
   * Get elapsed time in seconds
   */
  getElapsedSeconds() {
    return this.getElapsed() / 1000;
  }
  
  /**
   * Create a countdown timer
   * @param {number} duration - Duration in milliseconds
   * @param {function} onTick - Callback for each tick
   * @param {function} onComplete - Callback when timer completes
   */
  static createCountdown(duration, onTick, onComplete) {
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const timer = setInterval(() => {
      const remaining = endTime - Date.now();
      
      if (remaining <= 0) {
        clearInterval(timer);
        if (onComplete) onComplete();
      } else {
        if (onTick) onTick(remaining);
      }
    }, 100);
    
    return {
      cancel: () => clearInterval(timer),
      getRemaining: () => Math.max(0, endTime - Date.now())
    };
  }
  
  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default TimeManager;
