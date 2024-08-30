import React from 'react'
import { useTransition } from '../../TransitionContext'
import HudNavLink from './hudNavLink'
import { FaArrowLeft } from 'react-icons/fa'

const BackButton = () => {
  const { goBack } = useTransition()

  const handleClick = () => {
    goBack()
  }

  return (
    <HudNavLink className="back-button" onClick={handleClick} permOpen>
      <FaArrowLeft size={45} />
      <span className="hidden-span">Retour</span>
    </HudNavLink>
  )
}

export default BackButton
