import { useContext, useEffect, useRef, useState } from 'react'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import { SpectatorContext } from '../../providers/SpectatorProvider'
import SpecLogs from './SpecLogs'

export default function SpecRightWindow() {
  const { detailCard, rightWindow } = useContext(SpectatorContext)
  const detailRef = useRef(null)
  const logsRef = useRef(null)
  const nodeRef = rightWindow === 'details' ? detailRef : logsRef

  const [memorizedUrl, setMemorizedUrl] = useState(null)

  useEffect(() => {
    if (detailCard) {
      setMemorizedUrl(detailCard?.url)
    }
  }, [detailCard])

  const renderWindowContent = () => {
    switch (rightWindow) {
      case 'details':
        if (!memorizedUrl) return <h1>Passez votre souris sur une carte pour la visualiser.</h1>
        return <img src={memorizedUrl} alt={`Visuel de la carte sélectionnée.`} />
      case 'logs':
        return <SpecLogs />
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
