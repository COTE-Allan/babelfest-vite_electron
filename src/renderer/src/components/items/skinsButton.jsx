import { FaLock } from 'react-icons/fa'
import { useSendErrorMessage } from '../others/toolBox'
import Button from './Button'

export default function SkinsButton({
  onClick,
  style,
  className,
  onMouseEnter,
  onContextMenu,
  lockedCondition,
  selected,
  children,
  isArena,
  isBanner,
  isColor
}) {
  const sendErrorMessage = useSendErrorMessage()

  return (
    <Button
      className={`skins-button ${isBanner ? 'skins-button-banner' : ''} ${!lockedCondition && !isColor ? 'disabled' : ''} ${
        selected ? 'selected' : ''
      } ${className}`}
      onClick={() => {
        if (lockedCondition) {
          onClick()
        } else {
          sendErrorMessage('Vous ne possédez pas ce cosmétique.')
        }
      }}
      contextMenu={() => {
        if (lockedCondition) {
          onContextMenu()
        } else {
          sendErrorMessage('Vous ne possédez pas ce cosmétique.')
        }
      }}
      onMouseEnter={() => {
        onMouseEnter()
      }}
      style={style}
    >
      {!lockedCondition && isColor && <FaLock className="btn-icon" />}
      {children}
    </Button>
  )
}
