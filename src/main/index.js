import { app, shell, BrowserWindow, ipcMain, Menu, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png'
import { setupTitlebar, attachTitlebarToWindow } from 'custom-electron-titlebar/main'
import Store from 'electron-store'

const store = new Store()

setupTitlebar()

let mainWindow

function createWindow() {
  const screenMode = store.get('screenMode', 'windowed')
  const resolution = store.get('resolution', '1536x864').split('x')
  const width = parseInt(resolution[0])
  const height = parseInt(resolution[1])

  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    maximizable: true,
    resizable: true, // Allow resizing initially
    fullscreen: screenMode === 'fullscreen',
    titleBarStyle: 'hidden',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: true
    }
  })

  const menu = new Menu()
  Menu.setApplicationMenu(menu)
  attachTitlebarToWindow(mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    // Disable resizing after the window is shown
    setTimeout(() => {
      mainWindow.setResizable(false)
    }, 100)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('get-settings', () => {
    const settings = {
      sfxVolume: store.get('sfxVolume', 0.5),
      bgOn: store.get('bgOn', true),
      tutorial: store.get('tutorial', true),
      screenMode: store.get('screenMode', 'windowed'),
      resolution: store.get('resolution', '1536x864')
    }
    return settings
  })

  ipcMain.on('settings', (_, settings) => {
    // Enregistrement des paramètres
    store.set('screenMode', settings.screenMode)
    store.set('resolution', settings.resolution)
    store.set('sfxVolume', settings.sfxVolume)
    store.set('tutorial', settings.tutorial)
    store.set('bgOn', settings.bgOn)

    // Enable resizing temporarily to change the size
    mainWindow.setResizable(true)

    if (settings.screenMode === 'fullscreen') {
      // Passer en mode plein écran
      const { width, height } = screen.getPrimaryDisplay().workAreaSize
      mainWindow.setFullScreen(false) // Pour éviter les problèmes potentiels de redimensionnement
      mainWindow.setSize(width, height)
      mainWindow.setFullScreen(true)
    }

    if (settings.screenMode === 'windowed') {
      // Passer en mode fenêtre avec la résolution choisie
      mainWindow.setFullScreen(false)
      const [width, height] = settings.resolution.split('x').map(Number)
      mainWindow.setSize(width, height)
      mainWindow.center() // Pour recentrer la fenêtre après redimensionnement
    }

    // Disable resizing again after applying the new size
    mainWindow.setResizable(false)

    // Envoyer les paramètres mis à jour à React via IPC
    mainWindow.webContents.send('settings-updated', settings)
  })

  // Ajoutez le gestionnaire d'événements IPC pour fermer l'application
  ipcMain.on('close-app', () => {
    app.quit()
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
