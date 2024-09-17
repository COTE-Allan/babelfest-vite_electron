import React, { useContext, useEffect, useState, useRef } from 'react'
import { CardStats } from './Details/CardStats'
import { CardEffects } from './Details/CardEffects'
import '../../../styles/interface/inGame/details.scss'

export default function Details({ detailCard }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isPositioned, setIsPositioned] = useState(false)
  const detailsRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (detailsRef.current) {
        const detailsRect = detailsRef.current.getBoundingClientRect()
        const componentWidth = detailsRect.width
        const componentHeight = detailsRect.height
        const margin = 10

        const maxX = window.innerWidth - componentWidth - margin
        const maxY = window.innerHeight - componentHeight - margin

        let x = Math.min(Math.max(e.clientX + margin, margin), maxX)
        let y = Math.min(Math.max(e.clientY + margin, margin), maxY)

        if (window.innerWidth - e.clientX < componentWidth + margin) {
          x = e.clientX - componentWidth - margin
        }

        if (window.innerHeight - e.clientY < componentHeight + margin) {
          y = e.clientY - componentHeight - margin
        }

        setMousePosition({ x, y })
        setIsPositioned(true)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div
      ref={detailsRef}
      className="details"
      style={{
        display: mousePosition.x === 0 || !isPositioned ? 'none' : 'block',
        position: 'absolute',
        left: `${mousePosition.x}px`,
        top: `${mousePosition.y}px`,
        transform: 'translate(0, 0)'
      }}
    >
      {detailCard === 'hidden' ? (
        <>Carte dissimulée</>
      ) : (
        <div className="details-card">
          <div className="details-card-container">
            <h1 className={` details-card-title txt-rarity-${detailCard.rarity}`}>
              {detailCard.name}
            </h1>
            <h2 className={` details-card-subtitle txt-rarity-${detailCard.rarity}`}>
              {detailCard.title}
            </h2>
            {detailCard.owner && (
              <h3 className={'details-card-owner'} style={{ color: detailCard?.owner?.hex }}>
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
            <CardEffects detailCard={detailCard} />
            <span className="details-card-more">Clic droit pour plus d'infos...</span>
          </div>
        </div>
      )}
    </div>
  )
}
