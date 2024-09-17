import React, { useContext, useEffect, useRef, useState } from 'react'
import { GlobalContext } from '../../providers/GlobalProvider'
import { IoMdArrowRoundBack } from 'react-icons/io'
import { CardStats } from './Details/CardStats'
import { CardEffects } from './Details/CardEffects'
import '../../../styles/interface/inGame/advancedDetails.scss'

export function AdvancedDetails({ card }) {
  const { advancedDetailCard } = useContext(GlobalContext)
  const ref = useRef(null)
  const [detailCard, setDetailCard] = useState(advancedDetailCard)
  const [linkedCard, setLinkedCard] = useState(false)

  useEffect(() => {
    if (linkedCard) {
      setDetailCard(linkedCard)
      if (ref.current) {
        ref.current.scrollTo(0, 0)
      }
    } else {
      setDetailCard(advancedDetailCard)
    }
  }, [linkedCard])

  useEffect(() => {
    setDetailCard(advancedDetailCard)
  }, [advancedDetailCard])
  return (
    <div className="advancedDetails" ref={ref}>
      {detailCard.id !== advancedDetailCard.id && (
        <div
          className="details-card-back"
          onClick={() => {
            setDetailCard(advancedDetailCard)
          }}
        >
          <IoMdArrowRoundBack />
          Retour
        </div>
      )}
      <h1 className={`details-card-title txt-rarity-${detailCard.rarity}`}>{detailCard.name}</h1>
      <h2 className={`details-card-subtitle txt-rarity-${detailCard.rarity}`}>
        {detailCard.title}
      </h2>
      {detailCard.owner && (
        <h3 className="details-card-owner" style={{ color: detailCard.owner.hex }}>
          Carte invoquée par {detailCard?.owner?.name}
        </h3>
      )}
      <CardStats
        stats={[detailCard.atk, detailCard.dep, detailCard.hp]}
        basehp={detailCard.basehp}
        def={detailCard.def}
        broken={detailCard.broken}
      />
      <span className="details-card-credits">
        Carte de la collection {detailCard.collection}, dessinée par {detailCard.author}
      </span>
      {detailCard.affected && (
        <div className="details-card-afflictions">
          <h3>Buffs / Débuffs actifs :</h3>
          <ul className="details-card-afflictions-list">
            {detailCard.affected.map((affliction) => (
              <li style={{ backgroundColor: affliction.colorCode }}>{affliction.text}</li>
            ))}
          </ul>
        </div>
      )}
      <CardEffects detailCard={detailCard} setLinkedCard={setLinkedCard} />
      <img className="card-visual" src={detailCard.url} alt={`Visuel de la carte sélectionnée.`} />
    </div>
  )
}
