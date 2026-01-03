/**
 * StateSerializer - Utility for serializing/deserializing game state
 */
class StateSerializer {
  /**
   * Serialize game state to JSON string
   * @param {Object} state - Game state object
   * @returns {string}
   */
  static serialize(state) {
    return JSON.stringify(state);
  }
  
  /**
   * Deserialize JSON string to game state
   * @param {string} json - JSON string
   * @returns {Object}
   */
  static deserialize(json) {
    try {
      return JSON.parse(json);
    } catch (e) {
      console.error('Failed to deserialize state:', e);
      return null;
    }
  }
  
  /**
   * Create a diff between two states (for bandwidth optimization)
   * @param {Object} oldState - Previous state
   * @param {Object} newState - Current state
   * @returns {Object} - Diff object
   */
  static diff(oldState, newState) {
    const changes = {};
    
    for (const key in newState) {
      if (JSON.stringify(oldState[key]) !== JSON.stringify(newState[key])) {
        changes[key] = newState[key];
      }
    }
    
    return changes;
  }
  
  /**
   * Apply diff to state
   * @param {Object} state - Current state
   * @param {Object} diff - Diff object
   * @returns {Object} - New state
   */
  static applyDiff(state, diff) {
    return { ...state, ...diff };
  }
  
  /**
   * Deep clone a state object
   * @param {Object} state 
   * @returns {Object}
   */
  static clone(state) {
    return JSON.parse(JSON.stringify(state));
  }
  
  /**
   * Compress state for network transmission
   * @param {Object} state - Game state
   * @param {Array} visibleFields - Fields to include (null for all)
   * @returns {Object}
   */
  static compress(state, visibleFields = null) {
    if (!visibleFields) return state;
    
    const compressed = {};
    for (const field of visibleFields) {
      if (state[field] !== undefined) {
        compressed[field] = state[field];
      }
    }
    return compressed;
  }
}

export default StateSerializer;
