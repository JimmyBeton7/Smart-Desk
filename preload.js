const { contextBridge, ipcRenderer, clipboard, app } = require('electron');
//const electronClipboard = require('electron').clipboard;
const fs = require('fs');
require('dotenv').config();

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
  },
  //pickColor: () => ipcRenderer.invoke('pick-color'),
  pickFile: () => ipcRenderer.invoke('pick-file'),
  convertFile: (filePath, targetFormat) => ipcRenderer.invoke('convert-file', filePath, targetFormat),
  convertPdfToDocx: (pdfPath) => ipcRenderer.invoke('convert-pdf-to-docx', pdfPath),
  WEATHERSTACK_KEY: process.env.WEATHERSTACK_KEY,
  startColorPicker: () => ipcRenderer.invoke('start-color-picker'),
  getHardwareInfo: () => ipcRenderer.invoke('get-hardware-info'),
});

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('preview-color', (_, data) => {
    window.dispatchEvent(new CustomEvent('preview-color', { detail: data }));
  });
});
