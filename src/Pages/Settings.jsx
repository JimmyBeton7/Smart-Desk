import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import './Settings.css';

function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
  window.electron.loadJSON('settings').then(data => {
    if (data.apiKey) setApiKey(data.apiKey);
    if (data.location) setLocation(data.location);
  });
}, []);

  const saveSettings = () => {
    window.electron.loadJSON('settings').then(prev => {
    const trimmed = location.trim();
    window.electron.saveJSON('settings', {
      apiKey: apiKey.trim(),
      location: trimmed
    });

    if (prev?.location !== trimmed) {
      window.electron.saveJSON('weather', {}); // czyści cache
      window.dispatchEvent(new Event('weather-location-changed'));
    }
  });
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

      <button
        onClick={saveSettings}
      >
        <Save size={16} style={{ marginRight: 6 }} />
        Save
      </button>
    </div>
  );
}

export default Settings;
