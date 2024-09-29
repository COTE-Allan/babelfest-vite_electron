import { useLocation } from 'react-router-dom'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import React from 'react'
import { useTransition } from './TransitionContext' // Assure-toi que ce chemin est correct

const TransitionWrapper = ({ children }) => {
  const location = useLocation()
  const { direction } = useTransition()

  return (
    <>
      <TransitionGroup
        component={null}
        className="transition-group"
        childFactory={(child) =>
          React.cloneElement(child, {
            classNames: direction
          })
        }
      >
        <CSSTransition key={location.key} timeout={300} mountOnEnter unmountOnExit>
          {children}
        </CSSTransition>
      </TransitionGroup>
    </>
  )
}

export default TransitionWrapper
