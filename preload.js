const { contextBridge, ipcRenderer, clipboard, app } = require('electron');
//const electronClipboard = require('electron').clipboard;
const fs = require('fs');

console.log("✅ preload.js loaded");

contextBridge.exposeInMainWorld('electron', {
  ipc: {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    on: (channel, listener) => ipcRenderer.on(channel, listener)
  },
  clipboard: {
    readText: () => clipboard.readText(),
    writeText: (text) => clipboard.writeText(text)
  },
  //clipboardReadText: () => clipboard.readText(),
  //clipboardWriteText: (text) => clipboard.writeText(text)
  exportNote: (title, content) =>
  ipcRenderer.invoke('export-note', title, content),

  exitApp: () => {
    ipcRenderer.send('exit-app');
  }
});
