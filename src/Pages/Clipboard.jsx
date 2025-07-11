import React, { useEffect, useState } from 'react';
import './Clipboard.css';
import { Trash } from 'lucide-react';

const Clipboard = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
  console.log('Clipboard API:', window.electron?.clipboard);
  console.log('readText type:', typeof window.electron?.clipboard?.readText);

  window.electron.ipc.invoke('get-clipboard-history').then(setHistory);

  const interval = setInterval(async () => {
  try {
    const current = await window.electron?.clipboard?.readText?.();
    if (current) {
      await window.electron.ipc.invoke('save-clipboard-entry', current);
      const updated = await window.electron.ipc.invoke('get-clipboard-history');
      setHistory(updated);
    }
  } catch (err) {
    console.error("❌ Clipboard read error:", err);
  }
}, 3000);


  return () => clearInterval(interval);
}, []);


  const copyToClipboard = (text) => {
    window.electron.clipboard.writeText(text);
    //window.electron.clipboardWriteText(text);

  };

  const clearClipboardHistory = async () => {
    await window.electron.ipc.invoke('clear-clipboard-history');
    setHistory([]);
  };

  return (
    <div className="clipboard-container">
      <h2>Clipboard History</h2>
      <button className="clear-btn" onClick={clearClipboardHistory}>
          <Trash size={18} style={{ marginRight: 6 }} />
          Clear
        </button>
      <div className="clipboard-grid">
        {history.map((item, index) => (
          <div key={index} className="clipboard-tile" onClick={() => copyToClipboard(item)}>
            {item.length > 200 ? item.slice(0, 200) + '…' : item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clipboard;
