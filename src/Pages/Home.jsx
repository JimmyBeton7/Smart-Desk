import React from 'react';
import WeatherTile from '../Components/WeatherTile';
import CurrencyTile from '../Components/CurrencyTile';

function Home() {
  return (
    <div>
      <h1>Welcome to Smart Desk Companion</h1>
      <p>Select a tool from the sidebar.</p>
      <p>Version: 1.0.2.</p>

      <div className="tiles-container">
        <WeatherTile />
        <CurrencyTile />
      </div>
    </div>
  );
}

export default Home;
