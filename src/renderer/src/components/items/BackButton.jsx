import React from 'react'
import { useTransition } from '../../TransitionContext'
import HudNavLink from './hudNavLink'
import { FaArrowLeft, FaHome } from 'react-icons/fa'

const BackButton = () => {
  const { goBack, depth, goHome } = useTransition()

  return (
    <>
      <HudNavLink className="back-button" onClick={goBack}>
        <FaArrowLeft size={45} />
        <span className="hidden-span">Retour</span>
      </HudNavLink>
      {depth >= 2 && (
        <HudNavLink className="back-button back-button-home" onClick={goHome}>
          <FaHome size={45} />
          <span className="hidden-span">Menu principal</span>
        </HudNavLink>
      )}
    </>
  )
}

export default BackButton
