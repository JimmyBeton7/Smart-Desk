import React, { useEffect, useState } from 'react';
import './CurrencyTile.css';

function CurrencyTile() {
  const [rates, setRates] = useState(null);
  const [loadedAt, setLoadedAt] = useState(null);
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    const key = window.__API_KEYS__?.CURRENCY_KEY;
    if (!key) {
      console.warn('❌ Brak CURRENCY_KEY');
      return;
    }
    setApiKey(key);
  }, []);

  useEffect(() => {
    if (!apiKey) return;

    const now = Date.now();
    const oneDay = 12 * 60 * 60 * 1000;

    window.electron.loadJSON('currency').then(cache => {
      let shouldFetch = true;

      if (cache?.rates && now - cache.loadedAt <= oneDay) {
        console.log("🪙 Kursy walut z cache");
        setRates(cache.rates);
        setLoadedAt(cache.loadedAt);
        shouldFetch = false;
      }

      if (shouldFetch) {
        console.log("📡 Fetching fresh currency rates…");
        fetch(`https://api.exchangeratesapi.io/v1/latest?access_key=${apiKey}&symbols=PLN,USD,GBP,CHF`)
          .then(res => res.json())
          .then(json => {
            if (!json.success || !json.rates?.PLN) {
              console.error("❌ API error:", json);
              return;
            }

            const rates = {
              EUR: json.rates.PLN,
              USD: json.rates.PLN / json.rates.USD,
              GBP: json.rates.PLN / json.rates.GBP,
              CHF: json.rates.PLN / json.rates.CHF
            };

            setRates(rates);
            const now = Date.now();
            setLoadedAt(now);
            window.electron.saveJSON('currency', { rates, loadedAt: now });
          });
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
