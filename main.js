process.env.NODE_ENV = 'development';

const { app, BrowserWindow } = require('electron/main')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: false,        
    maximizable: false,     
    fullscreenable: false,
    webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
  },
  })

  if (process.env.NODE_ENV === 'development') {
  win.loadURL('http://localhost:3000/index.html');
} else {
  win.loadFile('index.html');
}
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})