import '../../styles/pages/settings.scss'
import { AuthContext } from '../../AuthContext'
import { useContext, useState } from 'react'
import Slider from 'rc-slider'
import useSound from 'use-sound'
import selectSfx from '../../assets/sfx/menu_select.wav'
import Button from '../items/Button'
import BackButton from '../items/BackButton'
import HudNavLink from '../items/hudNavLink'
import { FaDesktop, FaGamepad, FaVolumeUp } from 'react-icons/fa'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

const Settings = () => {
  const { userSettings, setUserSettings, saveSettings } = useContext(AuthContext)
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const [smthChanged, setSmthChanged] = useState(false)
  const [page, setPage] = useState(1)

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
      <div className="settings-wrapper">
        <nav className="settings-nav">
          <HudNavLink onClick={() => setPage(1)} selected={page === 1} permOpen>
            <FaDesktop size={45} />
            <span className="hidden-span">Affichage</span>
          </HudNavLink>
          <HudNavLink onClick={() => setPage(2)} selected={page === 2} permOpen>
            <FaVolumeUp size={45} />
            <span className="hidden-span">Son</span>
          </HudNavLink>
          <HudNavLink onClick={() => setPage(3)} selected={page === 3} permOpen>
            <FaGamepad size={45} />
            <span className="hidden-span">En jeu</span>
          </HudNavLink>
        </nav>
        <hr />
        <TransitionGroup className={'settings-list'}>
          {page === 1 && (
            <CSSTransition key="settings-1" timeout={300} classNames="fade">
              <div className="css-transition">
                <div className="settings-list-item">
                  <label className="settings-list-item-label">Background animé</label>
                  <div className="settings-list-item-input">
                    <div
                      className="settings-list-item-input-switch"
                      onClick={() => handleToggleChange('bgOn')}
                    >
                      <div className={`on ${userSettings.bgOn && 'active'}`}>Activé</div>
                      <div className={`off ${!userSettings.bgOn && 'desactive'}`}>Désactivé</div>
                    </div>{' '}
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
              </div>
            </CSSTransition>
          )}
          {page === 2 && (
            <CSSTransition key="settings-2" timeout={300} classNames="fade">
              <div className="css-transition">
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
                    <div
                      className="settings-list-item-input-switch"
                      onClick={() => handleToggleChange('musicOnLaunch')}
                    >
                      <div className={`on ${userSettings.musicOnLaunch && 'active'}`}>Activé</div>
                      <div className={`off ${!userSettings.musicOnLaunch && 'desactive'}`}>
                        Désactivé
                      </div>
                    </div>
                  </div>
                </div>
                <div className="settings-list-item">
                  <label className="settings-list-item-label">Sonar de recherche</label>
                  <div className="settings-list-item-input">
                    <div
                      className="settings-list-item-input-switch"
                      onClick={() => handleToggleChange('searchPing')}
                    >
                      <div className={`on ${userSettings.searchPing && 'active'}`}>Activé</div>
                      <div className={`off ${!userSettings.searchPing && 'desactive'}`}>
                        Désactivé
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CSSTransition>
          )}
          {page === 3 && (
            <CSSTransition key="settings-3" timeout={300} classNames="fade">
              <div className="css-transition">
                <div className="settings-list-item">
                  <label className="settings-list-item-label">Fiche tutoriel en jeu</label>
                  <div className="settings-list-item-input">
                    <div
                      className="settings-list-item-input-switch"
                      onClick={() => handleToggleChange('tutorial')}
                    >
                      <div className={`on ${userSettings.tutorial && 'active'}`}>Activé</div>
                      <div className={`off ${!userSettings.tutorial && 'desactive'}`}>
                        Désactivé
                      </div>
                    </div>
                  </div>
                </div>
                <div className="settings-list-item">
                  <label className="settings-list-item-label">Couleurs personnalisées</label>
                  <div className="settings-list-item-input">
                    <div
                      className="settings-list-item-input-switch"
                      onClick={() => handleToggleChange('customColors')}
                    >
                      <div className={`on ${userSettings.customColors && 'active'}`}>Activé</div>
                      <div className={`off ${!userSettings.customColors && 'desactive'}`}>
                        Désactivé
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CSSTransition>
          )}
        </TransitionGroup>
        <div className={`${!smthChanged && 'disabled'} settings-confirm`}>
          <span>Vous avez des changements non sauvegardés !</span>
          <Button onClick={handleSave}>Sauvegarder</Button>
        </div>
      </div>
      <BackButton />
    </div>
  )
}

export default Settings
