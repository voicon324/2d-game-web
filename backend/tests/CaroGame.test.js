import CaroGame from '../src/games/CaroGame.js';

describe('CaroGame Logic', () => {
  let game;

  beforeEach(() => {
    game = new CaroGame({
      turnTimeout: 30000,
      boardSize: 15,
      winLength: 5
    });
    
    // Add players
    game.addPlayer({ id: 'player1', username: 'Player 1' });
    game.addPlayer({ id: 'player2', username: 'Player 2' });
    
    // Initialize game
    game.load();
    game.start();
  });

  test('should initialize with empty board', () => {
    const state = game.getState();
    expect(state.board).toHaveLength(15);
    expect(state.board[0]).toHaveLength(15);
    expect(state.board[7][7]).toBe(null);
    expect(state.players).toHaveLength(2);
    expect(state.currentTurn).toBe(0);
  });

  test('should place a move correctly', () => {
    const valid = game.handleAction(
      { type: 'PLACE', data: { x: 7, y: 7 } },
      'player1'
    );

    expect(valid).toBe(true);
    expect(game.state.board[7][7]).toBe('X');
    expect(game.state.moves[0].playerId).toBe('player1');
  });

  test('should reject invalid moves (out of bounds)', () => {
    const valid = game.handleAction(
      { type: 'PLACE', data: { x: -1, y: 0 } },
      'player1'
    );
    expect(valid).toBe(false);
  });

  test('should reject invalid moves (occupied)', () => {
    game.handleAction({ type: 'PLACE', data: { x: 7, y: 7 } }, 'player1');
    const valid = game.handleAction(
      { type: 'PLACE', data: { x: 7, y: 7 } },
      'player2'
    );
    expect(valid).toBe(false);
  });
  
  test('should reject moves out of turn', () => {
    // Player 1 went first (index 0)
    game.handleAction({ type: 'PLACE', data: { x: 7, y: 7 } }, 'player1');
    
    // Player 1 tries to go again
    const valid = game.handleAction(
      { type: 'PLACE', data: { x: 7, y: 8 } },
      'player1'
    );
    expect(valid).toBe(false);
  });

  test('should detect horizontal win', () => {
    // X X X X X
    const moves = [
      [0, 0], [0, 1], // p1 (0,0), p2 (0,1)
      [1, 0], [1, 1], // p1 (1,0) ...
      [2, 0], [2, 1],
      [3, 0], [3, 1],
      [4, 0]          // p1 (4,0) - WIN
    ];
    
    let win;
    for (const [x, y] of moves) {
      const playerId = game.getCurrentPlayer().id;
      game.handleAction({ type: 'PLACE', data: { x, y } }, playerId);
      win = game.isWin();
      if (win) break;
    }
    
    expect(win).toBeDefined();
    expect(win.winner).toBe('player1');
  });

  test('should detect diagonal win', () => {
    // Diagonal X
    const moves = [
      [0, 0], [0, 1],
      [1, 1], [0, 2],
      [2, 2], [0, 3],
      [3, 3], [0, 4],
      [4, 4]
    ];
    
    let win;
    for (const [x, y] of moves) {
      const playerId = game.getCurrentPlayer().id;
      game.handleAction({ type: 'PLACE', data: { x, y } }, playerId);
      win = game.isWin();
      if (win) break;
    }
    
    expect(win).toBeDefined();
    expect(win.winner).toBe('player1');
  });
  test('should detect vertical win', () => {
    // Vertical X
    const moves = [
      [7, 0], [0, 0], // p1 (7,0)
      [7, 1], [0, 1],
      [7, 2], [0, 2],
      [7, 3], [0, 3],
      [7, 4]          // WIN
    ];
    
    let win;
    for (const [x, y] of moves) {
      const playerId = game.getCurrentPlayer().id;
      game.handleAction({ type: 'PLACE', data: { x, y } }, playerId);
      win = game.isWin();
      if (win) break;
    }
    
    expect(win).toBeDefined();
    expect(win.winner).toBe('player1');
  });

  test('should detect anti-diagonal win (/)', () => {
    // Anti-Diagonal /
    // Start at (4,0) go to (0,4)
    const moves = [
      [4, 0], [0, 0],
      [3, 1], [0, 1],
      [2, 2], [0, 2],
      [1, 3], [0, 3],
      [0, 4]          // WIN
    ];
    
    let win;
    for (const [x, y] of moves) {
      const playerId = game.getCurrentPlayer().id;
      game.handleAction({ type: 'PLACE', data: { x, y } }, playerId);
      win = game.isWin();
      if (win) break;
    }
    
    expect(win).toBeDefined();
    expect(win.winner).toBe('player1');
  });

  test('should not win with only 4 in a row', () => {
    const moves = [
      [0, 0], [0, 1],
      [1, 0], [1, 1],
      [2, 0], [2, 1],
      [3, 0] // 4th X
    ];
    
    let win;
    for (const [x, y] of moves) {
      const playerId = game.getCurrentPlayer().id;
      game.handleAction({ type: 'PLACE', data: { x, y } }, playerId);
      win = game.isWin();
    }
    
    expect(win).toBeNull();
  });

  test('should detect draw when board is full', () => {
    game = new CaroGame({ boardSize: 3, winLength: 3 }); // 3x3 board, win 3
    game.addPlayer({ id: 'p1' });
    game.addPlayer({ id: 'p2' });
    game.load();
    game.start();

    // Draw pattern for 3x3
    const moves = [
      [0, 0], [1, 0],
      [2, 0], [1, 1],
      [0, 1], [2, 1],
      [1, 2], [0, 2],
      [2, 2]
    ];
    
    let result;
    for (const [x, y] of moves) {
      const playerId = game.getCurrentPlayer().id;
      game.handleAction({ type: 'PLACE', data: { x, y } }, playerId);
      result = game.isWin();
      if (result) break;
    }
    
    expect(result).toBeDefined();
    expect(result.isDraw).toBe(true);
  });
});
