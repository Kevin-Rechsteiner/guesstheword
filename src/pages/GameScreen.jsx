import React, { useState, useEffect } from 'react';
import '../styles/GameScreen.css';
import HintDisplay from '../components/HintDisplay';
import Timer from '../components/Timer';
import ScoreBoard from '../components/ScoreBoard';
import GuessInput from '../components/GuessInput';

function GameScreen({ playerId, playerName, room, onSubmitGuess, incorrectGuessMessage = '' }) {
  const [guessInput, setGuessInput] = useState('');
  const [hasGuessed, setHasGuessed] = useState(false);
  const [message, setMessage] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(room.timeRemaining || 60);
  const [hints, setHints] = useState(room.hints || []);

  // Update message wenn incorrectGuessMessage kommt vom Server
  useEffect(() => {
    if (incorrectGuessMessage) {
      setMessage(incorrectGuessMessage);
    }
  }, [incorrectGuessMessage]);

  // Aktualisiere hasGuessed und hints wenn room sich ändert
  useEffect(() => {
    const player = room.players.find((p) => p.id === playerId);
    setHasGuessed(player ? player.guessed : false);
    setHints(room.hints || []);

    // Reset guessInput und message für neue Runde
    setGuessInput('');
    setMessage('');

    console.log('🔄 Room updated:', { round: room.currentRound, hasGuessed: !!player?.guessed });
  }, [room, playerId]);

  // Initialisiere und reset Timer wenn neue Runde startet
  useEffect(() => {
    if (room.timeRemaining !== undefined && room.timeRemaining !== null) {
      console.log('⏱️ Timer reset zu:', room.timeRemaining);
      setTimeRemaining(room.timeRemaining);
    }
  }, [room.currentRound]); // Trigger auf neue Runde (currentRound ändert sich)

  // Timer countdown - wird lokal auf dem Client ausgeführt
  useEffect(() => {
    if (timeRemaining <= 0) {
      console.log('⏱️ Timer abgelaufen');
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 1);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);


  const handleSubmitGuess = (guess) => {
    if (!guess.trim()) {
      setMessage('Bitte geben Sie einen Guess ein!');
      return;
    }
    onSubmitGuess(guess);
    setGuessInput('');
    setMessage('');
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        <h1>Word Guesser</h1>
        <div className="round-info">
          Runde {room.currentRound} / {room.totalRounds}
        </div>
      </div>

      <div className="game-layout">
        <div className="game-main">
          <HintDisplay hints={hints} />
          <Timer timeRemaining={timeRemaining} />

          {!hasGuessed ? (
            <GuessInput
              onSubmit={handleSubmitGuess}
              value={guessInput}
              onChange={setGuessInput}
              message={message}
            />
          ) : (
            <div className="guessed-message">
              ✓ Du hast richtig geraten!
            </div>
          )}
        </div>

        <div className="game-sidebar">
          <ScoreBoard players={room.players} />
        </div>
      </div>
    </div>
  );
}

export default GameScreen;

