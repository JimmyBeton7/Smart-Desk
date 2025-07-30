//require('electron-reload')(__dirname, {
//  electron: require(`${__dirname}/node_modules/electron`)
//});
require('dotenv').config();
const path = require('path');
const { app } = require('electron');
//const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');

const { autoUpdater } = require('electron-updater');

const { Tray, Menu } = require('electron');
let tray = null;


const { dialog } = require('electron');

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

let mainWindow;
let isQuiting = false;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    setMenuBarVisibility: false,
    icon: path.join(__dirname, 'assets', 'logo.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      media: true
    },
    show: !process.argv.includes('--hidden'),
  });

  //mainWindow.webContents.on('did-finish-load', () => {
  //mainWindow.webContents.send('set-api-keys', {
    //WEATHERSTACK_KEY: process.env.WEATHERSTACK_KEY || '',
    //CURRENCY_KEY: process.env.CURRENCY_KEY || ''
  //});
//});

  mainWindow.on('close', (e) => {
  if (!app.isQuiting) {
    e.preventDefault();
    mainWindow.hide();
  }
});

  if (isDev) {
    waitOn({ resources: ['http://localhost:3000'], timeout: 20000 }, () => {
      mainWindow.loadURL('http://localhost:3000');
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

};

app.commandLine.appendSwitch('enable-geolocation');

//==================================================================
let apiKeys = { WEATHERSTACK_KEY: '', CURRENCY_KEY: '' };

let apiKeysPath = path.join(__dirname, 'apiKeys.json'); // dla dev
if (!isDev) {
  const exeDir = path.dirname(process.argv[0]);
  apiKeysPath = path.join(exeDir, 'apiKeys.json');
  console.log('📁 Szukam apiKeys.json w:', apiKeysPath);
}

try {
  const content = fs.readFileSync(apiKeysPath, 'utf-8');
  apiKeys = JSON.parse(content);
  console.log('🔐 Załadowano API keys z pliku:', apiKeys);
} catch (e) {
  console.warn('❌ Nie udało się załadować apiKeys.json:', e.message);
}
//==================================================================
let changelog = { version: '', date: '', changes:' '};

let changelogPath = path.join(__dirname, 'changelog.json'); 
if (!isDev) {
  const exeDir = path.dirname(process.argv[0]);
  changelogPath = path.join(exeDir, 'changelog.json');
  console.log('📁 Szukam changelog.json w:', changelogPath);
}

try {
  const content = fs.readFileSync(changelogPath, 'utf-8');
  changelog = JSON.parse(content);
  console.log('🔐 Załadowano changelog z pliku:', changelog);
} catch (e) {
  console.warn('❌ Nie udało się załadować changelog.json:', e.message);
}
//==================================================================

app.whenReady().then(() => {

  ipcMain.handle('get-api-keys', () => {
  console.log('🔑 Sending API keys to renderer:', apiKeys);
  return apiKeys; 
});

  ipcMain.handle('get-changelog', () => {
  console.log('🔑 Sending changelog to renderer:', changelog);
  return changelog; 
});

  autoUpdater.logger = require('electron-log');
  autoUpdater.logger.transports.file.level = 'info';

  //autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    console.log('🔄 Update available');
  });

  autoUpdater.on('update-downloaded', () => {
    console.log('✅ Update downloaded. Will install on quit.');
    
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'New version downloaded. The app will update after you close it.',
      buttons: ['OK']
    });
  });

  autoUpdater.on('error', (err) => {
    console.error('❌ Auto-update error:', err);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  tray = new Tray(path.join(__dirname, 'assets', 'logo.ico')); // użyj własnej ikonki
    const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Smart Desk', click: () => mainWindow.show() },
    { label: 'Close', click: () => app.quit() }
  ]);
  tray.setToolTip('Smart Desk');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.show();
  });

  app.setLoginItemSettings({
  openAtLogin: true,
  path: process.execPath,
  args: [
    '--hidden'
  ],
});

});

app.on('before-quit', () => {
  isQuiting = true;
  if (tray) tray.destroy();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('exit-app', () => {
  app.quit();
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

ipcMain.handle('delete-note', (_, id) => {
  const filePath = path.join(NOTES_DIR, `${id}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  return true;
});



ipcMain.handle('export-note', async (_, title, content) => {
  const { filePath } = await dialog.showSaveDialog({
    title: 'Export Note',
    defaultPath: `${title}.txt`,
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  });

  if (filePath) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  return filePath;
});

//==================================================================================

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

ipcMain.handle('clear-clipboard-history', () => {
  saveClipboardHistory([]); // czyści plik zapisując pustą tablicę
  return true;
});

//==============================================================================

/*
const { desktopCapturer, nativeImage, screen } = require('electron');

ipcMain.handle('pick-color', async () => {
  const sources = await desktopCapturer.getSources({ types: ['screen'] });
  const screenShot = sources[0];

  const image = nativeImage.createFromDataURL(screenShot.thumbnail.toDataURL());
  const size = image.getSize();
  const bounds = screen.getPrimaryDisplay().bounds;

  const mouse = screen.getCursorScreenPoint();
  const scaleX = size.width / bounds.width;
  const scaleY = size.height / bounds.height;

  const imageBuffer = image.toBitmap();
  const x = Math.floor(mouse.x * scaleX);
  const y = Math.floor(mouse.y * scaleY);
  const index = (y * size.width + x) * 4;

  const r = imageBuffer[index];
  const g = imageBuffer[index + 1];
  const b = imageBuffer[index + 2];
  const hex = `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
  const rgb = `rgb(${r},${g},${b})`;

  return { hex, rgb };
});
*/

const { desktopCapturer, nativeImage, screen } = require('electron');

ipcMain.handle('start-color-picker', async () => {
  const mainWindow = BrowserWindow.getFocusedWindow();
  if (mainWindow) mainWindow.minimize();

  const primary = screen.getPrimaryDisplay();
  const overlay = new BrowserWindow({
    x: primary.bounds.x,
    y: primary.bounds.y,
    width: primary.bounds.width,
    height: primary.bounds.height,
    transparent: true,
    frame: false,
    fullscreen: true,
    alwaysOnTop: true,
    hasShadow: false,
    skipTaskbar: true,
    enableLargerThanScreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  overlay.setIgnoreMouseEvents(false);
  overlay.setResizable(false);

  overlay.loadURL(`data:text/html;charset=UTF-8,
  <html style="margin:0;padding:0;background:rgba(0,0,0,0.2);cursor:crosshair;">
    <body>
      <div id="color-preview" style="position:fixed;pointer-events:none;width:36px;height:36px;border-radius:50%;border:2px solid white;box-shadow:0 0 6px black;"></div>
    </body>
    <script>
      const { ipcRenderer } = require('electron');

      let lastHex = '';
      const preview = document.getElementById('color-preview');

      const updatePreviewPosition = (x, y) => {
        preview.style.left = (x + 15) + 'px';
        preview.style.top = (y + 15) + 'px';
      };

      window.addEventListener('mousemove', e => {
        updatePreviewPosition(e.clientX, e.clientY);
      });

      const getColor = async () => {
        const result = await ipcRenderer.invoke('get-color-at-pointer');
        if (result && result.hex !== lastHex) {
          lastHex = result.hex;
          ipcRenderer.send('preview-color', result);
          preview.style.backgroundColor = result.hex;
        }
      };

      setInterval(getColor, 100);

      window.onclick = async () => {
        const color = await ipcRenderer.invoke('get-color-at-pointer');
        ipcRenderer.send('confirm-color', color);
      };
    </script>
  </html>
`);


  return new Promise((resolve) => {
    ipcMain.once('confirm-color', (event, color) => {
    overlay.close();
    if (mainWindow) mainWindow.restore();
    resolve(color);
    });

  });
});


async function getColorAtPointer() {
  const { screen, desktopCapturer, nativeImage } = require('electron');

  const display = screen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width, height } // <- tu najważniejsza zmiana
  });

  const screenShot = sources[0];
  const image = nativeImage.createFromDataURL(screenShot.thumbnail.toDataURL());
  const size = image.getSize();

  const mouse = screen.getCursorScreenPoint();
  const scaleX = size.width / display.bounds.width;
  const scaleY = size.height / display.bounds.height;

  const imageBuffer = image.toBitmap();
  const x = Math.floor(mouse.x * scaleX);
  const y = Math.floor(mouse.y * scaleY);
  const index = (y * size.width + x) * 4;

  const r = imageBuffer[index];
  const g = imageBuffer[index + 1];
  const b = imageBuffer[index + 2];
  const hex = `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
  const rgb = `rgb(${r},${g},${b})`;

  return { hex, rgb };
}


ipcMain.handle('get-color-at-pointer', getColorAtPointer);

ipcMain.handle('confirm-color', async () => {
  return await getColorAtPointer();
});



//==============================================================================

const sharp = require('sharp');

ipcMain.handle('pick-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile'] });
  return canceled ? null : filePaths[0];
});

ipcMain.handle('pick-file-type', async (_, filters) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: filters // np. [{ name: 'Documents', extensions: ['pdf', 'docx'] }]
  });
  return canceled ? null : filePaths[0];
});

const toIco = require('to-ico');

async function convertToIco(inputPath) {
  const buffer = await sharp(inputPath)
    .resize(256, 256)
    .png()
    .toBuffer();

  const icoBuffer = await toIco([buffer]);
  const outputPath = inputPath.replace(/\.\w+$/, '.ico');
  fs.writeFileSync(outputPath, icoBuffer);

  return { success: true, output: outputPath };
}


ipcMain.handle('convert-file', async (_, filePath, targetFormat) => {

  try {

    if (targetFormat === 'ico') {
      return await convertToIco(filePath);
    }

    const outputPath = filePath.replace(/\.\w+$/, `.${targetFormat}`);
    await sharp(filePath)
      .toFormat(targetFormat)
      .toFile(outputPath);
    return { success: true, output: outputPath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

//==============================================================================

const { exec } = require('child_process');

ipcMain.handle('convert-doc-to-pdf', async (_, inputPath) => {
  const outputPath = inputPath.replace(/\.docx$/i, '.pdf');

  const command = `"${process.env.ProgramFiles}\\Microsoft Office\\root\\Office16\\WINWORD.EXE" /mFileConvertToPDF "${inputPath}" "${outputPath}"`;

  return new Promise((resolve) => {
    exec(command, (error) => {
      if (error) {
        return resolve({ success: false, error: error.message });
      }
      return resolve({ success: true, output: outputPath });
    });
  });
});


ipcMain.handle('open-pdf-in-word', async (_, inputPath) => {
  const command = `start winword "${inputPath}"`;
  exec(command, (error) => {
    if (error) return;
  });
  return { success: true };
});

//==============================================================================

process.env.WEATHERSTACK_KEY = process.env.WEATHERSTACK_KEY || require('dotenv').config().parsed.WEATHERSTACK_KEY;

//==============================================================================

const si = require('systeminformation');

/*
ipcMain.handle('get-hardware-info', async () => {
  const [cpu, mem, os, battery, netInf, disk, gpu, netStats, usb, audio] = await Promise.all([
    si.cpu(),
    si.mem(),
    si.osInfo(),
    si.battery(),
    si.networkInterfaces(),
    si.fsSize(),
    si.graphics(),
    si.networkStats(), // nowe
    si.usb(),          // nowe
    si.audio()         // nowe
  ]);

  return {
    cpu,
    mem,
    os,
    battery,
    netInf,
    disk,
    gpu,
    netStats,
    usb,
    audio
  };
});
*/
ipcMain.handle('get-hardware-info', async () => {
  const [cpu, mem, os, battery, netInf, disk, gpu, netStats, usb, audio] = await Promise.all([
    si.cpu(),
    si.mem(),
    si.osInfo(),
    si.battery(),
    si.networkInterfaces(),
    si.fsSize(),
    si.graphics(),
    si.networkStats(),
    si.usb(),
    si.audio()
  ]);

  const fullData = {
    cpu,
    mem,
    os,
    battery,
    netInf,
    disk,
    gpu,
    netStats,
    usb,
    audio
  };

  safeWrite(HARDWARE_FILE, fullData);
  return fullData;
});



//==============================================================================

const SETTINGS_FILE = path.join(app.getPath('userData'), 'settings.json');
const WEATHER_FILE = path.join(app.getPath('userData'), 'weather.json');
const CURRENCY_FILE = path.join(app.getPath('userData'), 'currency.json');
const TODO_FILE = path.join(app.getPath('userData'), 'todo-plus.json');
const TODO_SORT_FILE = path.join(app.getPath('userData'), 'todo-sort.json');

function safeRead(file, fallback = {}) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return fallback;
  }
}

function safeWrite(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// SETTINGS
ipcMain.handle('load-settings', () => safeRead(SETTINGS_FILE));
ipcMain.handle('save-settings', (_, data) => {
  safeWrite(SETTINGS_FILE, data);
  return true;
});

// WEATHER
ipcMain.handle('load-weather', () => safeRead(WEATHER_FILE));
ipcMain.handle('save-weather', (_, data) => {
  safeWrite(WEATHER_FILE, data);
  return true;
});

// CURRENCY
ipcMain.handle('load-currency', () => safeRead(CURRENCY_FILE));
ipcMain.handle('save-currency', (_, data) => {
  safeWrite(CURRENCY_FILE, data);
  return true;
});

// TODO
ipcMain.handle('load-todo', () => safeRead(TODO_FILE, []));
ipcMain.handle('save-todo', (_, data) => {
  safeWrite(TODO_FILE, data);
  return true;
});
ipcMain.handle('load-todo-sort', () => safeRead(TODO_SORT_FILE, 'created'));
ipcMain.handle('save-todo-sort', (_, mode) => {
  safeWrite(TODO_SORT_FILE, mode);
  return true;
});

const CHAT_FILE = path.join(app.getPath('userData'), 'chat.json');

ipcMain.handle('load-chat', () => safeRead(CHAT_FILE, []));
ipcMain.handle('save-chat', (_, data) => {
  safeWrite(CHAT_FILE, data);
  return true;
});

const COLOR_HISTORY_FILE = path.join(app.getPath('userData'), 'color-history.json');

ipcMain.handle('load-color-history', () => safeRead(COLOR_HISTORY_FILE, []));
ipcMain.handle('save-color-history', (_, data) => {
  safeWrite(COLOR_HISTORY_FILE, data);
  return true;
});

const HARDWARE_FILE = path.join(app.getPath('userData'), 'hardware.json');

ipcMain.handle('load-hardware', () => safeRead(HARDWARE_FILE, {}));
ipcMain.handle('save-hardware', (_, data) => {
  safeWrite(HARDWARE_FILE, data);
  return true;
});

const TODO_CALENDAR_FILE = path.join(app.getPath('userData'), 'todo-calendar.json');

ipcMain.handle('load-todo-calendar', () => safeRead(TODO_CALENDAR_FILE, []));
ipcMain.handle('save-todo-calendar', (_, data) => {
  safeWrite(TODO_CALENDAR_FILE, data);
  return true;
});

//=============================================================================

ipcMain.handle('check-for-updates-manual', async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    console.log("🔍 checkForUpdates result:", result?.updateInfo);
    
    if (!result || !result.updateInfo || !result.updateInfo.version) {
      return { status: 'no-update' };
    }

    return { status: 'available', info: result.updateInfo };
  } catch (err) {
    console.error('❌ Manual update check failed:', err);
    return { status: 'error', message: err.message || 'Unknown error' };
  }
});

ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { status: 'downloading' };
  } catch (err) {
    console.error('❌ downloadUpdate error:', err);
    return { status: 'error', message: err.message || 'Unknown error' };
  }
});

ipcMain.on('restart-and-install', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle('get-app-version', () => {
  const version = app.getVersion();
  console.log("📦 Local app version:", version);
  return version;
});

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

ipcMain.handle('convert-audio', async (_, inputPath, format) => {
  const outputPath = inputPath.replace(/\.\w+$/, `.${format}`);
  return new Promise((resolve) => {
    ffmpeg(inputPath)
      .toFormat(format)
      .on('end', () => resolve({ success: true, output: outputPath }))
      .on('error', err => resolve({ success: false, error: err.message }))
      .save(outputPath);
  });
});
