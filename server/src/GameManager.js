import GameRoom from './GameRoom.js';

/**
 * GameManager orchestrates all game rooms
 * Manages room creation, player management, and room cleanup
 */
class GameManager {
  constructor() {
    this.rooms = new Map(); // roomId -> GameRoom
    this.playerRoomMap = new Map(); // playerId -> roomId
    this.wsConnections = new Map(); // clientId -> WebSocket
  }

  createRoom(hostId, hostName, broadcastFunc = null) {
    const roomId = this.generateRoomCode();
    const room = new GameRoom(roomId, hostId, hostName, broadcastFunc);
    this.rooms.set(roomId, room);
    this.playerRoomMap.set(hostId, roomId);
    return roomId;
  }

  addPlayerToRoom(roomId, playerId, playerName) {
    const room = this.getRoom(roomId);

    if (!room) {
      return { success: false, error: 'Room does not exist' };
    }

    if (room.players.size >= room.MAX_PLAYERS) {
      return { success: false, error: 'Room is full' };
    }

    if (room.gameStarted) {
      return { success: false, error: 'Game has already started' };
    }

    room.addPlayer(playerId, playerName);
    this.playerRoomMap.set(playerId, roomId);
    return { success: true };
  }

  removePlayerFromRoom(roomId, playerId) {
    const room = this.getRoom(roomId);
    if (!room) return;

    room.removePlayer(playerId);
    this.playerRoomMap.delete(playerId);

    // Clean up empty rooms
    if (room.players.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getRoomByPlayerId(playerId) {
    const roomId = this.playerRoomMap.get(playerId);
    return this.getRoom(roomId);
  }

  broadcastToRoom(roomId, message) {
    const room = this.getRoom(roomId);
    if (!room) return;

    room.players.forEach((player) => {
      if (player.ws && player.ws.readyState === 1) { // OPEN
        player.ws.send(JSON.stringify(message));
      }
    });
  }

  storeWSConnection(clientId, ws) {
    this.wsConnections.set(clientId, ws);
  }

  getRoomCount() {
    return this.rooms.size;
  }

  getTotalPlayers() {
    let total = 0;
    this.rooms.forEach((room) => {
      total += room.players.size;
    });
    return total;
  }

  generateRoomCode() {
    let code;
    do {
      code = Math.random().toString(36).substring(2, 6).toUpperCase();
    } while (this.rooms.has(code));
    return code;
  }

  cleanupInactiveRooms() {
    const now = Date.now();
    const INACTIVITY_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

    this.rooms.forEach((room, roomId) => {
      if (now - room.lastActivityTime > INACTIVITY_TIMEOUT) {
        this.rooms.delete(roomId);
      }
    });
  }
}

export default GameManager;
