import { useContext, useState } from 'react'
import userTitle from '../../jsons/skins/titles.json'
import { AuthContext } from '../../AuthContext'
import { FaLock } from 'react-icons/fa'
import { toast } from 'react-toastify'
import useSound from 'use-sound'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'
import { isUnlocked, useSendErrorMessage } from '../others/toolBox'

export default function UserTitle({ title, setTitle }) {
  const [pictureLabel, setPictureLabel] = useState([
    userTitle[0].name,
    userTitle[0].unlockTip,
    true
  ])

  const { userInfo, userSettings } = useContext(AuthContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const sendErrorMessage = useSendErrorMessage()

  return (
    <div className="skins-selector">
      <div className="skins-selector-infos">
        <span className="skins-selector-title">
          {pictureLabel[0]} {pictureLabel[2] === false && <FaLock />}
        </span>
        <span className="skins-selector-desc">{pictureLabel[1]}</span>
      </div>
      <div className="skins-selector-list-wrapper">
        <div className="skins-selector-list">
          <button
            className={`skins-title-item ${title === 'level' ? 'selected' : ''}`}
            onMouseEnter={() => {
              hover()
              setPictureLabel([`Niveau ${userInfo.level}`, 'Affichez votre niveau actuel.', true])
            }}
            onClick={() => {
              select()
              setTitle('level')
            }}
          >
            <span>Niveau {userInfo.level}</span>
          </button>
          {userTitle.map((t) => {
            let lockedCondition = isUnlocked(t, userInfo)

            return (
              <button
                className={`skins-title-item ${title === t.name ? 'selected' : ''} ${!lockedCondition ? 'disabled' : ''}`}
                onMouseEnter={() => {
                  hover()
                  setPictureLabel([t.name, t.unlockTip, lockedCondition])
                }}
                onClick={() => {
                  select()
                  if (!lockedCondition) {
                    sendErrorMessage("Vous n'avez pas débloqué ce titre.")
                  } else {
                    setTitle(t.name)
                  }
                }}
              >
                <span>{t.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
