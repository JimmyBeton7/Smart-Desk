import React, { useEffect, useState } from 'react';
import WeatherTile from '../Components/WeatherTile';
import CurrencyTile from '../Components/CurrencyTile';

function Home() {

  const [updateStatus, setUpdateStatus] = useState(null);
  const [version, setVersion] = useState('...');

  useEffect(() => {
    // pobierz aktualną wersję z backendu
    window.electron.getAppVersion().then(setVersion);
  }, []);

  const handleCheckUpdate = async () => {
    setUpdateStatus('🔍 Checking for updates...');
    const result = await window.electron.checkForUpdates();

    if (result.status === 'available') {
      setUpdateStatus(`⬇️ Update available: ${result.info.version} — click to download`);
    } else if (result.status === 'no-update') {
      setUpdateStatus('✅ You have the latest version.');
    } else {
      setUpdateStatus(`❌ Error: ${result.message}`);
    }
  };

  const handleDownloadUpdate = async () => {
    setUpdateStatus('⬇️ Downloading update...');
    const result = await window.electron.downloadUpdate();

    if (result.status === 'downloading') {
      setUpdateStatus('✅ Update downloaded. Restarting...');
      setTimeout(() => {
        window.electron.restartAndInstall();
      }, 1500);
    } else {
      setUpdateStatus(`❌ Download failed: ${result.message}`);
    }
  };

  return (
    <div>
      <h1>Welcome to Smart Desk Companion</h1>
      <p>Select a tool from the sidebar.</p>
      <p>Version: {version}</p>

      <div style={{ marginBottom: '12px' }}>
        <button onClick={handleCheckUpdate}>🔄 Check for Updates</button>
        {updateStatus?.includes('click to download') && (
          <button onClick={handleDownloadUpdate} style={{ marginLeft: '10px' }}>
            📥 Download & Restart
          </button>
        )}
        {updateStatus && <p style={{ marginTop: '8px' }}>{updateStatus}</p>}
      </div>

      <div className="tiles-container">
        <WeatherTile />
        <CurrencyTile />
      </div>
    </div>
  );
}

export default Home;
