import React, { useEffect, useState } from 'react';
import './WeatherTile.css';

function WeatherTile() {
  const [weather, setWeather] = useState(null);
  const [loadedAt, setLoadedAt] = useState(null);
  const [apiKey, setApiKey] = useState(null);

  const fetchWeather = async (query, key) => {
    try {
      const res = await fetch(`https://api.weatherstack.com/current?access_key=${key}&query=${query}&units=m`);
      const json = await res.json();
      if (json.current) {
        const now = Date.now();
        setWeather(json.current);
        setLoadedAt(now);
        window.electron.saveJSON('weather', {
          weather: json.current,
          loadedAt: now,
        });
      } else {
        console.error('❌ Weather API response invalid:', json);
      }
    } catch (err) {
      console.error('Błąd pobierania pogody:', err);
    }
  };

  useEffect(() => {
  window.electron.getApiKeys().then(({ WEATHERSTACK_KEY }) => {
    console.log("🧪 WEATHERSTACK_KEY", WEATHERSTACK_KEY);
    setApiKey(WEATHERSTACK_KEY);
  });
}, []);


  useEffect(() => {
    if (!apiKey) return;

    const userLocationRef = { current: 'auto:ip' };

    const initialize = async () => {
      const settings = await window.electron.loadJSON('settings');
      userLocationRef.current = settings?.location?.trim() || 'auto:ip';

      const cache = await window.electron.loadJSON('weather');
      const now = Date.now();
      const twelveHours = 12 * 60 * 60 * 1000;

      if (cache?.weather && now - cache.loadedAt <= twelveHours) {
        console.log("🕒 Using cached weather");
        setWeather(cache.weather);
        setLoadedAt(cache.loadedAt);
      } else {
        console.log("📡 Fetching fresh weather…");
        fetchWeather(userLocationRef.current, apiKey);
      }

      const handleLocationChange = () => {
        const loc = userLocationRef.current;
        console.log("📍 Location changed to:", loc);
        fetchWeather(loc, apiKey);
      };

      window.addEventListener('weather-location-changed', handleLocationChange);

      return () => {
        window.removeEventListener('weather-location-changed', handleLocationChange);
      };
    };

    let cleanup = null;
    initialize().then(fn => {
      cleanup = fn;
    });

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [apiKey]);

  return (
    <div className="weather-tile">
      <h3>Weather</h3>
      {weather ? (
        <div>
          <img src={weather.weather_icons[0]} alt={weather.weather_descriptions[0]} />
          <p>{weather.temperature}°C • {weather.weather_descriptions[0]}</p>
          <small>
            Updated: {new Date(loadedAt).toLocaleDateString()} {new Date(loadedAt).toLocaleTimeString()}
          </small>
        </div>
      ) : (
        <p>Loading weather info…</p>
      )}
    </div>
  );
}

export default WeatherTile;
