import React from 'react';
import '../styles/WaitingScreen.css';

function WaitingScreen({ roomId, room, isHost, onStartGame, onNextRound }) {
  if (!room) {
    return <div className="waiting-screen">Laden...</div>;
  }

  const isRoundComplete = room.currentRound > 0 && room.players.every((p) => p.guessed);
  const isGameOver = room.currentRound >= room.totalRounds;

  return (
    <div className="waiting-screen">
      <div className="waiting-container">
        <h1>🎮 Word Guesser</h1>
        <p className="room-code">Raum-Code: <strong>{roomId}</strong></p>

        <div className="game-info">
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
          <button className="btn btn-start" onClick={() => window.location.reload()}>
            Neue Runde
          </button>
        )}
      </div>
    </div>
  );
}

export default WaitingScreen;

