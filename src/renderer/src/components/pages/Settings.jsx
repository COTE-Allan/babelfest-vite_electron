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

  const handleSliderChange = (value) => {
    select()
    setUserSettings((prevSettings) => ({
      ...prevSettings,
      sfxVolume: value
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
            <Switch
              checked={userSettings.bgOn}
              defaultValue={userSettings.bgOn}
              onChange={() => handleToggleChange('bgOn')}
            />
          </div>
        </div>
        <div className="settings-list-item">
          <label className="settings-list-item-label">Fiche tutoriel en jeu</label>
          <div className="settings-list-item-input">
            <Switch
              checked={userSettings.tutorial}
              defaultValue={userSettings.tutorial}
              onChange={() => handleToggleChange('tutorial')}
            />
          </div>
        </div>
        <div className="settings-list-item">
          <label className="settings-list-item-label">Volume des bruitages</label>
          <div className="settings-list-item-input">
            <Slider
              onChange={handleSliderChange}
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
      </div>
      {smthChanged && (
        <div className="settings-confirm">
          {user ? (
            <>
              <span>Vous avez des changements non sauvegardés !</span>
              <Button onClick={handleSave}>Sauvegarder</Button>
            </>
          ) : (
            <span>
              Créez un compte pour sauvegarder vos changements après avoir quitter le site !
            </span>
          )}
        </div>
      )}
      <MenuFooter />
    </div>
  )
}

export default Settings
