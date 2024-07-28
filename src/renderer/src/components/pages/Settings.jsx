import Switch from 'react-switch'
import '../../styles/pages/settings.scss'
import MenuFooter from '../interface/MenuFooter'
import { AuthContext } from '../../AuthContext'
import { useContext, useState } from 'react'
import Slider from 'rc-slider'
import useSound from 'use-sound'
import selectSfx from '../../assets/sfx/menu_select.wav'
import Button from '../items/Button'

const Settings = () => {
  const { userSettings, setUserSettings, user, saveSettings } = useContext(AuthContext)
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const [smthChanged, setSmthChanged] = useState(false)

  const handleToggleChange = (settingKey) => {
    select()
    setUserSettings((prevSettings) => ({
      ...prevSettings,
      [settingKey]: !prevSettings[settingKey]
    }))
    setSmthChanged(true)
  }

  const handleSliderChange = (settingKey, value) => {
    select()
    setUserSettings((prevSettings) => ({
      ...prevSettings,
      [settingKey]: value
    }))
    setSmthChanged(true)
  }

  const handleDisplaySettingsChange = (key, value) => {
    setUserSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value
    }))
    setSmthChanged(true)
  }

  const handleSave = () => {
    saveSettings()
    setSmthChanged(false)
  }

  return (
    <div className="settings">
      <h1>Paramètres</h1>
      <div className="settings-list">
        <div className="settings-list-item">
          <label className="settings-list-item-label">Background animé</label>
          <div className="settings-list-item-input">
            <Switch checked={userSettings.bgOn} onChange={() => handleToggleChange('bgOn')} />
          </div>
        </div>
        <div className="settings-list-item">
          <label className="settings-list-item-label">Fiche tutoriel en jeu</label>
          <div className="settings-list-item-input">
            <Switch
              checked={userSettings.tutorial}
              onChange={() => handleToggleChange('tutorial')}
            />
          </div>
        </div>
        <div className="settings-list-item">
          <label className="settings-list-item-label">Volume des bruitages</label>
          <div className="settings-list-item-input">
            <Slider
              onChange={(value) => handleSliderChange('sfxVolume', value)}
              min={0}
              max={1}
              value={userSettings.sfxVolume}
              step={0.05}
              railStyle={{ backgroundColor: 'rgba(255,255,255, 0.5)' }}
              handleStyle={{ borderColor: 'white', backgroundColor: 'white' }}
              trackStyle={{ backgroundColor: 'white' }}
            />
          </div>
        </div>
        <div className="settings-list-item">
          <label className="settings-list-item-label">Volume de la musique</label>
          <div className="settings-list-item-input">
            <Slider
              onChange={(value) => handleSliderChange('musicVolume', value)}
              min={0}
              max={0.5}
              value={userSettings.musicVolume}
              step={0.01}
              railStyle={{ backgroundColor: 'rgba(255,255,255, 0.5)' }}
              handleStyle={{ borderColor: 'white', backgroundColor: 'white' }}
              trackStyle={{ backgroundColor: 'white' }}
            />
          </div>
        </div>
        <div className="settings-list-item">
          <label className="settings-list-item-label">Musique au démarrage</label>
          <div className="settings-list-item-input">
            <Switch
              checked={userSettings.musicOnLaunch}
              onChange={() => handleToggleChange('musicOnLaunch')}
            />
          </div>
        </div>
        <div className="settings-list-item">
          <label className="settings-list-item-label">Mode d'écran</label>
          <div className="settings-list-item-input">
            <select
              value={userSettings.screenMode}
              onChange={(e) => handleDisplaySettingsChange('screenMode', e.target.value)}
            >
              <option value="windowed">Fenêtré</option>
              <option value="fullscreen">Plein écran</option>
            </select>
          </div>
        </div>
        <div className="settings-list-item">
          <label className="settings-list-item-label">Résolution fenêtré</label>
          <div className="settings-list-item-input">
            <select
              value={userSettings.resolution}
              onChange={(e) => handleDisplaySettingsChange('resolution', e.target.value)}
            >
              <option value="1536x864">1536x864</option>
              <option value="1600x900">1600x900</option>
              <option value="1920x1080">1920x1080</option>
            </select>
          </div>
        </div>
      </div>
      {smthChanged && (
        <div className="settings-confirm">
          <span>Vous avez des changements non sauvegardés !</span>
          <Button onClick={handleSave}>Sauvegarder</Button>
        </div>
      )}
    </div>
  )
}

export default Settings
