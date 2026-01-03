# API Documentation

## Base URL
```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication

All authenticated endpoints require a Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

---

## Auth Endpoints

### POST /auth/register
Create a new user account.

**Request Body:**
```json
{
  "username": "player123",
  "email": "player@example.com",
  "password": "securepassword"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "65a...",
    "username": "player123",
    "email": "player@example.com",
    "role": "user"
  }
}
```

### POST /auth/login
Authenticate existing user.

**Request Body:**
```json
{
  "email": "player@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

---

## Games Endpoints

### GET /games
List all active games.

**Response (200):**
```json
[
  {
    "_id": "65a...",
    "name": "Cờ Caro",
    "slug": "caro",
    "type": "turn-based",
    "minPlayers": 2,
    "maxPlayers": 2,
    "isActive": true
  }
]
```

### GET /games/:slug
Get game by slug.

### POST /games/:slug/rooms 🔒
Create a new game room.

**Response (201):**
```json
{
  "_id": "65a...",
  "roomCode": "ABC123",
  "game": { ... },
  "players": [{ "user": { ... }, "isReady": false }],
  "status": "waiting"
}
```

### POST /games/rooms/:code/join 🔒
Join an existing room.

---

## Matchmaking Endpoints

### POST /matchmaking/join 🔒
Join matchmaking queue.

**Request Body:**
```json
{
  "gameSlug": "caro",
  "socketId": "socket-id-from-client"
}
```

**Response (201):**
```json
{
  "message": "Joined matchmaking queue",
  "queueId": "65a...",
  "rating": 1000
}
```

### DELETE /matchmaking/leave 🔒
Leave matchmaking queue.

### GET /matchmaking/status 🔒
Get current queue status.

**Response (200):**
```json
{
  "inQueue": true,
  "gameSlug": "caro",
  "rating": 1050,
  "queuedAt": "2024-01-01T10:00:00Z",
  "waitTime": 15000
}
```

### GET /matchmaking/stats
Get queue statistics (public).

**Response (200):**
```json
[
  { "_id": "caro", "count": 5 },
  { "_id": "tictactoe", "count": 3 }
]
```

---

## Replays Endpoints

### GET /replays/match/:matchId
Get replay by match ID.

**Response (200):**
```json
{
  "_id": "65a...",
  "match": "65a...",
  "gameSlug": "caro",
  "players": [
    { "id": "user1", "username": "Player1" },
    { "id": "user2", "username": "Player2" }
  ],
  "initialState": { ... },
  "actions": [
    {
      "playerId": "user1",
      "action": { "type": "PLACE", "x": 7, "y": 7 },
      "timestamp": 1500,
      "resultState": { ... }
    }
  ],
  "result": {
    "winnerId": "user1",
    "reason": "Five in a row"
  },
  "duration": 45000
}
```

### GET /replays/user/:userId
Get user's replay history.

### GET /replays/:id
Get replay by its ID.

---

## Admin Endpoints 🔒 (Admin only)

### GET /games/:id/script
Get game script code.

**Response (200):**
```json
{
  "_id": "65a...",
  "name": "Custom Game",
  "slug": "custom",
  "scriptCode": "class Game extends BaseGame { ... }"
}
```

### POST /games/:id/script/validate
Validate script without saving.

**Request Body:**
```json
{
  "scriptCode": "class Game extends BaseGame { ... }"
}
```

**Response (200):**
```json
{
  "valid": true,
  "message": "Script syntax is valid!"
}
```

Or if invalid:
```json
{
  "valid": false,
  "error": "Script must define a Game class"
}
```

### PUT /games/:id/script
Update game script.

**Request Body:**
```json
{
  "scriptCode": "class Game extends BaseGame { ... }"
}
```

---

## WebSocket Events

### Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: { token: 'your-jwt-token' }
});
```

### Room Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `room:join` | → Server | `{ roomCode }` |
| `room:leave` | → Server | - |
| `room:ready` | → Server | `{ isReady }` |
| `room:updated` | ← Server | `{ match, players }` |
| `room:chat` | ↔ | `{ sender, text, timestamp }` |

### Game Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `game:action` | → Server | `{ action: { type, data } }` |
| `game:start` | ← Server | `{ match, state }` |
| `game:state` | ← Server | `{ state }` |
| `game:end` | ← Server | `{ result, match }` |
| `game:invalid_action` | ← Server | `{ error }` |

### Matchmaking Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `matchmaking:join` | → Server | `{ gameSlug, userId }` |
| `matchmaking:leave` | → Server | `{ userId }` |
| `matchmaking:joined` | ← Server | `{ queueId, rating }` |
| `matchmaking:found` | ← Server | `{ roomCode, gameSlug, players }` |
| `matchmaking:error` | ← Server | `{ message }` |

---

## Error Responses

All errors follow this format:
```json
{
  "message": "Error description"
}
```

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

---

## Rate Limits

- Auth endpoints: 10 requests/minute
- Game endpoints: 60 requests/minute
- WebSocket: 100 messages/second per connection

---

## ELO Rating System

Rating calculation:
```
K = 32
Expected = 1 / (1 + 10^((OpponentRating - YourRating) / 400))
NewRating = OldRating + K * (ActualScore - Expected)
```

- Win: ActualScore = 1
- Loss: ActualScore = 0
- Draw: ActualScore = 0.5

Initial rating: 1000
