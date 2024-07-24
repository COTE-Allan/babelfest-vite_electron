import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import winIcon from '../../resources/babelfest_w.ico'
import pkg from 'custom-electron-titlebar'
const { Titlebar } = pkg
const { TitlebarColor } = pkg

console.log('Preload script loaded')

// Custom APIs for renderer
const api = {
  send: (channel, data) => {
    console.log(`Sending ${channel} with data: ${JSON.stringify(data)}`)
    ipcRenderer.send(channel, data)
  },
  invoke: (channel, data) => {
    console.log(`Invoking ${channel} with data: ${JSON.stringify(data)}`)
    return ipcRenderer.invoke(channel, data)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}

window.addEventListener('DOMContentLoaded', () => {
  const options = {
    backgroundColor: TitlebarColor.fromHex('#000'),
    icon: winIcon,
    minimizable: false,
    maximizable: false
  }
  new Titlebar(options)
})
