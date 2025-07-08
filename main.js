//require('electron-reload')(__dirname, {
//  electron: require(`${__dirname}/node_modules/electron`)
//});

const { app } = require('electron');
//const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

const isDev = !app?.isPackaged;
process.env.NODE_ENV = isDev ? 'development' : 'production';

let waitOn;
if (isDev) {
  waitOn = require('wait-on');
}

if (isDev) {
  try {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
  } catch (err) {
    console.warn('electron-reload failed to load in dev mode');
  }
}

const { BrowserWindow, ipcMain } = require('electron');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
  });

  if (isDev) {
    waitOn({ resources: ['http://localhost:3000'], timeout: 20000 }, () => {
      win.loadURL('http://localhost:3000');
    });
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC: NOTES

const NOTES_DIR = path.join(app.getPath('userData'), 'notes');
if (!fs.existsSync(NOTES_DIR)) fs.mkdirSync(NOTES_DIR, { recursive: true });

ipcMain.handle('load-notes', () => {
  const files = fs.readdirSync(NOTES_DIR);
  return files.map(name => {
    const content = fs.readFileSync(path.join(NOTES_DIR, name), 'utf-8');
    return { id: name.replace('.json', ''), ...JSON.parse(content) };
  });
});

ipcMain.handle('save-note', (_, note) => {
  const content = JSON.stringify(note);
  fs.writeFileSync(path.join(NOTES_DIR, `${note.id}.json`), content);
  return true;
});

const CLIPBOARD_FILE = path.join(app.getPath('userData'), 'clipboard-history.json');

function loadClipboardHistory() {
  try {
    const data = fs.readFileSync(CLIPBOARD_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveClipboardHistory(history) {
  fs.writeFileSync(CLIPBOARD_FILE, JSON.stringify(history.slice(0, 50)));
}

ipcMain.handle('get-clipboard-history', () => {
  return loadClipboardHistory();
});

ipcMain.handle('save-clipboard-entry', (_, text) => {
  const history = loadClipboardHistory();
  if (text && !history.includes(text)) {
    history.unshift(text);
    saveClipboardHistory(history);
  }
});



