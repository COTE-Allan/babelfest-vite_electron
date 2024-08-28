import { useContext, useState } from 'react'
import colorsSkins from '../../jsons/skins/colors.json'
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

            return (
              <SkinsButton
                isSquare
                isColor
                lockedCondition={lockedCondition}
                className={`color ${color.classes ? color.classes : ''}`}
                style={{
                  background: color.gradient
                    ? `linear-gradient(${color.hex}, ${color.gradient})`
                    : color.hex
                }}
                onClick={() => {
                  if (color.hex !== selectedSecondary?.hex) {
                    if (color.hex === selectedPrimary?.hex) {
                      setSelectedPrimary(null)
                    } else {
                      setSelectedPrimary({
                        hex: color.hex,
                        gradient: color.gradient || null
                      })
                    }
                  } else {
                    sendErrorMessage('Cette couleur est déjà votre couleur secondaire.')
                  }
                }}
                onMouseEnter={() => setColorLabel([color.name, color.unlockTip, lockedCondition])}
                onContextMenu={(e) => {
                  e.preventDefault()
                  if (color.hex !== selectedPrimary?.hex) {
                    if (color.hex === selectedSecondary?.hex) {
                      setSelectedSecondary(null)
                    } else {
                      setSelectedSecondary({
                        hex: color.hex,
                        gradient: color.gradient || null
                      })
                    }
                  } else {
                    sendErrorMessage('Cette couleur est déjà votre couleur primaire.')
                  }
                }}
                selected={
                  selectedPrimary?.hex === color.hex || selectedSecondary?.hex === color.hex
                }
              >
                {selectedPrimary?.hex === color.hex && (
                  <PiNumberCircleOneFill className="btn-icon" />
                )}
                {selectedSecondary?.hex === color.hex && (
                  <PiNumberCircleTwoFill className="btn-icon" />
                )}
              </SkinsButton>
            )
          })}
        </div>
      </div>

      {/* <label className="tip">
        Clique-droit pour choisir votre couleur secondaire. Elle sera utilisée quand votre
        adversaire utilise la même couleur que vous.
      </label> */}
    </div>
  )
}
