import React from 'react';
import '../styles/ScoreBoard.css';

function ScoreBoard({ players = [] }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="scoreboard">
      <h3>Scores</h3>
      <ul className="score-list">
        {sorted.map((player, index) => (
          <li key={player.id} className={`score-item ${player.guessed ? 'guessed' : ''}`}>
            <div className="score-rank">{index + 1}</div>
            <div className="score-info">
              <span className="score-name">{player.name}</span>
              <span className="score-value">{player.score} Punkte</span>
            </div>
            {player.guessed && <span className="guessed-badge">✓</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScoreBoard;

