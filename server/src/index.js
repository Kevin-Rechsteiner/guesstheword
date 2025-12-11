import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import GameManager from './GameManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const STATIC_PATH = path.join(__dirname, '../../dist');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(STATIC_PATH));

// Game Manager Instanz
const gameManager = new GameManager();

// WebSocket Connection Handler
wss.on('connection', (ws, req) => {
  const clientId = Math.random().toString(36).substr(2, 9);
  let currentRoomId = null;

  console.log(`[${clientId}] Client connected`);

  // Event Handler
  ws.on('message', (message) => {
    try {
      const event = JSON.parse(message);
      handleWebSocketMessage(ws, clientId, event, currentRoomId, (newRoomId) => {
        currentRoomId = newRoomId;
      });
    } catch (error) {
      console.error(`[${clientId}] Message parse error:`, error);
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    console.log(`[${clientId}] Client disconnected`);
    if (currentRoomId) {
      gameManager.removePlayerFromRoom(currentRoomId, clientId);
    }
  });

  ws.on('error', (error) => {
    console.error(`[${clientId}] WebSocket error:`, error);
  });
});

// Message Handler
function handleWebSocketMessage(ws, clientId, event, currentRoomId, updateRoomId) {
  const { type, payload } = event;

  switch (type) {
    case 'CREATE_ROOM': {
      const { playerName } = payload;
      const roomId = gameManager.createRoom(clientId, playerName);
      updateRoomId(roomId);
      const room = gameManager.getRoom(roomId);
      room.storeWSConnection(clientId, ws);

      // Set broadcast function after room is created (so we have roomId)
      room.broadcastFunc = (message) => {
        gameManager.broadcastToRoom(roomId, message);
      };

      ws.send(JSON.stringify({
        type: 'ROOM_CREATED',
        payload: {
          roomId,
          playerId: clientId,
          playerName,
          room: room.getPublicState()
        }
      }));
      console.log(`[${clientId}] Created room ${roomId}`);
      break;
    }

    case 'JOIN_ROOM': {
      const { roomId, playerName } = payload;
      const joinResult = gameManager.addPlayerToRoom(roomId, clientId, playerName);

      if (joinResult.success) {
        updateRoomId(roomId);
        const room = gameManager.getRoom(roomId);
        room.storeWSConnection(clientId, ws);

        // Set broadcast function if not already set
        if (!room.broadcastFunc) {
          room.broadcastFunc = (message) => {
            gameManager.broadcastToRoom(roomId, message);
          };
        }

        ws.send(JSON.stringify({
          type: 'ROOM_JOINED',
          payload: {
            roomId,
            playerId: clientId,
            playerName,
            room: room.getPublicState()
          }
        }));

        // Broadcast to all players in room
        gameManager.broadcastToRoom(roomId, {
          type: 'PLAYER_JOINED',
          payload: {
            room: room.getPublicState()
          }
        });
        console.log(`[${clientId}] Joined room ${roomId}`);
      } else {
        ws.send(JSON.stringify({
          type: 'ERROR',
          message: joinResult.error
        }));
      }
      break;
    }

    case 'START_GAME': {
      if (!currentRoomId) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Not in a room' }));
        break;
      }

      const room = gameManager.getRoom(currentRoomId);
      if (!room || room.hostId !== clientId) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Only host can start game' }));
        break;
      }

      room.startGame();

      // Broadcast GAME_STARTED to all players
      gameManager.broadcastToRoom(currentRoomId, {
        type: 'GAME_STARTED',
        payload: {
          room: room.getPublicState()
        }
      });

      // Send NEW_ROUND with hints and timer
      const roundData = room.getRoundData();
      gameManager.broadcastToRoom(currentRoomId, {
        type: 'NEW_ROUND',
        payload: {
          round: roundData,
          room: room.getPublicState()
        }
      });

      console.log(`[${clientId}] Started game in room ${currentRoomId}`);
      break;
    }

    case 'SUBMIT_GUESS': {
      if (!currentRoomId) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Not in a room' }));
        break;
      }

      const { guess } = payload;
      const room = gameManager.getRoom(currentRoomId);
      if (!room) break;

      const result = room.submitGuess(clientId, guess);
      if (result.correct) {
        ws.send(JSON.stringify({
          type: 'CORRECT_GUESS',
          payload: {
            points: result.points,
            pointsReason: result.pointsReason
          }
        }));

        gameManager.broadcastToRoom(currentRoomId, {
          type: 'PLAYER_GUESSED_CORRECT',
          payload: {
            playerId: clientId,
            room: room.getPublicState()
          }
        });

        if (room.isRoundComplete()) {
          room.endCurrentRound();
          gameManager.broadcastToRoom(currentRoomId, {
            type: 'ROUND_END',
            payload: {
              room: room.getPublicState()
            }
          });
        }
      } else {
        ws.send(JSON.stringify({
          type: 'INCORRECT_GUESS',
          message: 'Wrong answer, try again!'
        }));
      }
      break;
    }

    case 'NEXT_ROUND': {
      if (!currentRoomId) break;
      const room = gameManager.getRoom(currentRoomId);
      if (!room || room.hostId !== clientId) break;

      // Ensure broadcast function is set
      if (!room.broadcastFunc) {
        room.broadcastFunc = (message) => {
          gameManager.broadcastToRoom(currentRoomId, message);
        };
      }

      const nextRound = room.startNextRound();
      if (nextRound) {
        gameManager.broadcastToRoom(currentRoomId, {
          type: 'NEW_ROUND',
          payload: {
            round: nextRound,
            room: room.getPublicState()
          }
        });
        console.log(`[${clientId}] Started round ${room.currentRound} in room ${currentRoomId}`);
      } else {
        // Game Over
        gameManager.broadcastToRoom(currentRoomId, {
          type: 'GAME_OVER',
          payload: {
            room: room.getPublicState()
          }
        });
        console.log(`[${clientId}] Game over in room ${currentRoomId}`);
      }
      break;
    }

    default:
      console.log(`[${clientId}] Unknown message type: ${type}`);
  }
}

// REST API Endpoints (optional, für Debugging)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/api/stats', (req, res) => {
  res.json({
    activeRooms: gameManager.getRoomCount(),
    activePlayers: gameManager.getTotalPlayers()
  });
});

// Fallback zu index.html für SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(STATIC_PATH, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Page not found');
    }
  });
});

// Server starten
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  Word Guesser Game Server                                ║
║  WebSocket: ws://localhost:${PORT}                           ║
║  HTTP: http://localhost:${PORT}                            ║
╚══════════════════════════════════════════════════════════╝
  `);
});

