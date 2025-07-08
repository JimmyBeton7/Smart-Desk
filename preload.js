const { contextBridge, ipcRenderer, clipboard } = require('electron');
//const electronClipboard = require('electron').clipboard;

console.log("✅ preload.js loaded");

contextBridge.exposeInMainWorld('electron', {
  ipc: {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    on: (channel, listener) => ipcRenderer.on(channel, listener)
  },
  clipboard: {
    readText: () => clipboard.readText(),
    writeText: (text) => clipboard.writeText(text)
  }
  //clipboardReadText: () => clipboard.readText(),
  //clipboardWriteText: (text) => clipboard.writeText(text)
});
