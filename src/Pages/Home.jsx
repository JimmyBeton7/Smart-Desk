import React, { useEffect, useState } from 'react';
import WeatherTile from '../Components/WeatherTile';
import CurrencyTile from '../Components/CurrencyTile';
import { RefreshCw, Download, XCircle, CheckCircle, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Home.css'; 

function Home() {
  const { t } = useTranslation();
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
        setUpdateStatus(<><XCircle size={16} /> {t('home.errorCheck')}</>);
        return;
      }

      const remote = clean(result.info?.version || '');
      const local = clean(ver);

    if (result.status === 'available') {
      if (remote === local) {
        setUpdateStatusText('no-update');
        setUpdateStatus(<><CheckCircle size={16} /> {t('home.upToDate')}</>);
      } else {
        setLatestVersion(result.info.version);
        setUpdateStatusText('update');
        setUpdateStatus(<><Download size={16} /> {t('home.updateAvailable', { version: result.info.version })}</>);
      }
      } else if (result.status === 'no-update') {
        setUpdateStatusText('no-update');
        setUpdateStatus(<><CheckCircle size={16} /> {t('home.upToDate')}</>);
      } else {
        setUpdateStatusText('error');
        setUpdateStatus(<><XCircle size={16} /> {t('home.downloadFailed', { message: result.message || 'Unknown issue.' })}</>);
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
    setUpdateStatus(<><Search size={16} /> {t('home.checking')}</>);
    const result = await window.electron.checkForUpdates();
    if (!result || !result.status) 
    {
      setUpdateStatusText('error');
      setUpdateStatus(<><XCircle size={16} /> {t('home.errorCheck')}</>);
      return;
    }

    const remote = clean(result.info?.version || '');
    const local = clean(version);

    if (result.status === 'available') {
      if (remote === local) {
        setUpdateStatus(<><CheckCircle size={16} /> {t('home.upToDate')}</>);
      } else {
        setLatestVersion(result.info.version);
        setUpdateStatusText('update');
        setUpdateStatus(<><Download size={16} /> {t('home.updateAvailable', { version: result.info.version })}</>);
      }
    } else if (result.status === 'no-update') {
        setUpdateStatusText('no-update');
        setUpdateStatus(<><CheckCircle size={16} /> {t('home.upToDate')}</>);
    } else {
        setUpdateStatusText('error');
         setUpdateStatus(<><XCircle size={16} /> {t('home.downloadFailed', { message: result.message || 'Unknown issue.' })}</>);
    }

    setChecking(false)
  };


  const handleDownloadUpdate = async () => 
  {
    setDownloading(true);
    setUpdateStatusText('checking');
    setUpdateStatus(<><Download size={16} /> {t('home.downloading')}</>);
    const result = await window.electron.downloadUpdate();
    setDownloading(false);

    if (result.status === 'downloading') {
      setUpdateStatusText('restarting');
      setUpdateStatus(<><CheckCircle size={16} /> {t('home.downloaded')}</>);
      setTimeout(() => {
        window.electron.restartAndInstall();
      }, 1500);
    } else {
      setUpdateStatusText('error');
      setUpdateStatus(<><XCircle size={16} /> {t('home.downloadFailed', { message: result.message })}</>);
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
      <h1>{t('home.welcome')}</h1>
      <p>{t('home.select')}</p>
      <p>{t('home.version', { version })}</p>

      <div className="buttons-row">
        <button
          className="button flex items-center gap-2"
          onClick={handleCheckUpdate}
          disabled={checking || downloading}
        >
          {checking ? <span className="spinner" /> : <RefreshCw size={16} style={{ marginRight: 8 }}/>}
          {t('home.checkUpdates')}
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
            {downloading ? t('home.downloading') : t('home.downloadRestart')}
          </button>
      )}

      </div>

      {updateStatus && <p className="status-message">{updateStatus}</p>}

      <div className="info-container">

        <div className="changes-container">

            <h3>{t('home.changelog')}</h3>
              {changelog.length === 0 ? (
              <p>{t('home.noChangelog')}</p>
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
