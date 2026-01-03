import { VM } from 'vm2';
import BaseGame from './BaseGame.js';

/**
 * SandboxRunner - Safely execute admin-written game scripts
 * Uses VM2 to sandbox code execution
 */
class SandboxRunner {
  constructor(options = {}) {
    this.timeout = options.timeout || 1000; // 1 second timeout
    this.sandbox = options.sandbox || {};
  }
  
  /**
   * Create a game instance from admin script code
   * @param {string} scriptCode - The admin's game script
   * @param {Object} config - Game configuration
   * @returns {BaseGame|null}
   */
  createGame(scriptCode, config = {}) {
    try {
      const vm = new VM({
        timeout: this.timeout,
        sandbox: {
          BaseGame,
          Math,
          console: {
            log: (...args) => console.log('[Game Script]', ...args),
            error: (...args) => console.error('[Game Script]', ...args)
          },
          // Expose safe utilities
          utils: {
            random: (min, max) => Math.random() * (max - min) + min,
            randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
            clamp: (val, min, max) => Math.min(Math.max(val, min), max),
            distance: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
            lerp: (a, b, t) => a + (b - a) * t
          }
        }
      });
      
      // Wrap the script to return the game class
      const wrappedScript = `
        ${scriptCode}
        
        // The script should define a class called 'Game' that extends BaseGame
        if (typeof Game !== 'undefined') {
          new Game(${JSON.stringify(config)});
        } else {
          throw new Error('Script must define a Game class');
        }
      `;
      
      const gameInstance = vm.run(wrappedScript);
      
      if (!(gameInstance instanceof BaseGame)) {
        throw new Error('Game must extend BaseGame');
      }
      
      return gameInstance;
    } catch (error) {
      console.error('SandboxRunner error:', error.message);
      return null;
    }
  }
  
  /**
   * Validate script code without executing
   * @param {string} scriptCode
   * @returns {{ valid: boolean, error: string|null }}
   */
  validateScript(scriptCode) {
    // Check for dangerous patterns
    const dangerousPatterns = [
      /require\s*\(/,
      /import\s+/,
      /process\./,
      /global\./,
      /eval\s*\(/,
      /Function\s*\(/,
      /\.constructor/,
      /__proto__/,
      /prototype\./
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(scriptCode)) {
        return {
          valid: false,
          error: `Dangerous pattern detected: ${pattern.toString()}`
        };
      }
    }
    
    // Try to compile
    try {
      new VM({ timeout: 100 }).run(`(function() { ${scriptCode} })`);
      return { valid: true, error: null };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

export default SandboxRunner;
