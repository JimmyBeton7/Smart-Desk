import React, { useEffect, useState } from 'react';
import WeatherTile from '../Components/WeatherTile';
import CurrencyTile from '../Components/CurrencyTile';
import { RefreshCw, Download, XCircle, CheckCircle, Search } from 'lucide-react';
import './Home.css'; // <- to jest kluczowe

function Home() {
  const [updateStatus, setUpdateStatus] = useState(null);
  const [version, setVersion] = useState('...');
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [latestVersion, setLatestVersion] = useState(null);

  const clean = (v) => v.replace(/^v/, '').trim();

 useEffect(() => {
  const fetchVersionAndCheck = async () => {
    const ver = await window.electron.getAppVersion();
    const result = await window.electron.checkForUpdates();
      if (!result || !result.status) {
        setUpdateStatus('❌ Error: could not check for updates.');
        return;
      }

      const remote = clean(result.info?.version || '');
      const local = clean(ver);

    if (result.status === 'available') {
      if (remote === local) {
        setUpdateStatus('✅ You have the latest version.');
      } else {
        setLatestVersion(result.info.version);
        setUpdateStatus(`⬇️ Update available: ${result.info.version} — click to download`);
      }
      } else if (result.status === 'no-update') {
        setUpdateStatus('✅ You have the latest version.');
      } else {
        setUpdateStatus(`❌ Error: ${result.message || 'Unknown issue.'}`);
      }
  };

  fetchVersionAndCheck();
}, []);

  const handleCheckUpdate = async () => {
  setChecking(true);
  setUpdateStatus(<><Search size={16} style={{ marginRight: 6 }} />Checking for updates...</>);
    const result = await window.electron.checkForUpdates();
if (!result || !result.status) {
  setUpdateStatus('❌ Error: could not check for updates.');
  return;
}

const remote = clean(result.info?.version || '');
const local = clean(version);

if (result.status === 'available') {
  if (remote === local) {
    setUpdateStatus(<><CheckCircle size={16} style={{ marginRight: 6 }} />You have the latest version.</>);
  } else {
    setLatestVersion(result.info.version);
    setUpdateStatus(<><Download size={16} style={{ marginRight: 6 }} /> Update available: ${result.info.version} — click to download</>);
  }
} else if (result.status === 'no-update') {
  setUpdateStatus(<><CheckCircle size={16} style={{ marginRight: 6 }} />You have the latest version.</>);
} else {
  setUpdateStatus(<><XCircle size={16} style={{ marginRight: 6 }} />Error: ${result.message || 'Unknown issue.'}</>);
}
};


  const handleDownloadUpdate = async () => {
    setDownloading(true);
    setUpdateStatus(<><Download size={16} style={{ marginRight: 6 }} />Downloading update...</>);
    const result = await window.electron.downloadUpdate();
    setDownloading(false);

    if (result.status === 'downloading') {
      setUpdateStatus(<><CheckCircle size={16} style={{ marginRight: 6 }} />Update downloaded. Restarting...</>);
      setTimeout(() => {
        window.electron.restartAndInstall();
      }, 1500);
    } else {
      setUpdateStatus(<><XCircle size={16} style={{ marginRight: 6 }} />Download failed: {result.message}</>);
    }
  };


  const shouldShowDownload =
    latestVersion && clean(latestVersion) !== clean(version) && updateStatus?.includes('click to download');


  return (
    <div>
      <h1>Welcome to Smart Desk Companion</h1>
      <p>Select a tool from the sidebar.</p>
      <p>Version: {version}</p>

      <div className="buttons-row">
        <button
          className="button flex items-center gap-2"
          onClick={handleCheckUpdate}
          disabled={checking || downloading}
        >
          {checking ? <span className="spinner" /> : <RefreshCw size={16} style={{ marginRight: 8 }}/>}
          Check for Updates
        </button>

        {shouldShowDownload && (
          <button
            className="button flex items-center gap-2"
            onClick={handleDownloadUpdate}
            disabled={downloading}
          >
            {downloading ? (
              <div className="progress-bar">
                <div className="progress-bar-fill" />
              </div>
            ) : (
              <Download size={16} style={{ marginRight: 8 }} />
            )}
            Download & Restart
          </button>
        )}
      </div>

      {updateStatus && <p className="status-message">{updateStatus}</p>}

      <div className="tiles-container">
        <WeatherTile />
        <CurrencyTile />
      </div>
    </div>
  );
}

export default Home;
