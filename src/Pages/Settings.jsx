import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import './Settings.css';
import { useTranslation } from 'react-i18next';

function Settings() {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
  window.electron.loadJSON('settings').then(data => {
    if (data.apiKey) setApiKey(data.apiKey);
    if (data.location) setLocation(data.location);
    if (data.language) setLanguage(data.language);
  });
}, []);

  const saveSettings = () => {
    window.electron.loadJSON('settings').then(prev => {
    const trimmed = location.trim();
    window.electron.saveJSON('settings', {
      apiKey: apiKey.trim(),
      location: trimmed,
      language: language,
    });

    if (prev?.location !== trimmed) {
      window.electron.saveJSON('weather', {}); // czyści cache
      window.dispatchEvent(new Event('weather-location-changed'));
    }

    if (prev?.language !== language) {
      window.dispatchEvent(new Event('language-changed')); // możesz użyć tego do przeładowania tłumaczeń
    }

  });
  };

  return (
    <div className="settings-container">
      <h2>{t('settings.title')}</h2>

      <label>{t('settings.apiKeyLabel')}</label>
      <input
        type="password"
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        placeholder={t('settings.apiKeyPlaceholder')}
      />

      <label>{t('settings.locationLabel')}</label>
      <input
        type="text"
        value={location}
        onChange={e => setLocation(e.target.value)}
        placeholder={t('settings.locationPlaceholder')}
      />

      <label>{t('settings.languageLabel')}</label>
      <div className="language-toggle">
        <label className={`lang-radio ${language === 'en' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="language"
            value="en"
            checked={language === 'en'}
            onChange={() => setLanguage('en')}
          />
          🇬🇧 {t('settings.english')}
        </label>
        <label className={`lang-radio ${language === 'pl' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="language"
            value="pl"
            checked={language === 'pl'}
            onChange={() => setLanguage('pl')}
          />
          🇵🇱 {t('settings.polish')}
        </label>
      </div>

      <button onClick={saveSettings}>
        <Save size={16} style={{ marginRight: 6 }} />
        {t('settings.saveButton')}
      </button>
    </div>
  );
}

export default Settings;
