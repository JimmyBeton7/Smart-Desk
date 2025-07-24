import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import './Settings.css';
import { useTranslation } from 'react-i18next';

function Settings() {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('default');
  const [savedMessageVisible, setSavedMessageVisible] = useState(false);

  useEffect(() => {
  window.electron.loadJSON('settings').then(data => {
    if (data.apiKey) setApiKey(data.apiKey);
    if (data.location) setLocation(data.location);
    if (data.language) setLanguage(data.language);
    if (data.theme) setTheme(data.theme);
  });
}, []);

  const saveSettings = () => {
    window.electron.loadJSON('settings').then(prev => {
    const trimmed = location.trim();
    window.electron.saveJSON('settings', {
      apiKey: apiKey.trim(),
      location: trimmed,
      language: language,
      theme,
    });

    if (prev?.theme !== theme) {
        document.documentElement.classList.remove('theme-' + prev?.theme);
        document.documentElement.classList.add('theme-' + theme);
    }

    if (prev?.location !== trimmed) {
      window.electron.saveJSON('weather', {});
      window.dispatchEvent(new Event('weather-location-changed'));
    }

    if (prev?.language !== language) {
      window.dispatchEvent(new Event('language-changed')); 
    }

    setSavedMessageVisible(true);
    setTimeout(() => setSavedMessageVisible(false), 1500);

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
          
          EN {t('settings.english')}
        </label>

        <label className={`lang-radio ${language === 'pl' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="language"
            value="pl"
            checked={language === 'pl'}
            onChange={() => setLanguage('pl')}
          />
          PL {t('settings.polish')}
        </label>

        <label className={`lang-radio ${language === 'es' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="language"
            value="es"
            checked={language === 'es'}
            onChange={() => setLanguage('es')}
          />
          ES {t('settings.spanish')}
        </label>

        <label className={`lang-radio ${language === 'de' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="language"
            value="de"
            checked={language === 'de'}
            onChange={() => setLanguage('de')}
          />
          DE {t('settings.german')}
        </label>

        </div>

        <label style={{ marginTop: 20 }}>Theme</label>
          <div className="theme-toggle">
          {[
            { value: 'default', label: 'Classic' },
            { value: 'variant1', label: 'Midnight Blue' },
            { value: 'variant2', label: 'Gold Sand' },
            { value: 'variant3', label: 'Matrix' },
            { value: 'variant4', label: 'Autumn Leaves' },
            { value: 'variant5', label: 'Forest Bloom' },
            { value: 'variant6', label: 'Cyber Wave' },
            ].map(opt => (
        <label
          key={opt.value}
          className={`theme-radio ${theme === opt.value ? 'selected' : ''} theme-${opt.value}`}
        >
        <input
          type="radio"
          name="theme"
          value={opt.value}
          checked={theme === opt.value}
          onChange={() => setTheme(opt.value)}
        />
        {opt.label}
        </label>
        ))}
      </div>
  


      <button onClick={saveSettings}>
        <Save size={16} style={{ marginRight: 6 }} />
        {t('settings.saveButton')}
      </button>
      {savedMessageVisible && <span className="saved-global-label">{t('settings.saved')}</span>}
    </div>
  );
}

export default Settings;
