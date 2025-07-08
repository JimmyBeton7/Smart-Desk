import React, { useState, useEffect } from 'react';
import './Settings.css';

function Settings() {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('openai-api-key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const saveKey = () => {
    localStorage.setItem('openai-api-key', apiKey.trim());
    alert('API Key saved!');
  };

  return (
    <div className="settings-container">
      <h2>OpenAI Settings</h2>
      <input
        type="password"
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        placeholder="Enter your OpenAI API Key"
      />
      <button onClick={saveKey}>Save</button>
    </div>
  );
}

export default Settings;
