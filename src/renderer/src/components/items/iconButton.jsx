import { useContext } from 'react'
import { AuthContext } from '../../AuthContext'

import useSound from 'use-sound'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'

export default function IconButton({ className, onClick, children, active }) {
  const { userSettings } = useContext(AuthContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })

  return (
    <button
      onMouseEnter={hover}
      onClick={() => {
        select()
        if (onClick) {
          onClick()
        }
      }}
      className={`ig-menu-button ${active && 'active'} ${className}`}
    >
      {children}
    </button>
  )
}
