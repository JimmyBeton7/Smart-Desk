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
    //setMenuBarVisibility: false,
    icon: path.join(__dirname, 'assets', 'logo.ico'),
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

app.commandLine.appendSwitch('enable-geolocation');


app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
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

const { dialog } = require('electron');

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

//==============================================================================

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

//==============================================================================

const sharp = require('sharp');

ipcMain.handle('pick-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile'] });
  return canceled ? null : filePaths[0];
});

ipcMain.handle('convert-file', async (_, filePath, targetFormat) => {
  try {
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

const PDFOfficeGen = require('pdf-officegen');

ipcMain.handle('convert-pdf-to-docx', async (_, pdfPath) => {
  try {
    const generator = new PDFOfficeGen.Word({ engine: 'ghostscript' }); // lub 'mupdf'
    const outPath = pdfPath.replace(/\.pdf$/i, '.docx');

    await new Promise((resolve, reject) => {
      generator.convertFromPdf(pdfPath, async (err, result) => {
        if (err) {
          console.error('❌ pdf-officegen conversion failed:', err);
          reject(err);
        } else {
          fs.writeFileSync(outPath, result);
          resolve();
        }
      });
    });

    return { success: true, output: outPath };
  } catch (err) {
    console.error('❌ Conversion error:', err);
    return { success: false, error: err.message || String(err) };
  }
});

//==============================================================================

process.env.WEATHERSTACK_KEY = process.env.WEATHERSTACK_KEY || require('dotenv').config().parsed.WEATHERSTACK_KEY;




