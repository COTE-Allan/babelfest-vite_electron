import React from 'react'
import { useTransition } from '../../TransitionContext'
import HudNavLink from './hudNavLink'
import { FaArrowLeft, FaHome } from 'react-icons/fa'

const BackButton = ({ clickEvent = false, onlyHome = false }) => {
  const { goBack, depth, goHome } = useTransition()

  const handleGoBack = (isHome = false) => {
    if (clickEvent) {
      clickEvent()
    }

    if (isHome) {
      goHome()
    } else {
      goBack()
    }
  }

  return (
    <div className="back-button-container">
      {!onlyHome && (
        <HudNavLink className="back-button" onClick={handleGoBack}>
          <FaArrowLeft size={45} />
          <span className="hidden-span">Retour</span>
        </HudNavLink>
      )}
      {(depth >= 2 || onlyHome) && (
        <HudNavLink className="back-button back-button-home" onClick={() => handleGoBack(true)}>
          <FaHome size={45} />
          <span className="hidden-span">Menu principal</span>
        </HudNavLink>
      )}
    </div>
  )
}

export default BackButton
