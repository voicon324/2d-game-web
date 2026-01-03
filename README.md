# 🎮 2D Game Platform

A scalable, real-time multiplayer 2D game platform built with Node.js, React, and Socket.IO.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-141%2B%20passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **Multiple Games**: Caro, TicTacToe, Connect4, Memory, Match3, Drawing, Tank
- **Real-time Multiplayer**: WebSocket-based gameplay
- **ELO Matchmaking**: Skill-based player matching
- **Replay System**: Record and watch game replays
- **Admin Game Editor**: Write custom games with Monaco Editor
- **Tournament System**: Organize competitive tournaments
- **Spectator Mode**: Watch live games

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 7+
- Docker (optional)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/game2d-platform.git
cd game2d-platform

# Start all services
docker compose up -d

# Access the app
open http://localhost:8080
```

### Option 2: Manual Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env  # Configure your environment
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────────────────┐  │
│  │ Game Pages  │ │ Matchmaking  │ │ Admin (Monaco Editor) │  │
│  └──────┬──────┘ └──────┬───────┘ └───────────┬───────────┘  │
│         │               │                     │              │
│         └───────────────┼─────────────────────┘              │
│                         │ WebSocket + REST                   │
└─────────────────────────┼────────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────────┐
│                  Backend (Node.js + Express)                  │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────────────┐    │
│  │ Game Engine │ │ Matchmaking  │ │ Replay Recording    │    │
│  │ (Sandbox)   │ │ (ELO-based)  │ │ (Action Timeline)   │    │
│  └──────┬──────┘ └──────────────┘ └─────────────────────┘    │
│         │                                                     │
│  ┌──────┴──────────────────────────────────────────────────┐ │
│  │                     MongoDB                              │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
game2d-platform/
├── backend/
│   ├── src/
│   │   ├── engine/        # Game engine (BaseGame, GameLoop, Sandbox)
│   │   ├── games/         # Built-in games
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # REST API endpoints
│   │   └── websocket/     # Real-time handlers
│   └── tests/             # Jest integration tests
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── services/      # API services
│   ├── tests/             # Vitest unit tests
│   └── e2e/               # Playwright E2E tests
└── docker-compose.yml
```

## 🎯 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Games
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/games` | List all games |
| GET | `/api/games/:slug` | Get game details |
| POST | `/api/games/:slug/rooms` | Create game room |
| POST | `/api/games/rooms/:code/join` | Join room |

### Matchmaking
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/matchmaking/join` | Join queue |
| DELETE | `/api/matchmaking/leave` | Leave queue |
| GET | `/api/matchmaking/status` | Queue status |

### Replays
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/replays/match/:id` | Get replay |
| GET | `/api/replays/user/:id` | User's replays |

### Admin (Requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/games/:id/script` | Get game script |
| PUT | `/api/games/:id/script` | Update script |
| POST | `/api/games/:id/script/validate` | Validate script |

## 🔌 WebSocket Events

### Client → Server
```javascript
socket.emit('room:join', { roomCode });
socket.emit('room:ready', { isReady: true });
socket.emit('game:action', { action: { type, data } });
socket.emit('matchmaking:join', { gameSlug, userId });
socket.emit('matchmaking:leave', { userId });
```

### Server → Client
```javascript
socket.on('room:updated', ({ match, players }) => {});
socket.on('game:start', ({ match, state }) => {});
socket.on('game:state', ({ state }) => {});
socket.on('game:end', ({ result, match }) => {});
socket.on('matchmaking:found', ({ roomCode, players }) => {});
```

## 🧪 Testing

```bash
# Backend tests (76 tests)
cd backend && npm test

# Frontend tests (65 tests)
cd frontend && npm test

# E2E tests
cd frontend && npx playwright test
```

## 🐳 Docker Commands

```bash
# Build and start
docker compose up -d --build

# View logs
docker compose logs -f backend

# Stop all services
docker compose down

# Reset database
docker compose down -v
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/game2d
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

## 📝 Creating Custom Games

Games extend the `BaseGame` class:

```javascript
class Game extends BaseGame {
  load(config) {
    this.state = { /* initial state */ };
  }

  handleAction(action, playerId) {
    // Process player action
    return true; // or false if invalid
  }

  isWin() {
    // Return { winner, reason } or null
  }

  getState() {
    return this.state;
  }
}
```

Available utilities: `utils.random()`, `utils.clamp()`, `utils.distance()`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
