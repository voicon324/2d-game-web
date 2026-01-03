import BaseGame from '../engine/BaseGame.js';

class Memory extends BaseGame {
  constructor(config = {}) {
    super({
      ...config,
      live: false,
      turnTimeout: config.turnTimeout || 20000
    });
    
    this.boardSize = 6; // 6x6 = 36 cards (18 pairs)
    this.icons = [
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', 'pandas', '🐨',
        '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦'
    ].slice(0, (this.boardSize * this.boardSize) / 2);
  }
  
  load(config) {
    const cards = [...this.icons, ...this.icons]
        .sort(() => Math.random() - 0.5)
        .map((icon, id) => ({ id, icon, revealed: false, matched: false, owner: null }));
    
    // Map linear array to 2D
    const board = [];
    for(let i=0; i<this.boardSize; i++) {
        board.push(cards.slice(i*this.boardSize, (i+1)*this.boardSize));
    }

    this.state = {
      board, // 2D array of objects
      firstPick: null, // {x, y, card}
      score: {},
      isBusy: false // Delaying flip back
    };
    this.players.forEach(p => this.state.score[p.id] = 0);
  }
  
  // Custom logic to handle flip back delay?
  // Frontend might handle animation, but backend enforces state.
  
  handleAction(action, playerId) {
    const { type, data } = action;
    if (type !== 'PLACE') return false; // Using generic PLACE/Click
    
    if (this.state.isBusy) return false;

    const { x, y } = data;
    const card = this.state.board[y][x];
    
    if (card.revealed || card.matched) return false;
    
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== playerId) return false;

    // Flip card
    card.revealed = true;
    
    if (!this.state.firstPick) {
        // First card flipped
        this.state.firstPick = { x, y, card };
        // Do not change turn
    } else {
        // Second card flipped
        const first = this.state.firstPick;
        
        if (card.icon === first.card.icon) {
            // Match!
            card.matched = true;
            first.card.matched = true;
            card.owner = playerId;
            first.card.owner = playerId;
            
            this.state.score[playerId] = (this.state.score[playerId] || 0) + 1;
            this.state.firstPick = null;
            
            // Player keeps turn on match
            
            // Check win
            const allMatched = this.state.board.every(row => row.every(c => c.matched));
            if (allMatched) {
                this.finishGame();
            }
        } else {
            // No match
            this.state.isBusy = true;
            setTimeout(() => {
                card.revealed = false;
                first.card.revealed = false;
                this.state.firstPick = null;
                this.state.isBusy = false;
                this.nextTurn();
                // We need to notify frontend?
                // BaseGame/GameLoop doesn't auto-emit on setTimeout.
                // We might need a callback or just reply on next interaction?
                // This is a limitation of BaseGame lacking 'emit' access.
                // However, GameLoop checks state changes? No.
                // We should probably NOT use setTimeout in backend for pure logic class if possible,
                // OR we need a way to trigger update.
                // For now, let's just leave them Revealed in state, and have a 'flipBack' phase?
                // Or: assume frontend hides them after mismatch? Secure? No.
                
                // Better approach:
                // State has 'mismatch: [{x,y}, {x,y}]' field.
                // On next action (by ANYONE?), we clear mismatch?
                // Or use a 'resolve' action?
                
                // Let's rely on the engine polling or user clicking 'End Turn'?
                // Actually, let's just leave them revealed and switch turn. 
                // The NEXT player must click to 'confirm' mismatch?
                // Or better: The backend handles the state. If isBusy, we reject actions.
                // We need a mechanism to emit the "flip back" event.
                // Since I cannot pass `emit` here easily without refactoring engine.
                
                // Hack: We change turn immediately, but mark cards as "pending_hide".
                // Frontend shows them for a second, then hides them.
                // Backend clears them on next interaction?
            }, 1000); 
            // Since I can't emit, this timeout updates memory state but client won't know until next poll/action.
            // Client receives "revealed: true" for both.
            // It sees they don't match.
            // Client animates them closing.
            // Client sends "ACK_MISMATCH"?
            
            // Simpler: 
            // 2nd Flip -> Result: { success: true, match: false, cards: [...] }
            // Backend sets turn to next.
            // Backend sets revealed = false for these two cards (IMMEDIATELY).
            // Frontend receives state where cards are HIDDEN.
            // Frontend knows "I just clicked X and Y, now they are hidden".
            // Frontend shows animation of them opening then closing?
            // This requires frontend to track "Last Move" diff.
            
            // Let's try this:
            // return state with revealed=true.
            // AND a separate "temporaryReveal" field in state?
            // "lastMismatch": [{x,y, icon}, {x,y, icon}]
            // Then clear revealed in board.
       }
    }
  }

  // Override handleAction to support the mismatch logic better? 
  // For now I'll use the "lastMismatch" approach.
  handleActionV2(action, playerId) { 
     // ... (implementation ref to above idea)
     // To keep simple:
     // If match: revealed=true forever.
     // If mismatch: revealed=true in THIS state update.
     // But we set a flag "waitingForTurnEnd".
     // Next action triggers the hide?
  }
}

// Redo Memory with explicit handling
class MemoryV2 extends BaseGame {
    constructor(config={}) {
        super({...config, live: false});
        this.boardSize = 6;
        this.icons = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦'];
    }
    load() {
        // ... same init ...
        const cards = [...this.icons, ...this.icons].sort(()=>Math.random()-0.5).map((icon,id)=>({id, icon, status: 'hidden'})); // status: hidden, revealed, matched
        this.state = {
            board: [], // 2D
             // ...
            score: {},
            lastMismatch: null // to show brief reveal
        };
        // fill board
        for(let i=0; i<this.boardSize; i++) this.state.board.push(cards.slice(i*this.boardSize, (i+1)*this.boardSize));
        this.players.forEach(p => this.state.score[p.id] = 0);
    }
    
    handleAction(action, playerId) {
        if (action.type !== 'PLACE') return false;
        
        // If there was a mismatch pending, clear it first
        if (this.state.lastMismatch) {
            this.state.lastMismatch.forEach(({x,y}) => this.state.board[y][x].status = 'hidden');
            this.state.lastMismatch = null;
            // Next turn was already set.
            // If the user clicked a card, we process it as new move.
            // But we might want to ignore the specific click if it was just "clearing".
            // Let's assume clicks always mean "Flip this".
        }

        const {x,y} = action.data;
        const card = this.state.board[y][x];
        if (card.status !== 'hidden') return false;
        
        const currentPlayer = this.getCurrentPlayer();
        if (currentPlayer.id !== playerId) return false;

        card.status = 'revealed';
        
        // Find other revealed card
        let revealed = [];
        this.state.board.forEach((row, ry) => row.forEach((c, rx) => {
            if (c.status === 'revealed' && (rx !== x || ry !== y)) revealed.push({x:rx, y:ry, card: c});
        }));
        
        if (revealed.length === 0) {
            // First pick
            return true;
        } else {
            // Second pick
            const first = revealed[0];
            if (first.card.icon === card.icon) {
                // Match
                card.status = 'matched';
                first.card.status = 'matched';
                this.state.score[playerId] = (this.state.score[playerId]||0) + 1;
                // Keep turn
                
                // Win check
                if (this.state.board.every(row => row.every(c => c.status === 'matched'))) {
                    // Win...
                }
            } else {
                // Mismatch
                this.state.lastMismatch = [{x,y}, {x:first.x, y:first.y}];
                // We leave them 'revealed' for this update so frontend sees them.
                // Next action will hide them.
                this.nextTurn();
            }
            return true;
        }
    }
    
    getState() {
        // We mask hidden cards!
        return {
            board: this.state.board.map(row => row.map(c => ({
                ...c,
                icon: c.status === 'hidden' ? null : c.icon 
            }))),
            score: this.state.score,
            boardSize: this.boardSize,
            currentPlayer: this.getCurrentPlayer()
        };
    }
}
export default MemoryV2;
