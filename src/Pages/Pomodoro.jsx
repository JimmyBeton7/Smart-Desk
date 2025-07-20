import { useState, useEffect } from 'react';
import './Pomodoro.css';
import { RotateCcw } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next'; 

function Pomodoro() {
  const [duration, setDuration] = useState(25);
  const [seconds, setSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const { t } = useTranslation();

  // 🧠 Load state from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('pomodoro-state');
    if (saved) {
      const { duration, seconds, isRunning, timestamp } = JSON.parse(saved);
      const now = Date.now();
      const delta = Math.floor((now - timestamp) / 1000);

      setDuration(duration);
      setSeconds(isRunning ? Math.max(seconds - delta, 0) : seconds);
      setIsRunning(isRunning && seconds - delta > 0);
    }
  }, []);

  // 💾 Save state on every change
  useEffect(() => {
    sessionStorage.setItem(
      'pomodoro-state',
      JSON.stringify({
        duration,
        seconds,
        isRunning,
        timestamp: Date.now()
      })
    );
  }, [duration, seconds, isRunning]);

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
      <h1>{t('pomodoro.title')}</h1>
      <div className="time">{format(seconds)}</div>

      <div className="buttons">
        <button onClick={() => setIsRunning(true)}>{t('pomodoro.start')}</button>
        <button onClick={() => setIsRunning(false)}>{t('pomodoro.pause')}</button>
        <button onClick={reset}>
          <RotateCcw size={18} style={{ marginRight: '6px' }} />
          {t('pomodoro.reset')}
        </button>
      </div>

      <div className="options">
        <label htmlFor="duration">{t('pomodoro.duration')}</label>
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
        <span>{t('pomodoro.minutes')}</span>
      </div>
    </div>
  );
}

export default Pomodoro;
