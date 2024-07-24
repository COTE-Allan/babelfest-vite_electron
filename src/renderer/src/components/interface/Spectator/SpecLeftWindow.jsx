import { useContext, useEffect, useRef, useState } from 'react'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import SpecShop from './SpecShop'
import { SpectatorContext } from '../../providers/SpectatorProvider'

export default function SpecLeftWindow() {
  const { leftWindow } = useContext(SpectatorContext)
  const shopRef = useRef(null)
  const nodeRef = leftWindow === 'shop' ? shopRef : null

  const renderWindowContent = () => {
    switch (leftWindow) {
      case 'shop':
        return <SpecShop />
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
