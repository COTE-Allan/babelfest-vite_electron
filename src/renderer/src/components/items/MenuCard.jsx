import { FaLock } from 'react-icons/fa'
import { useTransition } from '../../TransitionContext'
import { useSendMessage } from '../others/toolBox'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'
import { useContext } from 'react'
import { AuthContext } from '../../AuthContext'
import useSound from 'use-sound'

const MenuCard = ({ name, desc, where, bg, classNames, disabled = false }) => {
  const { userSettings } = useContext(AuthContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const { goForward } = useTransition()
  const sendMessage = useSendMessage()

  const handleForward = () => {
    if (disabled) {
      sendMessage(disabled, 'info')
    } else {
      select()
      goForward(where)
    }
  }

  return (
    <div className={`MenuCard ${classNames} `} onClick={handleForward} onMouseEnter={hover}>
      <span className="MenuCard-name">
        {disabled && <FaLock size={40} />}
        {disabled ? 'Bloqué' : name}
      </span>
      <span className="MenuCard-desc">{disabled ? disabled : desc}</span>
      <img src={bg} className="MenuCard-bg" />
    </div>
  )
}

export default MenuCard
