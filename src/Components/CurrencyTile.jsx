import React, { useEffect, useState } from 'react';
import './CurrencyTile.css';

function CurrencyTile() {
  const [rates, setRates] = useState(null);
  const [loadedAt, setLoadedAt] = useState(null);

  const API_KEY = "dde2a5b38eab5e24e57ef277d6066177"; // <- do testów; docelowo z window.env

  const fetchRates = async () => {
    try {
      const res = await fetch(
        `https://api.exchangeratesapi.io/v1/latest?access_key=${API_KEY}&symbols=PLN,USD,GBP,CHF`
      );
      const json = await res.json();

      if (!json.success || !json.rates || !json.rates.PLN) {
        console.error("❌ API error:", json);
        return;
      }

      const rates = json.rates;

      // ile PLN muszę zapłacić za 1 jednostkę danej waluty
      const PLNper = {
        EUR: rates.PLN,
        USD: rates.PLN / rates.USD,
        GBP: rates.PLN / rates.GBP,
        CHF: rates.PLN / rates.CHF,
      };

      console.log("💱 Kursy z API:", PLNper);

      setRates(PLNper);
      const now = Date.now();
      setLoadedAt(now);
      localStorage.setItem('currencyData', JSON.stringify({ rates: PLNper, loadedAt: now }));
    } catch (err) {
      console.error('Błąd pobierania kursów:', err);
    }
  };

  useEffect(() => {
    const cache = localStorage.getItem('currencyData');
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (cache) {
      const { rates: cachedRates, loadedAt: ts } = JSON.parse(cache);
      if (now - ts <= oneDay) {
        console.log("🪙 Kursy walut z cache");
        setRates(cachedRates);
        setLoadedAt(ts);
        return;
      }
    }

    fetchRates();
  }, []);

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
