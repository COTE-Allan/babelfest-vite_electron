import { useState, useEffect, useContext } from 'react'
import '../../styles/items/card.scss'
import { GlobalContext } from '../providers/GlobalProvider'
import { AuthContext } from '../../AuthContext'

import useSound from 'use-sound'
import selectSfx from '../../assets/sfx/card_select.wav'
import hoverSfx from '../../assets/sfx/card_hover.wav'

export default function ShopCard({ card }) {
  const { userSettings } = useContext(AuthContext)
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })

  const [selected, setSelected] = useState(false)
  const [max, setMax] = useState(0)
  const {
    selectedShopCards,
    setSelectedShopCards,
    setDetailCard,
    setAdvancedDetailCard,
    myTurn,
    phase,
    phaseRules,
    placementCostLeft,
    setRightWindow,
    rightWindow,
    setShopCardsCredits,
    isSpectator
  } = useContext(GlobalContext)

  useEffect(() => {
    setMax(phaseRules[2])
  }, [phaseRules])

  function selectShopCard() {
    if (max === 0 || isSpectator) return
    if (myTurn) {
      select()
      const cardId = card.id
      const isSelected = selectedShopCards.some((e) => e.id === cardId)

      if (placementCostLeft - card.rarity < 0) return

      let updatedCards

      if (isSelected) {
        // Si la carte est déjà sélectionnée, la désélectionner
        updatedCards = selectedShopCards.filter((item) => item.id !== cardId)
      } else {
        // Si la carte n'est pas sélectionnée
        if (selectedShopCards.length < max) {
          // Si le nombre maximum de cartes n'est pas encore atteint, ajouter la carte à la sélection
          updatedCards = [...selectedShopCards, card]
        } else {
          // Si le nombre maximum de cartes est atteint, retirer la première carte et ajouter la nouvelle carte
          updatedCards = [...selectedShopCards.slice(1), card]
        }
      }

      setSelectedShopCards(updatedCards)
    }
  }

  useEffect(() => {
    const isSelected = selectedShopCards.some((selectedCard) => selectedCard.id === card.id)
    setSelected(isSelected)
  }, [selectedShopCards])

  useEffect(() => {
    if (phase === 4) {
      const selectedShopCardsRarity = selectedShopCards.reduce((acc, card) => acc + card.rarity, 0)
      setShopCardsCredits(selectedShopCardsRarity)
    }
  }, [selectedShopCards, phase, setShopCardsCredits])

  return (
    <div
      className={`shop-item ${selected ? 'shop-item-selected' : ''} ${card.shiny ? card.shiny : ''}`}
      onClick={selectShopCard}
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
      <div className="img-container">
        <div className={`card-cost`}>
          <span className={`txt-rarity-${card.rarity}`}>{card.rarity}</span>
        </div>
        <img className="card-visual" src={card.url} />
      </div>
    </div>
  )
}
