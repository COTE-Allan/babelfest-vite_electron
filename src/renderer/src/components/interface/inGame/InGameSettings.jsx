import '../../../styles/interface/inGame/shop.scss'
import { useContext, useState } from 'react'
import { GlobalContext } from '../../providers/GlobalProvider'
import Button from '../../items/Button'
import MusicPlayer from '../musicPlayer'
import Slider from 'rc-slider'
import useSound from 'use-sound'
import selectSfx from '../../../assets/sfx/menu_select.wav'
import { AuthContext } from '../../../AuthContext'
import { defineWinner } from '../../others/toolBox'

export default function InGameSettings() {
  const { gameData, room, playerID, isSpectator } = useContext(GlobalContext)
  const { userSettings, setUserSettings, saveSettings } = useContext(AuthContext)
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const [smthChanged, setSmthChanged] = useState(false)
  const [giveUp, setGiveUp] = useState(false)

  // Abandonner le match
  function giveUpForReal() {
    if (giveUp) {
      defineWinner(room, playerID === 1 ? 2 : 1)
      setGiveUp(false)
    } else {
      setGiveUp(true)
    }
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
    <div className="ig-settings">
      <h1>Partie en cours</h1>
      <span>Code de la partie : {room}</span>
      {!isSpectator && (
        <Button onClick={giveUpForReal}>{giveUp ? 'Vraiment ?' : 'Concéder le match'}</Button>
      )}
      <h1>Paramètres</h1>
      <div className="volume-settings">
        <div className="volume-settings-item">
          <label>Volume des bruitages</label>
          <Slider
            onChange={(value) => handleSliderChange('sfxVolume', value)}
            min={0}
            max={1}
            value={userSettings.sfxVolume}
            step={0.1}
            railStyle={{ backgroundColor: 'rgba(255,255,255, 0.5)' }}
            handleStyle={{ borderColor: 'white', backgroundColor: 'white' }}
            trackStyle={{ backgroundColor: 'white' }}
          />
        </div>
        <div className="volume-settings-item">
          <label>Volume de la musique</label>
          <Slider
            onChange={(value) => handleSliderChange('musicVolume', value)}
            min={0}
            max={0.5}
            value={userSettings.musicVolume}
            step={0.1}
            railStyle={{ backgroundColor: 'rgba(255,255,255, 0.5)' }}
            handleStyle={{ borderColor: 'white', backgroundColor: 'white' }}
            trackStyle={{ backgroundColor: 'white' }}
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
      </div>{' '}
      {smthChanged && (
        <div className="settings-confirm">
          <span>Vous avez des changements non sauvegardés !</span>
          <Button onClick={handleSave}>Sauvegarder</Button>
        </div>
      )}
    </div>
  )
}
