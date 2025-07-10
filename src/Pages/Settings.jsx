import React, { useState, useEffect } from 'react';
import './Settings.css';

function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('openai-api-key');
    const savedLocation = localStorage.getItem('weather-location');

    if (savedKey) setApiKey(savedKey);
    if (savedLocation) setLocation(savedLocation);
  }, []);

  const saveSettings = () => {
    localStorage.setItem('openai-api-key', apiKey.trim());
    const prevLocation = localStorage.getItem('weather-location');
    const trimmedNew = location.trim();

    localStorage.setItem('weather-location', trimmedNew);

    if (prevLocation !== trimmedNew) {
      localStorage.removeItem('weatherData');
      window.dispatchEvent(new Event('weather-location-changed'));
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>

      <label>OpenAI API Key</label>
      <input
        type="password"
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        placeholder="Enter your OpenAI API Key"
      />

      <label>Weather Location</label>
      <input
        type="text"
        value={location}
        onChange={e => setLocation(e.target.value)}
        placeholder="e.g. Wroclaw, Warsaw"
      />

      <button onClick={saveSettings}>Save</button>
    </div>
  );
}

export default Settings;
