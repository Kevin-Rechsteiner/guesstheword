import React, { useEffect, useState } from 'react';
import '../styles/Timer.css';

function Timer({ timeRemaining }) {
  const [displayTime, setDisplayTime] = useState(timeRemaining);

  useEffect(() => {
    setDisplayTime(timeRemaining);
  }, [timeRemaining]);

  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;
  const isLow = displayTime < 15;

  return (
    <div className={`timer ${isLow ? 'low-time' : ''}`}>
      <div className="time-display">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </div>
      <p className="timer-label">Zeit verbleibend</p>
    </div>
  );
}

export default Timer;

