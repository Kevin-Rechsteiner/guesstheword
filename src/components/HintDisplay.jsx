import React from 'react';
import '../styles/HintDisplay.css';

function HintDisplay({ hints = [] }) {
  return (
    <div className="hint-display">
      <h2>Hinweise</h2>
      <div className="hints-container">
        {hints.length === 0 ? (
          <p className="no-hints">Hinweise werden gleich angezeigt...</p>
        ) : (
          hints.map((hint, index) => (
            <div key={index} className="hint-item">
              <span className="hint-number">Hinweis {index + 1}:</span>
              <p className="hint-text">{hint}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HintDisplay;

