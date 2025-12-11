import React from 'react';
import '../styles/GuessInput.css';

function GuessInput({ onSubmit, value, onChange, message }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <div className="guess-input">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Geben Sie Ihre Antwort ein..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
          className="input-field"
        />
        <button type="submit" className="submit-btn">
          Absenden
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default GuessInput;

