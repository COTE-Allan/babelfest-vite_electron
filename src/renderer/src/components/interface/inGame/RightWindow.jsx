import { useContext, useEffect, useRef, useState } from 'react'
import { GlobalContext } from '../../providers/GlobalProvider'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import Logs from './Logs'
import { AdvancedDetails } from './AdvancedDetails'

export default function RightWindow() {
  const { detailCard, advancedDetailCard, rightWindow } = useContext(GlobalContext)
  const detailRef = useRef(null)
  const logsRef = useRef(null)
  const nodeRef = rightWindow === 'details' ? detailRef : logsRef

  const renderWindowContent = () => {
    switch (rightWindow) {
      case 'details':
        if (!advancedDetailCard)
          return <h1>Clique droit sur une carte pour en afficher les détails.</h1>
        return (
          // <img src={memorizedUrl} alt={`Visuel de la carte sélectionnée.`} />
          <AdvancedDetails />
        )
      case 'logs':
        return <Logs />
      default:
        return null
    }
  }

  return (
    <SwitchTransition>
      <CSSTransition
        key={rightWindow}
        nodeRef={nodeRef}
        addEndListener={(done) => {
          nodeRef.current.addEventListener('transitionend', done, false)
        }}
        classNames="windowTransitionRight"
        unmountOnExit
        in={!!rightWindow}
        appear={true}
      >
        <>
          {rightWindow && (
            <div className="window right" ref={nodeRef}>
              {renderWindowContent()}
            </div>
          )}
        </>
      </CSSTransition>
    </SwitchTransition>
  )
}
