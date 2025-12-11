import React, { useState } from 'react';
import '../styles/WaitingScreen.css';

function WaitingScreen({
  roomId,
  room,
  isHost,
  onStartGame,
  onNextRound,
  onReturnToLobby
}) {
  const [copyStatus, setCopyStatus] = useState('');

  if (!room) {
    return <div className="waiting-screen">Laden...</div>;
  }

  const isRoundComplete = room.currentRound > 0 && room.players.every((p) => p.guessed);
  const isGameOver = room.currentRound >= room.totalRounds;
  const inviteLink = `${window.location.origin}/?room=${roomId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopyStatus('Link kopiert!');
    } catch (err) {
      console.error('Clipboard copy failed', err);
      setCopyStatus('Konnte nicht kopieren');
    } finally {
      setTimeout(() => setCopyStatus(''), 2500);
    }
  };

  return (
    <div className="waiting-screen">
      <div className="waiting-container">
        <h1>🎮 Word Guesser</h1>
        <div className="room-code">
          <span>Raum-Code: <strong>{roomId}</strong></span>
          <div className="share-row">
            <div className="share-link">{inviteLink}</div>
            <button className="btn btn-secondary" onClick={handleCopyLink}>
              Link kopieren
            </button>
          </div>
          {copyStatus && <p className="copy-status">{copyStatus}</p>}
        </div>

        <div className="game-info">
          {room.lastWord && !room.gameStarted && (
            <div className="info-section solution">
              <h3>Richtiges Wort</h3>
              <p className="solution-word">{room.lastWord}</p>
            </div>
          )}
          <div className="info-section">
            <h3>Spieler ({room.players.length})</h3>
            <ul className="player-list">
              {room.players.map((player) => (
                <li key={player.id} className={isHost && player.id === room.hostId ? 'host' : ''}>
                  {isHost && player.id === room.hostId && '👑 '}
                  {player.name}
                  <span className="score">{player.score} Punkte</span>
                </li>
              ))}
            </ul>
          </div>

          {!isGameOver && (
            <div className="info-section">
              <h3>Runde: {room.currentRound}/{room.totalRounds}</h3>
              {!room.gameStarted && (
                <p className="info-text">Warten auf Host, um das Spiel zu starten...</p>
              )}
            </div>
          )}

          {isGameOver && (
            <div className="info-section">
              <h3>🏆 Spiel beendet!</h3>
              <ol className="final-scores">
                {[...room.players]
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <li key={player.id}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {player.name}: {player.score} Punkte
                    </li>
                  ))}
              </ol>
            </div>
          )}
        </div>

        {isHost && !room.gameStarted && (
          <button className="btn btn-start" onClick={onStartGame}>
            Spiel starten
          </button>
        )}

        {isHost && isRoundComplete && !isGameOver && (
          <button className="btn btn-start" onClick={onNextRound}>
            Nächste Runde
          </button>
        )}

        {isHost && isGameOver && (
          <div className="end-actions">
            <button className="btn btn-start" onClick={() => window.location.reload()}>
              Neue Runde
            </button>
            <button className="btn btn-secondary" onClick={onReturnToLobby}>
              Zurück zur Lobby
            </button>
          </div>
        )}

        {!isHost && isGameOver && (
          <div className="end-actions">
            <button className="btn btn-secondary" onClick={onReturnToLobby}>
              Zurück zur Lobby
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WaitingScreen;

