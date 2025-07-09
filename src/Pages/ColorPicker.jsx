import React, { useState } from 'react';
import './ColorPicker.css';

function ColorPicker() {
  const [selectedColor, setSelectedColor] = useState(null);
  const [history, setHistory] = useState([]);

  const pickColor = async () => {
    const result = await window.electron.pickColor(); // IPC do screena i wyboru koloru
    if (result) {
      setSelectedColor(result);
      setHistory(prev => [result, ...prev.filter(c => c.hex !== result.hex)].slice(0, 10));
    }
  };

  const copyToClipboard = (value) => {
    window.electron.clipboard.writeText(value);
  };

  return (
    <div className="color-picker-container">
      <h2>Color Picker</h2>
      <button className="pick-btn" onClick={pickColor}>Pick Color</button>

      {selectedColor && (
        <div className="color-details">
          <div className="preview" style={{ backgroundColor: selectedColor.hex }} />
          <div className="color-info">
            <div onClick={() => copyToClipboard(selectedColor.hex)}>HEX: {selectedColor.hex}</div>
            <div onClick={() => copyToClipboard(selectedColor.rgb)}>RGB: {selectedColor.rgb}</div>
          </div>
        </div>
      )}

      <h3>History</h3>
      <div className="color-history">
        {history.map((color, i) => (
          <div key={i} className="color-tile" style={{ backgroundColor: color.hex }} title={color.hex} />
        ))}
      </div>
    </div>
  );
}

export default ColorPicker;
