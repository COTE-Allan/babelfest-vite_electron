import React, { useState, useEffect, useMemo } from 'react'
import { getAllCards, shuffleArray } from '../others/toolBox'
import '../../styles/esthetics/cardsBackground.scss'
import BabelfestBackground from "../../assets/img/fond_babelfest.png"

export default function CardsBackground(props) {
  const [allImagesLoaded, setAllImagesLoaded] = useState(false)
  const [regularLoaded, setRegularLoaded] = useState(false)

  const totalImages = 20

  const shuffledCards = useMemo(() => {
    const cards = getAllCards()
    return shuffleArray(cards).slice(0, totalImages)
  }, [])

  useEffect(() => {
    Promise.all(shuffledCards.map((card) => preloadImage(card.url)))
      .then(() => setAllImagesLoaded(true))
      .catch((error) => console.error('Erreur lors du chargement des images', error))
  }, [shuffledCards])
  const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = resolve
      img.onerror = reject
      img.src = src
    })
  }

  const halfIndex = useMemo(() => Math.ceil(shuffledCards.length / 2), [shuffledCards])
  const firstHalf = useMemo(() => shuffledCards.slice(0, halfIndex), [halfIndex, shuffledCards])
  const secondHalf = useMemo(() => shuffledCards.slice(halfIndex), [halfIndex, shuffledCards])

  if (!allImagesLoaded) return null

  return (
    <>
      <div className={`carousel-filter`}></div>
      <div className="carousel">
        {props.animate ? (
          <>
            <CarouselLine cards={firstHalf} />
            <CarouselLine cards={secondHalf} />
          </>
        ) : (
          <>
            <img
              className={`carousel-picture ${regularLoaded && 'fade-in'}`}
              style={{ display: !regularLoaded ? 'none' : 'block' }}
              src={BabelfestBackground}
              alt={'background du menu'}
              onLoad={() => setRegularLoaded(true)}
            />
          </>
        )}
      </div>
    </>
  )
}

const CarouselLine = React.memo(({ cards }) => (
  <div className="carouselLine">
    {cards.map((card, index) => (
      <img
        key={card.id}
        className="card"
        src={card.url.replace('w_auto', 'w_100')}
        alt="Carte"
        loading="lazy"
      />
    ))}
  </div>
))
