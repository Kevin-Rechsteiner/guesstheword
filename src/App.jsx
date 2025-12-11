import React, { useState, useEffect } from 'react';
import LobbyScreen from './pages/LobbyScreen';
import WaitingScreen from './pages/WaitingScreen';
import GameScreen from './pages/GameScreen';
import useWebSocket from './hooks/useWebSocket';

function App() {
  const [screen, setScreen] = useState('lobby'); // lobby, waiting, game
  const [roomId, setRoomId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [room, setRoom] = useState(null);
  const [incorrectGuessMessage, setIncorrectGuessMessage] = useState('');
  const { ws, connected, sendMessage } = useWebSocket();

  // Handle WebSocket messages
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      const { type, payload, message } = data;

      switch (type) {
        case 'ROOM_CREATED':
          setRoomId(payload.roomId);
          setPlayerId(payload.playerId);
          setPlayerName(payload.playerName);
          setIsHost(true);
          // Use room from server if provided, otherwise create fallback
          setRoom(payload.room || {
            roomId: payload.roomId,
            hostId: payload.playerId,
            gameStarted: false,
            currentRound: 0,
            totalRounds: 3,
            players: [{
              id: payload.playerId,
              name: payload.playerName,
              score: 0,
              guessed: false
            }],
            hints: [],
            timeRemaining: null
          });
          setScreen('waiting');
          console.log('✅ Room created:', payload.roomId);
          break;

        case 'ROOM_JOINED':
          setRoomId(payload.roomId);
          setPlayerId(payload.playerId);
          setPlayerName(payload.playerName);
          setRoom(payload.room);
          setIsHost(payload.room.hostId === payload.playerId);
          setScreen('waiting');
          console.log('✅ Joined room:', payload.roomId);
          break;

        case 'PLAYER_JOINED':
          setRoom(payload.room);
          break;

        case 'GAME_STARTED':
          setRoom(payload.room);
          setScreen('game');
          break;

        case 'NEW_ROUND':
          setRoom(payload.room);
          setScreen('game'); // ✅ Wechsele zu game screen!
          console.log('✅ Neue Runde gestartet:', payload.round);
          break;

        case 'HINT_REVEAL':
          // Update hints and room when new hint is revealed
          setRoom(payload.room);
          console.log('💡 Neue Hinweis offenbarte:', payload.hints);
          break;

        case 'PLAYER_GUESSED_CORRECT':
          setRoom(payload.room);
          break;

        case 'INCORRECT_GUESS':
          console.log('❌ Falsche Antwort:', message);
          setIncorrectGuessMessage('❌ Falsch! Versuchen Sie es noch einmal!');
          // Clear message nach 3 Sekunden
          setTimeout(() => setIncorrectGuessMessage(''), 3000);
          break;

        case 'ROUND_END':
          setRoom(payload.room);
          // Show round end screen briefly before next round
          setTimeout(() => {
            // Waiting for host to start next round
            setScreen('waiting');
          }, 2000);
          break;

        case 'GAME_OVER':
          setRoom(payload.room);
          // Game finished, show final scores
          setScreen('waiting');
          break;

        case 'ERROR':
          console.error('WebSocket Error:', message);
          break;

        default:
          break;
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws]);

  const handleCreateRoom = (name) => {
    sendMessage({
      type: 'CREATE_ROOM',
      payload: { playerName: name }
    });
  };

  const handleJoinRoom = (name, code) => {
    sendMessage({
      type: 'JOIN_ROOM',
      payload: { roomId: code, playerName: name }
    });
  };

  const handleStartGame = () => {
    sendMessage({
      type: 'START_GAME',
      payload: {}
    });
  };

  const handleSubmitGuess = (guess) => {
    sendMessage({
      type: 'SUBMIT_GUESS',
      payload: { guess }
    });
  };

  const handleNextRound = () => {
    sendMessage({
      type: 'NEXT_ROUND',
      payload: {}
    });
  };

  return (
    <div className="App">
      {!connected ? (
        <div className="connecting">
          <div className="spinner"></div>
          <h1>Verbindung wird hergestellt...</h1>
        </div>
      ) : screen === 'lobby' ? (
        <LobbyScreen onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
      ) : screen === 'waiting' ? (
        <WaitingScreen
          roomId={roomId}
          room={room}
          isHost={isHost}
          onStartGame={handleStartGame}
          onNextRound={handleNextRound}
        />
      ) : screen === 'game' ? (
        <GameScreen
          playerId={playerId}
          playerName={playerName}
          room={room}
          onSubmitGuess={handleSubmitGuess}
          incorrectGuessMessage={incorrectGuessMessage}
        />
      ) : null}
    </div>
  );
}

export default App;

