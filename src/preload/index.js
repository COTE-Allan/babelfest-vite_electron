import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import winIcon from '../../resources/babelfest_w.ico'
import pkg from 'custom-electron-titlebar'
const { Titlebar } = pkg
const { TitlebarColor } = pkg
// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
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
    tooltips: {
      minimize: 'Réduire',
      maximize: 'Agrandir',
      restoreDown: 'Restaurer',
      close: 'Fermer'
    }
  }
  new Titlebar(options)
})
