import React, { useEffect, useState } from 'react';
import './WeatherTile.css';

function WeatherTile() {
  const [weather, setWeather] = useState(null);
  const [loadedAt, setLoadedAt] = useState(null);

  const API_KEY = "b5454a8fb0e1660e31d3774301542e4f"; // najlepiej docelowo z window.env

  const fetchWeather = async (query) => {
    try {
      const res = await fetch(`https://api.weatherstack.com/current?access_key=${API_KEY}&query=${query}&units=m`);
      const json = await res.json();
      if (json.current) {
        setWeather(json.current);
        setLoadedAt(Date.now());
        localStorage.setItem('weatherData', JSON.stringify({ weather: json.current, loadedAt: Date.now() }));
      }
    } catch (err) {
      console.error('Błąd pobierania pogody:', err);
    }
  };

  useEffect(() => {
  const userLocation = localStorage.getItem('weather-location')?.trim();
  const query = userLocation || 'auto:ip';
  const cache = localStorage.getItem('weatherData');
  const now = Date.now();
  const twelveHours = 12 * 60 * 60 * 1000;

  let shouldFetch = true;

  if (cache) {
    const { weather, loadedAt } = JSON.parse(cache);
    const isFresh = now - loadedAt <= twelveHours;

    if (isFresh) {
      console.log("🕒 Using cached weather");
      setWeather(weather);
      setLoadedAt(loadedAt);
      shouldFetch = false;
    }
  }

  if (shouldFetch) {
    console.log("📡 Fetching fresh weather…");
    fetchWeather(query);
  }

  const handleLocationChange = () => {
    console.log("📍 Location changed");
    fetchWeather(query);
  };

  window.addEventListener('weather-location-changed', handleLocationChange);
  return () => {
    window.removeEventListener('weather-location-changed', handleLocationChange);
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
