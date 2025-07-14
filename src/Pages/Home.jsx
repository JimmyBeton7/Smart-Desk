import React, { useEffect, useState } from 'react';
import WeatherTile from '../Components/WeatherTile';
import CurrencyTile from '../Components/CurrencyTile';
import { RefreshCw, Download, ArrowUpRightFromCircle } from 'lucide-react'; 

function Home() {

  const [updateStatus, setUpdateStatus] = useState(null);
  const [version, setVersion] = useState('...');
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);


  useEffect(() => {
    // pobierz aktualną wersję z backendu
    window.electron.getAppVersion().then(setVersion);
  }, []);

  const handleCheckUpdate = async () => {
    setChecking(true);
    setUpdateStatus('🔍 Checking for updates...');
    const result = await window.electron.checkForUpdates();
    setChecking(false);

    if (result.status === 'available') {
      setUpdateStatus(`⬇️ Update available: ${result.info.version} — click to download`);
    } else if (result.status === 'no-update') {
      setUpdateStatus('✅ You have the latest version.');
    } else {
      setUpdateStatus(`❌ Error: ${result.message}`);
    }
  };


  const handleDownloadUpdate = async () => {
    setDownloading(true);
    setUpdateStatus('⬇️ Downloading update...');
    const result = await window.electron.downloadUpdate();
    setDownloading(false);

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

      <div className="flex gap-2 items-center mb-4">
        <button
          className="button flex items-center gap-2"
          onClick={handleCheckUpdate}
          disabled={checking || downloading}
        >
          {checking ? (
            <span className="spinner" />
          ) : (
            <RefreshCw size={18} />
          )}
          Check for Updates
        </button>

        {updateStatus?.includes('click to download') && (
          <button
            className="button flex items-center gap-2"
            onClick={handleDownloadUpdate}
            disabled={downloading}
          >
          {downloading ? (
            <div className="progress-bar"><div className="progress-bar-fill" /></div>
            ) : (
            <Download size={18} />
            )}
            Download & Restart
          </button>
          )}

          {updateStatus?.includes('latest version') && (
            <p className="status-message">✅ You have the latest version.</p>
          )}

          </div>


        {updateStatus && <p style={{ marginBottom: '12px' }}>{updateStatus}</p>}

      <div className="tiles-container">
        <WeatherTile />
        <CurrencyTile />
      </div>
    </div>
  );
}

export default Home;
