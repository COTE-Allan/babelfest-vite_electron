import useSound from 'use-sound'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'
import { NavLink } from 'react-router-dom'
import { AuthContext } from '../../AuthContext'
import { useContext } from 'react'
import '../../styles/items/hudNavLink.scss'

export default function HudNavLink(props) {
  const { userSettings } = useContext(AuthContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  return (
    <NavLink
      to={props.to}
      onMouseEnter={hover}
      className={'hudNavLink ' + props.className}
      onClick={() => {
        select()
        if (props.onClick) {
          props.onClick()
        }
      }}
    >
      {props.children}
    </NavLink>
  )
}
