import React, { useEffect, useState } from 'react';
import WeatherTile from '../Components/WeatherTile';
import CurrencyTile from '../Components/CurrencyTile';
import { RefreshCw, Download, XCircle, CheckCircle, Search } from 'lucide-react';
import './Home.css'; 

function Home() {
  const [updateStatus, setUpdateStatus] = useState(null);
  const [version, setVersion] = useState('...');
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [latestVersion, setLatestVersion] = useState(null);
  const [updateStatusText, setUpdateStatusText] = useState('');
  const [changelog, setChangelog] = useState([]);


  const clean = (v) => v.replace(/^v/, '').trim();

 useEffect(() => 
 {
  const fetchVersionAndCheck = async () => {
    const ver = await window.electron.getAppVersion();
    setVersion(ver);
    const result = await window.electron.checkForUpdates();
      if (!result || !result.status) {
        setUpdateStatusText('error');
        setUpdateStatus(<><XCircle size={16} style={{ marginRight: 6 }} />Error: could not check for update.</>);
        return;
      }

      const remote = clean(result.info?.version || '');
      const local = clean(ver);

    if (result.status === 'available') {
      if (remote === local) {
        setUpdateStatusText('no-update');
        setUpdateStatus(<><CheckCircle size={16} style={{ marginRight: 6 }} />You have the latest version.</>);
      } else {
        setLatestVersion(result.info.version);
        setUpdateStatusText('update');
        setUpdateStatus(<><Download size={16} style={{ marginRight: 6 }} /> Update available: ${result.info.version} — click to download</>);
      }
      } else if (result.status === 'no-update') {
        setUpdateStatusText('no-update');
        setUpdateStatus(<><CheckCircle size={16} style={{ marginRight: 6 }} />You have the latest version.</>);
      } else {
        setUpdateStatusText('error');
        setUpdateStatus(<><XCircle size={16} style={{ marginRight: 6 }} />Error: ${result.message || 'Unknown issue.'}</>);
      }
  };

  fetchVersionAndCheck();
}, []);


//==========================================================

useEffect(() => {
  const fetchChangelog = async () => {
    try {
      const data = await window.electron.getChangelog();
      if (Array.isArray(data)) {
        setChangelog(data);
      } else {
        console.warn('❌ changelog.json is not an array');
      }
    } catch (err) {
      console.error('❌ Failed to load changelog:', err);
    }
  };

  fetchChangelog();
}, []);

//==========================================================

  const handleCheckUpdate = async () => 
  {
    setChecking(true);
    setUpdateStatusText('checking');
    setUpdateStatus(<><Search size={16} style={{ marginRight: 6 }} />Checking for updates...</>);
    const result = await window.electron.checkForUpdates();
    if (!result || !result.status) 
    {
      setUpdateStatusText('error');
      setUpdateStatus(<><XCircle size={16} style={{ marginRight: 6 }} />Error: could not check for update.</>);
      return;
    }

    const remote = clean(result.info?.version || '');
    const local = clean(version);

    if (result.status === 'available') {
      if (remote === local) {
        setUpdateStatus(<><CheckCircle size={16} style={{ marginRight: 6 }} />You have the latest version.</>);
      } else {
        setLatestVersion(result.info.version);
        setUpdateStatusText('update');
        setUpdateStatus(<><Download size={16} style={{ marginRight: 6 }} /> Update available: ${result.info.version} — click to download</>);
      }
    } else if (result.status === 'no-update') {
        setUpdateStatusText('no-update');
        setUpdateStatus(<><CheckCircle size={16} style={{ marginRight: 6 }} />You have the latest version.</>);
    } else {
        setUpdateStatusText('error');
        setUpdateStatus(<><XCircle size={16} style={{ marginRight: 6 }} />Error: ${result.message || 'Unknown issue.'}</>);
    }

    setChecking(false)
  };


  const handleDownloadUpdate = async () => 
  {
    setDownloading(true);
    setUpdateStatusText('checking');
    setUpdateStatus(<><Download size={16} style={{ marginRight: 6 }} />Downloading update...</>);
    const result = await window.electron.downloadUpdate();
    setDownloading(false);

    if (result.status === 'downloading') {
      setUpdateStatusText('restarting');
      setUpdateStatus(<><CheckCircle size={16} style={{ marginRight: 6 }} />Update downloaded. Restarting...</>);
      setTimeout(() => {
        window.electron.restartAndInstall();
      }, 1500);
    } else {
      setUpdateStatusText('error');
      setUpdateStatus(<><XCircle size={16} style={{ marginRight: 6 }} />Download failed: {result.message}</>);
    }
  };


  //const shouldShowDownload =
    //latestVersion && clean(latestVersion) !== clean(version) && updateStatus?.includes('click to download');
  const shouldShowDownload =
  latestVersion &&
  clean(latestVersion) !== clean(version) &&
  updateStatusText === 'update'

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

        {(shouldShowDownload || downloading) && (
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
            {downloading ? 'Downloading...' : 'Download & Restart'}
          </button>
      )}

      </div>

      {updateStatus && <p className="status-message">{updateStatus}</p>}

      <div className="info-container">

        <div className="changes-container">

            <h3 style={{ marginBottom: 10 }}>Changelog</h3>
              {changelog.length === 0 ? (
              <p>No changelog found.</p>
              ) : (
              changelog.map(entry => (
                <div key={entry.version} style={{ marginBottom: 12 }}>
                <strong>v{entry.version} ({entry.date})</strong>
                <ul style={{ marginTop: 4 }}>
                {entry.changes.map((line, i) => <li key={i}>{line}</li>)}
                </ul>
                </div>
              ))
          )}

        </div>

        <div className="tiles-container">
          <WeatherTile />
          <CurrencyTile />
        </div>

        </div>
    </div>
  );
}

export default Home;
