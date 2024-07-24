import useSound from 'use-sound'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'
import { useContext } from 'react'
import { AuthContext } from '../../AuthContext'
import '../../styles/items/gameModeButton.scss'

export default function GameModeButton(props) {
  const { userSettings } = useContext(AuthContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })

  return (
    <button
      className={`gm-button ${props.className}`}
      onClick={() => {
        select()
        if (props.onClick) {
          props.onClick()
        }
      }}
      onMouseEnter={() => {
        hover()
        if (props.onMouseEnter) {
          props.onMouseEnter()
        }
      }}
    >
      <div className="gm-button-content">{props.children}</div>
      <img src={props.bg} alt="Fond du bouton mode de jeu" className="gm-button-bg" />
    </button>
  )
}
