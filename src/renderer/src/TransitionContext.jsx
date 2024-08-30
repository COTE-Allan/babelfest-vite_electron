import React, { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TransitionContext = createContext()

export const TransitionProvider = ({ children }) => {
  const [direction, setDirection] = useState('page-slide-left') // Default direction
  const navigate = useNavigate()

  const goForward = (path) => {
    setDirection('page-slide-left')
    navigate(path)
  }

  const goBack = () => {
    setDirection('page-slide-right')
    navigate(-1)
  }

  return (
    <TransitionContext.Provider value={{ direction, goForward, goBack }}>
      {children}
    </TransitionContext.Provider>
  )
}

export const useTransition = () => useContext(TransitionContext)
