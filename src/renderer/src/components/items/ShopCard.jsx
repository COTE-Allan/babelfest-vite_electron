import { useContext, useEffect, useState } from 'react'
import { GlobalContext } from '../providers/GlobalProvider'
import { deepEqual } from '../others/toolBox'
import { AuthContext } from '../../AuthContext'
import useSound from 'use-sound'
import selectSfx from '../../assets/sfx/card_select.wav'
import hoverSfx from '../../assets/sfx/card_hover.wav'

export default function ShopCard({ card }) {
  const [selected, setSelected] = useState(false)
  const {
    setDetailCard,
    selectedShopCard,
    setSelectedShopCard,
    setAdvancedDetailCard,
    phaseRules,
    myTurn,
    rightWindow,
    setRightWindow
  } = useContext(GlobalContext)
  const { userSettings } = useContext(AuthContext)
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })

  function handleClick() {
    if (phaseRules[2] === 0 || !myTurn) return
    select()
    if (deepEqual(card, selectedShopCard)) {
      setSelectedShopCard([])
    } else {
      setSelectedShopCard(card)
    }
  }
  useEffect(() => {
    if (deepEqual(card, selectedShopCard)) {
      setSelected('selected')
    } else {
      setSelected('')
    }
  }, [selectedShopCard])
  return (
    <div
      className={`shop-item ${selected ? selected : ''} ${card.shiny ? card.shiny : ''}`}
      onContextMenu={(e) => {
        e.preventDefault()
        setAdvancedDetailCard(card)
        setRightWindow('details')
      }}
      onMouseEnter={() => {
        hover()
        setDetailCard(card)
      }}
      onMouseLeave={() => {
        setDetailCard(null)
      }}
      onClick={handleClick}
    >
      <div className="img-container">
        <div className={`card-cost`}>
          <span className={`txt-rarity-${card.rarity}`}>{card.rarity}</span>
        </div>
        <img src={card.url} alt="" />
      </div>
    </div>
  )
}
