import React, { useState } from 'react';
import '../styles/LobbyScreen.css';

function LobbyScreen({ onCreateRoom, onJoinRoom }) {
  const [playerName, setPlayerName] = useState('');
  const [mode, setMode] = useState('choose'); // choose, create, join
  const [roomCode, setRoomCode] = useState('');

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert('Bitte geben Sie einen Namen ein');
      return;
    }
    onCreateRoom(playerName);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      alert('Bitte geben Sie einen Namen ein');
      return;
    }
    if (!roomCode.trim()) {
      alert('Bitte geben Sie einen Raum-Code ein');
      return;
    }
    onJoinRoom(playerName, roomCode);
  };

  return (
    <div className="lobby-screen">
      <div className="lobby-container">
        <h1>🎮 Word Guesser</h1>
        <p className="subtitle">Multiplayer Word Guessing Game</p>

        {mode === 'choose' && (
          <div className="mode-select">
            <input
              type="text"
              placeholder="Geben Sie Ihren Namen ein"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength="20"
              className="name-input"
            />
            <button className="btn btn-primary" onClick={() => setMode('create')}>
              Neue Runde erstellen
            </button>
            <button className="btn btn-secondary" onClick={() => setMode('join')}>
              Runde beitreten
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="mode-panel">
            <h2>Neue Runde erstellen</h2>
            <p>Du wirst als Host dieser Runde</p>
            <button className="btn btn-primary" onClick={handleCreateRoom}>
              Runde erstellen
            </button>
            <button className="btn btn-cancel" onClick={() => setMode('choose')}>
              Zurück
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="mode-panel">
            <h2>Runde beitreten</h2>
            <input
              type="text"
              placeholder="Raum-Code eingeben"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength="4"
              className="room-code-input"
            />
            <button className="btn btn-primary" onClick={handleJoinRoom}>
              Beitreten
            </button>
            <button className="btn btn-cancel" onClick={() => setMode('choose')}>
              Zurück
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LobbyScreen;

