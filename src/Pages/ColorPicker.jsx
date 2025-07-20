import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import './ColorPicker.css';

function ColorPicker() {
  const { t } = useTranslation();
  const [selectedColor, setSelectedColor] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
  window.electron.loadJSON('color-history').then(data => {
    if (Array.isArray(data)) setHistory(data);
  });
}, []);


const pickColor = async () => {
  const result = await window.electron.startColorPicker();
  if (result) {
    const updated = [result, ...history.filter(c => c.hex !== result.hex)].slice(0, 10);
    setSelectedColor(result);
    setHistory(updated);
    window.electron.saveJSON('color-history', updated);
  }
};


  const copyToClipboard = (value) => {
    window.electron.clipboard.writeText(value);
  };


  return (
    <div className="color-picker-container">
      <h2>{t('colorPicker.title')}</h2>
      <button className="pick-btn" onClick={pickColor}>{t('colorPicker.pick')}</button>

      {selectedColor && (
        <div className="color-details">
        <div className="preview" style={{ backgroundColor: selectedColor.hex }} />
        <div className="color-info">
        <div onClick={() => copyToClipboard(selectedColor.hex)}>
          HEX: {selectedColor.hex}
        </div>
        <div onClick={() => copyToClipboard(selectedColor.rgb)}>
          RGB: {selectedColor.rgb}
        </div>
      </div>
    </div>
    )}

      <h3>{t('colorPicker.history')}</h3>
      <div className="color-history">
        {history.map((color, i) => (
          <div
            key={i}
            className="color-tile"
            style={{ backgroundColor: color.hex }}
            title={color.hex}
            onClick={() => copyToClipboard(color.hex)}
        />
        ))}
      </div>
    </div>
  );
}

export default ColorPicker;
