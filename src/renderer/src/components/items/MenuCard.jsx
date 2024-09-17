import { FaLock } from 'react-icons/fa'
import { useTransition } from '../../TransitionContext'
import { useSendMessage } from '../others/toolBox'

const MenuCard = ({ name, desc, where, bg, classNames, disabled = false }) => {
  const { goForward } = useTransition()
  const sendMessage = useSendMessage()

  const handleForward = () => {
    if (disabled) {
      sendMessage(disabled, 'info')
    } else {
      goForward(where)
    }
  }

  return (
    <div className={`MenuCard ${classNames} `} onClick={handleForward}>
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
