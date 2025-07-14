import React, { useEffect, useState } from 'react';
import './CurrencyTile.css';

function CurrencyTile() {
  const [rates, setRates] = useState(null);
  const [loadedAt, setLoadedAt] = useState(null);
  const [apiKey, setApiKey] = useState(null);

  const fetchRates = async (key) => {
    try {
      const res = await fetch(`https://api.exchangeratesapi.io/v1/latest?access_key=${key}&symbols=PLN,USD,GBP,CHF`);
      const json = await res.json();

      if (!json.success || !json.rates || !json.rates.PLN) {
        console.error("❌ API error:", json);
        return;
      }

      const PLNper = {
        EUR: json.rates.PLN,
        USD: json.rates.PLN / json.rates.USD,
        GBP: json.rates.PLN / json.rates.GBP,
        CHF: json.rates.PLN / json.rates.CHF,
      };

      console.log("💱 Kursy z API:", PLNper);

      const now = Date.now();
      setRates(PLNper);
      setLoadedAt(now);
      window.electron.saveJSON('currency', { rates: PLNper, loadedAt: now });

    } catch (err) {
      console.error('Błąd pobierania kursów:', err);
    }
  };

  useEffect(() => {
  window.electron.getApiKeys().then(({ CURRENCY_KEY }) => {
    console.log("🧪 CURRENCY_KEY", CURRENCY_KEY);
    setApiKey(CURRENCY_KEY);
  });
}, []);


  useEffect(() => {
    if (!apiKey) return;

    const now = Date.now();
    const oneDay = 12 * 60 * 60 * 1000;

    window.electron.loadJSON('currency').then(cache => {
      if (cache?.rates && now - cache.loadedAt <= oneDay) {
        console.log("🪙 Kursy walut z cache");
        setRates(cache.rates);
        setLoadedAt(cache.loadedAt);
      } else {
        console.log("📡 Fetching fresh currency rates…");
        fetchRates(apiKey);
      }
    });
  }, [apiKey]);

  return (
    <div className="currency-tile">
      <h3>Currency Rates</h3>
      {rates ? (
        <div>
          <p>EUR → PLN: {rates.EUR.toFixed(4)}</p>
          <p>USD → PLN: {rates.USD.toFixed(4)}</p>
          <p>GBP → PLN: {rates.GBP.toFixed(4)}</p>
          <p>CHF → PLN: {rates.CHF.toFixed(4)}</p>
          <small>Updated: {new Date(loadedAt).toLocaleDateString()}</small>
        </div>
      ) : (
        <p>Loading rates…</p>
      )}
    </div>
  );
}

export default CurrencyTile;
