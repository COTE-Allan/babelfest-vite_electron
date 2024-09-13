import { app, shell, BrowserWindow, ipcMain, Menu, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png'
import { setupTitlebar, attachTitlebarToWindow } from 'custom-electron-titlebar/main'
import Store from 'electron-store'
import log from 'electron-log'
import pkg from 'electron-updater'

const { autoUpdater } = pkg
const store = new Store()

setupTitlebar()

let mainWindow

// Configure electron-log to output to console
log.transports.console.level = 'info'
log.transports.file.level = true

autoUpdater.logger = log

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
    resizable: true,
    fullscreen: screenMode === 'fullscreen', // Start in fullscreen if it was last used in fullscreen
    titleBarStyle: 'hidden',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: true
    },
    icon: join(__dirname, '../renderer/babelfest_w.ico')
  })

  const menu = new Menu()
  Menu.setApplicationMenu(menu)
  attachTitlebarToWindow(mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    setTimeout(() => {
      mainWindow.setResizable(false)
    }, 100)

    // Hide titlebar if in fullscreen mode
    if (screenMode === 'fullscreen') {
      mainWindow.setFullScreen(true)
      mainWindow.webContents.send('fullscreen-changed', true)
    }
  })

  mainWindow.on('enter-full-screen', () => {
    store.set('screenMode', 'fullscreen')
    mainWindow.webContents.send('fullscreen-changed', true)
  })

  mainWindow.on('leave-full-screen', () => {
    store.set('screenMode', 'windowed')
    mainWindow.webContents.send('fullscreen-changed', false)
  })
  mainWindow.webContents.on('did-finish-load', () => {
    // Ouvre DevTools avec F12
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12' && input.type === 'keyDown') {
        mainWindow.webContents.openDevTools()
      }
    })
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

function checkForUpdates() {
  autoUpdater.checkForUpdatesAndNotify()

  autoUpdater.on('update-available', (info) => {
    log.info('Update available.')
    if (mainWindow) {
      log.info('wow!.', info)
      mainWindow.webContents.send('update_available', info)
    }
  })

  autoUpdater.on('download-progress', (progress) => {
    log.info(`Download speed: ${progress.bytesPerSecond} - Downloaded ${progress.percent}%`)
    if (mainWindow) {
      mainWindow.webContents.send('download_progress', progress)
    }
  })

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded; will install in 5 seconds')
    if (mainWindow) {
      mainWindow.webContents.send('update_downloaded', info)
      setTimeout(() => {
        autoUpdater.quitAndInstall(true, true)
      }, 5000)
    }
  })

  autoUpdater.on('error', (err) => {
    log.error('Error in auto-updater. ' + err)
    if (mainWindow) {
      mainWindow.webContents.send('update_error', err)
    }
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.coteallan.babelfest')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('get-settings', () => {
    const settings = {
      sfxVolume: store.get('sfxVolume', 0.5),
      bgOn: store.get('bgOn', true),
      tutorial: store.get('tutorial', true),
      screenMode: store.get('screenMode', 'windowed'),
      resolution: store.get('resolution', '1536x864'),
      musicOnLaunch: store.get('musicOnLaunch', 'true'),
      musicVolume: store.get('musicVolume', 0.25),
      searchPing: store.get('searchPing', true)
    }
    return settings
  })

  ipcMain.handle('is-fullscreen', () => {
    return mainWindow.isFullScreen()
  })

  ipcMain.on('settings', (_, settings) => {
    store.set('screenMode', settings.screenMode)
    store.set('resolution', settings.resolution)
    store.set('sfxVolume', settings.sfxVolume)
    store.set('tutorial', settings.tutorial)
    store.set('bgOn', settings.bgOn)
    store.set('musicOnLaunch', settings.musicOnLaunch)
    store.set('musicVolume', settings.musicVolume)
    store.set('searchPing', settings.searchPing)

    mainWindow.setResizable(true)

    if (settings.screenMode === 'fullscreen') {
      const { width, height } = screen.getPrimaryDisplay().workAreaSize
      mainWindow.setFullScreen(false)
      mainWindow.setSize(width, height)
      mainWindow.setFullScreen(true)
    }

    if (settings.screenMode === 'windowed') {
      mainWindow.setFullScreen(false)
      const [width, height] = settings.resolution.split('x').map(Number)
      mainWindow.setSize(width, height)
      mainWindow.center()
    }

    mainWindow.setResizable(false)
    mainWindow.webContents.send('settings-updated', settings)
  })

  ipcMain.on('close-app', () => {
    app.quit()
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  checkForUpdates()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
