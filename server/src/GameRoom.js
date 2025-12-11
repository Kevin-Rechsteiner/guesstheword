import RoundManager from './RoundManager.js';
import { WORD_LIST } from './utils/wordList.js';
import { TOTAL_ROUNDS, ROUND_DURATION } from './utils/config.js';

/**
 * GameRoom manages a single game session
 * Handles players, rounds, scoring, and game state
 */
class GameRoom {
  constructor(roomId, hostId, hostName, broadcastFunc = null) {
    this.roomId = roomId;
    this.hostId = hostId;
    this.players = new Map(); // playerId -> { name, score, guessed, ws }
    this.gameStarted = false;
    this.currentRound = 0;
    this.totalRounds = TOTAL_ROUNDS;
    this.roundManager = null;
    this.lastActivityTime = Date.now();
    this.MAX_PLAYERS = 8;
    this.broadcastFunc = broadcastFunc; // Function to broadcast messages

    // Add host as first player
    this.players.set(hostId, {
      id: hostId,
      name: hostName,
      score: 0,
      guessed: false,
      ws: null
    });
  }

  addPlayer(playerId, playerName) {
    if (this.players.has(playerId)) return false;

    this.players.set(playerId, {
      id: playerId,
      name: playerName,
      score: 0,
      guessed: false,
      ws: null
    });
    this.lastActivityTime = Date.now();
    return true;
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
    this.lastActivityTime = Date.now();

    // If host disconnects, transfer host to first player or end game
    if (playerId === this.hostId && this.players.size > 0) {
      const firstPlayer = this.players.keys().next().value;
      this.hostId = firstPlayer;
    }
  }

  storeWSConnection(playerId, ws) {
    const player = this.players.get(playerId);
    if (player) {
      player.ws = ws;
    }
  }

  startGame() {
    if (this.gameStarted) return false;
    if (this.players.size < 1) return false;

    this.gameStarted = true;
    this.currentRound = 0;
    this.resetPlayerScores();
    this.startNextRound();
    this.lastActivityTime = Date.now();
    return true;
  }

  startNextRound() {
    if (this.currentRound >= this.totalRounds) {
      return null; // Game over
    }

    this.currentRound++;
    this.resetRoundState();

    // Select random word and create round manager
    const wordData = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];

    // Callback function für Hint Reveals - wird vom RoundManager aufgerufen
    const onHintRevealed = (hints) => {
      if (this.broadcastFunc) {
        this.broadcastFunc({
          type: 'HINT_REVEAL',
          payload: {
            hints: hints,
            room: this.getPublicState()
          }
        });
      }
    };

    this.roundManager = new RoundManager(
      this.currentRound,
      wordData.word,
      wordData.hints,
      ROUND_DURATION,
      onHintRevealed
    );

    this.lastActivityTime = Date.now();

    return {
      roundNumber: this.currentRound,
      totalRounds: this.totalRounds,
      hints: this.roundManager.getRevealedHints(),
      timeRemaining: ROUND_DURATION
    };
  }

  resetRoundState() {
    this.players.forEach((player) => {
      player.guessed = false;
    });
  }

  resetPlayerScores() {
    this.players.forEach((player) => {
      player.score = 0;
    });
  }

  submitGuess(playerId, guess) {
    if (!this.roundManager) {
      return { correct: false, message: 'No round in progress' };
    }

    const player = this.players.get(playerId);
    if (!player) {
      return { correct: false, message: 'Player not found' };
    }

    if (player.guessed) {
      return { correct: false, message: 'Already guessed' };
    }

    const result = this.roundManager.checkGuess(guess);
    if (result.correct) {
      player.guessed = true;
      const points = this.roundManager.calculatePoints();
      player.score += points;

      this.lastActivityTime = Date.now();

      return {
        correct: true,
        points,
        pointsReason: this.getPointsReason(points)
      };
    }

    return { correct: false, message: 'Incorrect guess' };
  }

  getPointsReason(points) {
    const hintLevel = this.roundManager.currentHintIndex;
    const reasons = {
      4: 'Correct after hint 1!',
      3: 'Correct after hint 2!',
      2: 'Correct after hint 3!',
      1: 'Correct after final hint!'
    };
    return reasons[points] || 'Correct!';
  }

  isRoundComplete() {
    // Round complete if all players guessed or time expired
    const allGuessed = Array.from(this.players.values()).every((p) => p.guessed);
    const timeExpired = this.roundManager && this.roundManager.isTimeExpired();
    return allGuessed || timeExpired;
  }

  endCurrentRound() {
    if (this.roundManager) {
      this.roundManager.stop();
    }
    this.lastActivityTime = Date.now();
  }

  revealNextHint() {
    if (!this.roundManager) return null;
    return this.roundManager.revealNextHint();
  }

  getCurrentHints() {
    if (!this.roundManager) return [];
    return this.roundManager.getRevealedHints();
  }

  getRoundData() {
    if (!this.roundManager) return null;
    return {
      roundNumber: this.currentRound,
      totalRounds: this.totalRounds,
      hints: this.roundManager.getRevealedHints(),
      timeRemaining: this.roundManager.getTimeRemaining()
    };
  }

  getPublicState() {
    return {
      roomId: this.roomId,
      hostId: this.hostId,
      gameStarted: this.gameStarted,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      players: Array.from(this.players.values()).map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        guessed: p.guessed
      })),
      hints: this.roundManager ? this.roundManager.getRevealedHints() : [],
      timeRemaining: this.roundManager ? this.roundManager.getTimeRemaining() : null
    };
  }
}

export default GameRoom;
