import { useContext, useState } from 'react'
import '../../styles/account/deckBuilder.scss'
import { AuthContext } from '../../AuthContext'
import { FaPlus } from 'react-icons/fa'
import Modal from '../items/ClassicModal'
import Library from '../pages/Library'
import BabelfestBackground from '../../assets/img/fond_babelfest.png'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'
import useSound from 'use-sound'

export default function DeckBuilder() {
  const [deckBuilderOn, setDeckBuilderOn] = useState(false)
  const { userInfo, userSettings } = useContext(AuthContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  return (
    <div className="deckBuilder">
      <div className="deckBuilder-list">
        {userInfo.decks.length <= 8 && (
          <div
            className="deckBuilder-list-item createNew"
            onMouseEnter={hover}
            onClick={() => {
              select()
              setDeckBuilderOn('open')
            }}
          >
            <FaPlus size={50} />
            Créer nouveau ({userInfo.decks.length}/8)
          </div>
        )}
        {userInfo.decks.map((deck) => (
          <div
            className="deckBuilder-list-item"
            onMouseEnter={hover}
            onClick={() => {
              select()
              setDeckBuilderOn(deck)
            }}
          >
            <div className="deckBuilder-list-item-info">
              <h2>{deck.name}</h2>
            </div>
            <div className="deckBuilder-list-item-bg">
              <img src={deck.cards[7].image} />
            </div>
          </div>
        ))}
      </div>
      {deckBuilderOn && (
        <Modal className="deckBuilder-editor">
          <Library editorMode={setDeckBuilderOn} deck={deckBuilderOn !== 'open' && deckBuilderOn} />
          <img className="deckBuilder-editor-bg" src={BabelfestBackground} />
        </Modal>
      )}
    </div>
  )
}
