import { useState, useEffect } from 'react';
import './Pomodoro.css';
import { RotateCcw } from 'lucide-react';
import React from 'react';

function Pomodoro() {
  const [duration, setDuration] = useState(25);
  const [seconds, setSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer;
    if (isRunning && seconds > 0) {
      timer = setInterval(() => setSeconds(s => s - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, seconds]);

  const format = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const reset = () => {
    setIsRunning(false);
    setSeconds(duration * 60);
  };

  return (
    <div className="pomodoro-container">
      <h1>Pomodoro Timer</h1>
      <div className="time">{format(seconds)}</div>

      <div className="buttons">
        <button onClick={() => setIsRunning(true)}>▶ Start</button>
        <button onClick={() => setIsRunning(false)}>⏸ Pause</button>
        <button onClick={reset}>
            <RotateCcw size={18} style={{ marginRight: '6px' }} />
            Reset
        </button>
      </div>

      <div className="options">
            <label htmlFor="duration">⏱ Duration:</label>
            <input
            id="duration"
            type="number"
            min="1"
            max="60"
            value={duration}
            onChange={(e) => {
                const val = parseInt(e.target.value);
                setDuration(val);
                setSeconds(val * 60);
                setIsRunning(false);
                }}
            />
            <span>min</span>
        </div>

    </div>
  );
}

export default Pomodoro;

