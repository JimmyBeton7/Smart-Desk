import React, { useEffect, useState } from 'react';
import './HardwareInfo.css';

function HardwareInfo() {
  const [data, setData] = useState(null);

  useEffect(() => {
    window.electron.getHardwareInfo().then(setData);
  }, []);

  if (!data) return <p>Loading hardware info…</p>;

  return (
    <div className="hardware-page">
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
