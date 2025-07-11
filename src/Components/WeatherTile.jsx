import React, { useEffect, useState } from 'react';
import './WeatherTile.css';

function WeatherTile() {
  const [weather, setWeather] = useState(null);
  const [loadedAt, setLoadedAt] = useState(null);

  const API_KEY = "b5454a8fb0e1660e31d3774301542e4f"; // docelowo z window.env

  const fetchWeather = async (query) => {
    try {
      const res = await fetch(`https://api.weatherstack.com/current?access_key=${API_KEY}&query=${query}&units=m`);
      const json = await res.json();
      if (json.current) {
        setWeather(json.current);
        const now = Date.now();
        setLoadedAt(now);
        window.electron.saveJSON('weather', {
          weather: json.current,
          loadedAt: now
        });
      }
    } catch (err) {
      console.error('Błąd pobierania pogody:', err);
    }
  };

  useEffect(() => {
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
      fetchWeather(userLocationRef.current);
    }

    const handleLocationChange = () => {
      const loc = userLocationRef.current;
      console.log("📍 Location changed to:", loc);
      fetchWeather(loc);
    };

    window.addEventListener('weather-location-changed', handleLocationChange);

    return () => {
      window.removeEventListener('weather-location-changed', handleLocationChange);
    };
  };

  const cleanupPromise = initialize();

  return () => {
    cleanupPromise.then(cleanup => {
      if (typeof cleanup === 'function') cleanup();
    });
  };
}, []);


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
