import React, { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TransitionContext = createContext()

export const TransitionProvider = ({ children }) => {
  const [direction, setDirection] = useState('page-slide-left') // Default direction
  const [depth, setDepth] = useState(0)
  const navigate = useNavigate()

  const goForward = (path, state) => {
    setDirection('page-slide-left')
    setDepth(depth + 1)
    if (state) {
      navigate(path, state)
    } else {
      navigate(path)
    }
  }

  const goBack = () => {
    setDirection('page-slide-right')
    setDepth(depth - 1)
    navigate(-1)
  }

  const goHome = () => {
    setDirection('page-slide-right')
    navigate('/home')
    setDepth(0)
  }

  return (
    <TransitionContext.Provider value={{ direction, goForward, goBack, goHome, depth }}>
      {children}
    </TransitionContext.Provider>
  )
}

export const useTransition = () => useContext(TransitionContext)
