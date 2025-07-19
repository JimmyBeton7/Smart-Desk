import React, { useEffect, useState } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import './HardwareInfo.css';

function HardwareInfo() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    const newData = await window.electron.getHardwareInfo();
    setData(newData);
    setLoading(false);
  };

  const handleExport = async () => {
  const lines = [];

  const add = (label, value) => {
    lines.push(`${label}: ${value}`);
  };

  if (!data) return;

  add('CPU', `${data.cpu?.manufacturer} ${data.cpu?.brand}`);
  add('Cores', data.cpu?.cores);
  add('Speed', `${data.cpu?.speed} GHz`);

  add('RAM Total', `${(data.mem?.total / 1e9).toFixed(2)} GB`);
  add('RAM Free', `${(data.mem?.free / 1e9).toFixed(2)} GB`);

  if (Array.isArray(data.disk)) {
    data.disk.forEach(d => add(`Disk ${d.fs}`, `${(d.used / 1e9).toFixed(1)} / ${(d.size / 1e9).toFixed(1)} GB`));
  }

  add('OS', `${data.os?.distro} (${data.os?.arch})`);

  if (Array.isArray(data.netInf)) {
    data.netInf.forEach(n => add(`Network ${n.iface}`, n.ip4 || 'No IP'));
  }

  if (Array.isArray(data.netStats)) {
    data.netStats.forEach(ns => add(`Traffic ${ns.iface}`, `⬆ ${(ns.tx_sec / 1024).toFixed(1)} KB/s ⬇ ${(ns.rx_sec / 1024).toFixed(1)} KB/s`));
  }

  if (Array.isArray(data.gpu?.controllers)) {
    data.gpu.controllers.forEach(g => add('GPU', `${g.model} • ${g.vram}MB`));
  }

  if (data.battery?.hasbattery) {
    add('Battery Cycles', data.battery.cycleCount);
    add('Battery Voltage', `${data.battery.voltage} V`);
    add('On AC', data.battery.acConnected ? 'Yes' : 'No');
    add('Time Left', `${data.battery.timeRemaining} min`);
  }

  if (Array.isArray(data.usb)) {
    data.usb.forEach(u => add('USB', `${u.vendor || 'Unknown'} ${u.name || ''}`));
  }

  if (Array.isArray(data.audio)) {
    data.audio.forEach(a => add('Audio', `${a.name} (${a.type})`));
  }

  const content = lines.join('\n');
  await window.electron.exportNote('hardware-info', content);
};


  /*
  useEffect(() => {
    window.electron.getHardwareInfo().then(setData);
  }, []);
  */
 useEffect(() => {
  (async () => {
    const saved = await window.electron.loadJSON('hardware');
    if (saved && Object.keys(saved).length > 0) {
      setData(saved);
    } else {
      const fresh = await window.electron.getHardwareInfo();
      setData(fresh);
    }
  })();
}, []);


  if (loading || !data) {
  return (
    <div className="hardware-loading">
      <div className="spinner" />
      <p>{loading ? 'Refreshing hardware info…' : 'Loading hardware info…'}</p>
    </div>
  );
}

  return (
    <div className="hardware-page">

        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', margin: '20px' }}>
          <button onClick={handleRefresh} className="hardware-refresh-btn"><RefreshCw size={16} style={{ marginRight: 8 }}/> Refresh</button>
          <button onClick={handleExport} className="hardware-refresh-btn"><Download size={16} style={{marginRight: 6}} /> Export</button>
        </div>

    <div className="hardware-grid">

      {/* CPU */}
      <div className="hardware-tile">
        <h3>CPU</h3>
        <p>{data.cpu?.manufacturer} {data.cpu?.brand}</p>
        <p>{data.cpu?.cores} cores • {data.cpu?.speed} GHz</p>
      </div>

      {/* RAM */}
      <div className="hardware-tile">
        <h3>RAM</h3>
        <p>Total: {(data.mem?.total / 1e9).toFixed(2)} GB</p>
        <p>Free: {(data.mem?.free / 1e9).toFixed(2)} GB</p>
      </div>

      {/* Disk */}
      <div className="hardware-tile">
        <h3>Disk</h3>
        {Array.isArray(data.disk) && data.disk.length > 0 ? (
          data.disk.map((d, i) => (
            <p key={i}>{d.fs}: {(d.used / 1e9).toFixed(1)} / {(d.size / 1e9).toFixed(1)} GB</p>
          ))
        ) : (
          <p>No disk data</p>
        )}
      </div>

      {/* OS */}
      <div className="hardware-tile">
        <h3>OS</h3>
        <p>{data.os?.distro} ({data.os?.arch})</p>
      </div>

      {/* Network */}
      <div className="hardware-tile">
        <h3>Network</h3>
        {Array.isArray(data.net) && data.net.length > 0 ? (
          data.net.map((n, i) => (
            <p key={i}>{n.iface}: {n.ip4 || 'No IP'}</p>
          ))
        ) : (
          <p>No interfaces</p>
        )}
      </div>

      {/* Network Stats */}
      <div className="hardware-tile">
        <h3>Network Stats</h3>
        {Array.isArray(data.netStats) && data.netStats.length > 0 ? (
          data.netStats.map((ns, i) => (
            <p key={i}>
              {ns.iface}: ⬆{(ns.tx_sec / 1024).toFixed(1)} KB/s ⬇{(ns.rx_sec / 1024).toFixed(1)} KB/s
            </p>
          ))
        ) : (
          <p>No traffic</p>
        )}
      </div>

      {/* GPU */}
      <div className="hardware-tile">
        <h3>GPU</h3>
        {Array.isArray(data.gpu?.controllers) && data.gpu.controllers.length > 0 ? (
          data.gpu.controllers.map((g, i) => (
            <p key={i}>{g.model} • {g.vram}MB</p>
          ))
        ) : (
          <p>No GPU data</p>
        )}
      </div>

      {/* Battery */}
      <div className="hardware-tile">
        <h3>Battery</h3>
        {data.battery?.hasbattery ? (
          <>
            <p>Cycles: {data.battery.cycleCount}</p>
            <p>Voltage: {data.battery.voltage} V</p>
            <p>On AC: {data.battery.acConnected ? 'Yes' : 'No'}</p>
            <p>Time left: {data.battery.timeRemaining} min</p>
          </>
        ) : (
          <p>No battery</p>
        )}
      </div>

      {/* USB */}
      <div className="hardware-tile">
        <h3>USB Devices</h3>
        {Array.isArray(data.usb) && data.usb.length > 0 ? (
          data.usb.map((u, i) => (
            <p key={i}>{u.vendor || 'Unknown'} {u.name || ''}</p>
          ))
        ) : (
          <p>No USB devices</p>
        )}
      </div>

      {/* Audio */}
      <div className="hardware-tile">
        <h3>Audio Devices</h3>
        {Array.isArray(data.audio) && data.audio.length > 0 ? (
          data.audio.map((a, i) => (
            <p key={i}>{a.name} ({a.type})</p>
          ))
        ) : (
          <p>No audio devices</p>
        )}
      </div>

    </div>
    </div>
  );
}

export default HardwareInfo;
