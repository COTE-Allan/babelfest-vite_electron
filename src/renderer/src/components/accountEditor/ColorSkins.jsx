import { useContext, useState } from 'react'
import colorsSkins from '../../jsons/skins/colorsSkins.json'
import { AuthContext } from '../../AuthContext'
import { FaLock } from 'react-icons/fa'
import { PiNumberCircleTwoFill, PiNumberCircleOneFill } from 'react-icons/pi'
import { isUnlocked, useSendErrorMessage } from '../others/toolBox'
import SkinsButton from '../items/skinsButton'

export default function ColorSkins({
  selectedPrimary,
  selectedSecondary,
  setSelectedSecondary,
  setSelectedPrimary
}) {
  const { userInfo } = useContext(AuthContext)
  const [colorLabel, setColorLabel] = useState([
    colorsSkins[0].name,
    colorsSkins[0].unlockTip,
    true
  ])
  const sendErrorMessage = useSendErrorMessage()

  return (
    <div className="skins-selector">
      <div className="skins-selector-infos">
        <span className="skins-selector-title">
          {colorLabel[0]} {colorLabel[2] === false && <FaLock />}
        </span>
        <span className="skins-selector-desc">{colorLabel[1]}</span>
      </div>
      <div className="skins-selector-list-wrapper">
        <div className="skins-selector-list">
          {colorsSkins.map((color) => {
            let lockedCondition = isUnlocked(color, userInfo)

            // TODO: couleur arc en ciel en jeu (faut stocker la classe avec le hex (ou juste la classe ?))
            return (
              <SkinsButton
                lockedCondition={lockedCondition}
                className={`color ${color.classes ? color.classes : ''}`}
                style={{ backgroundColor: color.hex }}
                onClick={() => {
                  if (color.hex !== selectedSecondary) {
                    if (color.hex === selectedPrimary) {
                      setSelectedPrimary(null)
                    } else {
                      setSelectedPrimary(color.hex)
                    }
                  } else {
                    sendErrorMessage('Cette couleur est déjà votre couleur secondaire.')
                  }
                }}
                onMouseEnter={() => setColorLabel([color.name, color.unlockTip, lockedCondition])}
                onContextMenu={() => {
                  if (color.hex !== selectedPrimary) {
                    if (color.hex === selectedSecondary) {
                      setSelectedSecondary(null)
                    } else {
                      setSelectedSecondary(color.hex)
                    }
                  } else {
                    sendErrorMessage('Cette couleur est déjà votre couleur primaire.')
                  }
                }}
                selected={selectedPrimary === color.hex || selectedSecondary === color.hex}
              >
                {selectedPrimary === color.hex && <PiNumberCircleOneFill className="btn-icon" />}
                {selectedSecondary === color.hex && <PiNumberCircleTwoFill className="btn-icon" />}
              </SkinsButton>
              // <ColorButton
              //   key={color.hex}
              //   color={color}

              //   unlocked={lockedCondition}
              //   onMouseEnter={() =>
              //     setColorLabel([color.name, color.unlockTip, lockedCondition])
              //   }
              //   onContextMenu={(e) => {
              //     e.preventDefault();
              //     if (lockedCondition && color.hex !== selectedPrimary) {
              //       if (color.hex === selectedSecondary) {
              //         setSelectedSecondary(null);
              //       } else {
              //         setSelectedSecondary(color.hex);
              //       }
              //     } else {
              //       toast.error("Cette couleur est déjà votre couleur primaire.");
              //     }
              //   }}
              //   selectedPrimary={color.hex === selectedPrimary}
              //   selectedSecondary={color.hex === selectedSecondary}
              // />
            )
          })}
        </div>
      </div>

      <label className="tip">
        Clique-droit pour choisir votre couleur secondaire. Elle sera utilisée quand votre
        adversaire utilise la même couleur que vous.
      </label>
    </div>
  )
}
