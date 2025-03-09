import useSound from 'use-sound'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'
import { useContext } from 'react'
import { AuthContext } from '../../AuthContext'

export default function Button(props) {
  const { userSettings } = useContext(AuthContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })

  return (
    <button
      type={props.type ? 'submit' : 'button'}
      className={props.className}
      onClick={() => {
        select()
        if (props.onClick && !props.disabled) {
          props.onClick()
        }
      }}
      onContextMenu={(e) => {
        if (props.contextMenu) {
          e.preventDefault()
          props.contextMenu()
        }
      }}
      onMouseEnter={() => {
        if (!props.nohover) hover()
        if (props.onMouseEnter) {
          props.onMouseEnter()
        }
      }}
      style={props.style}
    >
      {props.children}
    </button>
  )
}
