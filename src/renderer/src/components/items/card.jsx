import { useState, useEffect, useContext } from 'react'
import '../../styles/items/card.scss'
import { GlobalContext } from '../providers/GlobalProvider'
import Details from '../interface/inGame/Details'
import { AuthContext } from '../../AuthContext'

import useSound from 'use-sound'
import selectSfx from '../../assets/sfx/card_select.wav'
import hoverSfx from '../../assets/sfx/card_hover.wav'

export default function Card({ card }) {
  const { userSettings } = useContext(AuthContext)
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })

  const [selected, setSelected] = useState(false)
  const [detail, setDetail] = useState(false)
  const [max, setMax] = useState(0)
  const {
    selectedCards,
    setDetailCard,
    detailCard,
    setAdvancedDetailCard,
    setSelectedCards,
    myTurn,
    phase,
    phaseRules,
    placementCostLeft,
    setRightWindow,
    rightWindow,
    setHandCardsCredits,
    setConfirmModal
  } = useContext(GlobalContext)

  useEffect(() => {
    setMax(phaseRules[0])
  }, [phaseRules])

  function selectCard() {
    if (max === 0) return
    if (myTurn || phase == 0) {
      select()
      const cardUniqueID = card.uniqueID
      const isSelected = selectedCards.some((e) => e.uniqueID === cardUniqueID)

      if (placementCostLeft - card.rarity < 0) return

      let updatedCards

      if (isSelected) {
        // Si la carte est déjà sélectionnée, la désélectionner
        updatedCards = selectedCards.filter((item) => item.uniqueID !== cardUniqueID)
        setConfirmModal(false)
      } else {
        // Si la carte n'est pas sélectionnée
        if (selectedCards.length < max) {
          // Si le nombre maximum de cartes n'est pas encore atteint, ajouter la carte à la sélection
          updatedCards = [...selectedCards, card]
        } else {
          // Si le nombre maximum de cartes est atteint, retirer la première carte et ajouter la nouvelle carte
          updatedCards = [...selectedCards.slice(1), card]
        }
      }

      setSelectedCards(updatedCards)
    }
  }

  useEffect(() => {
    const isSelected = selectedCards.some((selectedCard) => {
      return selectedCard.uniqueID === card.uniqueID
    })
    setSelected(isSelected)
  }, [selectedCards])

  useEffect(() => {
    if (phase === 4) {
      const selectedCardsRarity = selectedCards.reduce((acc, card) => acc + card.rarity, 0)
      setHandCardsCredits(selectedCardsRarity)
    }
  }, [selectedCards, phase, setHandCardsCredits])

  return (
    <div
      className={`${
        placementCostLeft - card.rarity < 0 ? 'card-unusable' : ''
      } ${selected ? 'card card-selected' : 'card'} ${card.shiny ? card.shiny : ''}`}
      onClick={selectCard}
      onMouseEnter={() => {
        hover()
        setDetailCard(card)
      }}
      onMouseLeave={() => {
        setDetailCard(null)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        setAdvancedDetailCard(card)
        setRightWindow('details')
      }}
    >
      {selected && <div className="card-filter"></div>}
      {detailCard && detailCard.id === card && <Details />}
      <div className="img-container">
        <div className={`card-cost`}>
          <span className={`txt-rarity-${card.rarity}`}>{card.rarity}</span>
        </div>
        <img className="card-visual" src={card.url} />
      </div>
    </div>
  )
}
