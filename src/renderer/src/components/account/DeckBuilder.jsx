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
import baseDecks from '../../jsons/decks.json'
import { getCardsBasedOnMultipleInfos, getTotalCost } from '../effects/basics'
import { IsDeckValid } from '../others/toolBox'

export default function DeckBuilder() {
  const [deckBuilderOn, setDeckBuilderOn] = useState(false)
  const { userInfo, userSettings } = useContext(AuthContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })

  // Référence pour capturer l'élément

  return (
    <div className="deckBuilder">
      <h1>Mes decks</h1>
      <hr />
      <div className="deckBuilder-list">
        {userInfo.decks.length < 8 && (
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
            key={deck.name}
            className={`deckBuilder-list-deck ${IsDeckValid(deck) ? '' : 'invalid'}`}
            onMouseEnter={hover}
            onClick={() => {
              select()
              setDeckBuilderOn(deck)
            }}
          >
            <div className="deckBuilder-list-deck-wrapper">
              <div className="deckBuilder-list-deck-preview">
                <img src={deck.cards[7].image} className="main" alt="Main card" />
                <img src={deck.cards[0].image} className="secondary" alt="Secondary card" />
              </div>
              <div className="deckBuilder-list-deck-infos">
                <h2>{deck.name}</h2>
                <h3>
                  Par {deck.creator} | Coût : {deck.cost}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
      <h1>Modèles de decks</h1>
      <hr />
      <div className="deckBuilder-list">
        {baseDecks.map((deck) => {
          deck.cards = getCardsBasedOnMultipleInfos(deck.content)
          deck.cost = getTotalCost(deck.cards)
          return (
            <div
              key={deck.name}
              className="deckBuilder-list-deck"
              onMouseEnter={hover}
              onClick={() => {
                select()
                setDeckBuilderOn(deck)
              }}
            >
              <div className="deckBuilder-list-deck-wrapper">
                <div className="deckBuilder-list-deck-preview">
                  <img src={deck.cards[7].image} className="main" alt="Main card" />
                  <img src={deck.cards[0].image} className="secondary" alt="Secondary card" />
                </div>
                <div className="deckBuilder-list-deck-infos">
                  <h2>{deck.name}</h2>
                  <h3>Coût : {deck.cost}</h3>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {deckBuilderOn && (
        <Modal className="deckBuilder-editor">
          <Library editorMode={setDeckBuilderOn} deck={deckBuilderOn !== 'open' && deckBuilderOn} />
          <img className="deckBuilder-editor-bg" src={BabelfestBackground} alt="Background" />
          <div className="deckBuilder-editor-black"></div>
        </Modal>
      )}
    </div>
  )
}
