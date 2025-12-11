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
  const [inviteRoomCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('room');
    return code ? code.toUpperCase() : '';
  });
  const [invitePlayerName] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const rawName = params.get('name');
    return rawName ? decodeURIComponent(rawName).slice(0, 20) : '';
  });
  const [autoJoinTriggered, setAutoJoinTriggered] = useState(false);
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
            totalRounds: 5,
            lastWord: null,
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
          // Jump directly to waiting screen; solution shown there
          setScreen('waiting');
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

  const handleReturnToLobby = () => {
    setRoomId(null);
    setPlayerId(null);
    setPlayerName('');
    setIsHost(false);
    setRoom(null);
    setScreen('lobby');
  };

  // Auto-join if invite link includes both room and name
  useEffect(() => {
    if (
      connected &&
      inviteRoomCode &&
      invitePlayerName &&
      !autoJoinTriggered &&
      !roomId
    ) {
      handleJoinRoom(invitePlayerName, inviteRoomCode);
      setAutoJoinTriggered(true);
    }
  }, [connected, inviteRoomCode, invitePlayerName, autoJoinTriggered, roomId]);

  return (
    <div className="App">
      {!connected ? (
        <div className="connecting">
          <div className="spinner"></div>
          <h1>Verbindung wird hergestellt...</h1>
        </div>
      ) : screen === 'lobby' ? (
        <LobbyScreen
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          initialRoomCode={inviteRoomCode}
          initialPlayerName={invitePlayerName}
        />
      ) : screen === 'waiting' ? (
        <WaitingScreen
          roomId={roomId}
          room={room}
          isHost={isHost}
          onStartGame={handleStartGame}
          onNextRound={handleNextRound}
          onReturnToLobby={handleReturnToLobby}
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

