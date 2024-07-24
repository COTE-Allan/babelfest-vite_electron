import { useContext, useEffect, useRef, useState } from 'react'
import { GlobalContext } from '../../providers/GlobalProvider'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import Shop from './Shop'
import Tutorial from './Tutorial'
import InGameSettings from './InGameSettings'

export default function LeftWindow() {
  const { leftWindow } = useContext(GlobalContext)
  const shopRef = useRef(null)
  const settingsRef = useRef(null)
  const helpRef = useRef(null)
  const nodeRef =
    leftWindow === 'shop' ? shopRef : leftWindow === 'settings' ? settingsRef : helpRef

  const renderWindowContent = () => {
    switch (leftWindow) {
      case 'shop':
        return <Shop />
      case 'help':
        return <Tutorial />
      case 'settings':
        return <InGameSettings />
      default:
        return null
    }
  }

  return (
    <SwitchTransition>
      <CSSTransition
        key={leftWindow}
        nodeRef={nodeRef}
        addEndListener={(done) => {
          nodeRef.current.addEventListener('transitionend', done, false)
        }}
        classNames="windowTransitionLeft"
        unmountOnExit
        in={!!leftWindow}
        appear={true}
      >
        <>
          {leftWindow && (
            <div className="window left" ref={nodeRef}>
              {renderWindowContent()}
            </div>
          )}
        </>
      </CSSTransition>
    </SwitchTransition>
  )
}
