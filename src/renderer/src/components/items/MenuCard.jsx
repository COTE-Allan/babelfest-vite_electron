import { FaLock } from 'react-icons/fa'
import { useTransition } from '../../TransitionContext'
import { useSendMessage } from '../others/toolBox'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'
import { useContext, useState } from 'react'
import { AuthContext } from '../../AuthContext'
import useSound from 'use-sound'
import ClassicModal from '../items/ClassicModal'
import Button from '../items/Button'

const MenuCard = ({
  name,
  desc,
  where,
  bg,
  classNames,
  disabled = false,
  state,
  requiresDeck = false
}) => {
  const { userSettings, userInfo } = useContext(AuthContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const { goForward } = useTransition()
  const sendMessage = useSendMessage()
  const [selectedDeck, setSelectedDeck] = useState(null)

  const handleForward = () => {
    if (disabled) {
      sendMessage(disabled, 'info')
    } else {
      if (requiresDeck) {
        if (selectedDeck) {
          select()
          goForward(where, { state: { deck: selectedDeck } })
        }
      } else {
        select()
        goForward(where, state)
      }
    }
  }

  return (
    <div className={`MenuCard ${classNames} `} onClick={handleForward} onMouseEnter={hover}>
      <span className="MenuCard-name">
        {disabled && <FaLock size={40} />}
        {disabled ? 'Bloqué' : name}
      </span>
      <span className="MenuCard-desc">{disabled ? disabled : desc}</span>
      {requiresDeck && (
        <select
          value={selectedDeck ? selectedDeck.id : ''}
          onChange={(e) =>
            setSelectedDeck(userInfo.decks.find((deck) => deck.id === e.target.value))
          }
        >
          <option value="">-- Choisir un deck --</option>
          {userInfo.decks.map((deck) => (
            <option key={deck.id} value={deck.id}>
              {deck.name}
            </option>
          ))}
        </select>
      )}
      <img src={bg} className="MenuCard-bg" />
    </div>
  )
}

export default MenuCard
