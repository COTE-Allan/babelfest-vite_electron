import React from 'react'
import { useTransition } from '../../TransitionContext'
import HudNavLink from './hudNavLink'
import { FaArrowLeft, FaHome } from 'react-icons/fa'

const BackButton = ({ clickEvent = false }) => {
  const { goBack, depth, goHome } = useTransition()

  const handleGoBack = (isHome = false) => {
    console.log(clickEvent)
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
    <>
      <HudNavLink className="back-button" onClick={handleGoBack}>
        <FaArrowLeft size={45} />
        <span className="hidden-span">Retour</span>
      </HudNavLink>
      {depth >= 2 && (
        <HudNavLink className="back-button back-button-home" onClick={() => handleGoBack(true)}>
          <FaHome size={45} />
          <span className="hidden-span">Menu principal</span>
        </HudNavLink>
      )}
    </>
  )
}

export default BackButton
