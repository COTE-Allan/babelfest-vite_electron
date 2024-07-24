import '../../../styles/interface/inGame/shop.scss'
import ShopCard from '../../items/ShopCard'
import { useContext } from 'react'
import { GlobalContext } from '../../providers/GlobalProvider'

export default function Shop() {
  const { shop } = useContext(GlobalContext)
  return (
    <div className="shop-list">
      {shop.map((card, index) => (
        <ShopCard key={index} card={card} />
      ))}
    </div>
  )
}
