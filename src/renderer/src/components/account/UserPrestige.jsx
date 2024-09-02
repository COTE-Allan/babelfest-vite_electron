import { useContext, useState } from 'react'
import userPrestige from '../../jsons/skins/prestigeColor.json'
import { AuthContext } from '../../AuthContext'
import { FaLock } from 'react-icons/fa'
import { toast } from 'react-toastify'
import useSound from 'use-sound'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'
import { isUnlocked, useSendErrorMessage } from '../others/toolBox'

export default function UserPrestige({ prestige, setPrestige }) {
  const [pictureLabel, setPictureLabel] = useState([
    userPrestige[0].name,
    userPrestige[0].unlockTip,
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
            className={`skins-prestige-item ${prestige === 'none' ? 'selected' : ''}`}
            onMouseEnter={() => {
              hover()
              setPictureLabel([`Défaut`, "N'équipez aucun prestige.", true])
            }}
            onClick={() => {
              select()
              setPrestige('none')
            }}
          >
            <span>Cielesis</span>
          </button>
          {userPrestige.map((t) => {
            let lockedCondition = isUnlocked(t, userInfo)

            return (
              <button
                className={`skins-prestige-item prestige  ${prestige === t.classe ? 'selected' : ''} ${!lockedCondition ? 'disabled-prestige' : ''}`}
                onMouseEnter={() => {
                  hover()
                  setPictureLabel([t.name, t.unlockTip, lockedCondition])
                }}
                onClick={() => {
                  select()
                  if (!lockedCondition) {
                    sendErrorMessage("Vous n'avez pas débloqué ce prestige.")
                  } else {
                    setPrestige(t.classe)
                  }
                }}
              >
                <div className={`${t.classe}`}>{userInfo.username}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
