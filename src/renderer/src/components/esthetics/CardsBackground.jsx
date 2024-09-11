import React, { useState, useEffect, useContext } from 'react'
import '../../styles/esthetics/cardsBackground.scss'
import BabelfestBackground from '../../assets/img/fond_babelfest.png'
import Confetti from 'react-confetti'
import { AuthContext } from '../../AuthContext'

export default function CardsBackground() {
  const { userSettings } = useContext(AuthContext)
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      {userSettings.bgOn && (
        <Confetti
          numberOfPieces={75}
          gravity={0.015}
          wind={0.01}
          color={['#e62e31', '#40a8f5', '#d3af21', '#ad39d3', '#f8b8eb', '#c1621e', '#4fb56c']}
          height={windowSize.height}
          className="carousel-confettis"
        />
      )}
      <div className="carousel">
        <img
          className={`carousel-picture`}
          src={BabelfestBackground}
          alt={'background du menu'}
          onLoad={() => setRegularLoaded(true)}
        />
      </div>
    </>
  )
}
