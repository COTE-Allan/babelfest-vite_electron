import '../../../styles/interface/inGame/shop.scss'
import ShopCard from '../../items/ShopCard'
import { useContext } from 'react'
import { SpectatorContext } from '../../providers/SpectatorProvider'

export default function SpecShop() {
  const { shop, setDetailCard } = useContext(SpectatorContext)
  return (
    <div className="shop-list">
      {shop.map((card, index) => (
        <div
          className={`shop-item ${card.shiny ? card.shiny : ''}`}
          onContextMenu={(e) => {
            e.preventDefault()
            setRightWindow(rightWindow === 'details' ? null : 'details')
          }}
          onMouseEnter={() => {
            // hover();
            setDetailCard(card)
          }}
          onMouseLeave={() => {
            setDetailCard(null)
          }}
        >
          <div className="img-container">
            <div className={`card-cost`}>
              <span className={`txt-rarity-${card.rarity}`}>{card.rarity}</span>
            </div>
            <img src={card.url} alt="" />
          </div>
        </div>
      ))}
    </div>
  )
}
