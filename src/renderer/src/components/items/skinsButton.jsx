import { FaLock } from 'react-icons/fa'
import { useSendMessage } from '../others/toolBox'
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
  isSquare,
  isColor
}) {
  const sendMessage = useSendMessage()

  return (
    <Button
      className={`skins-button ${isBanner ? 'skins-button-banner' : ''} ${isSquare ? 'skins-button-square' : ''} ${!lockedCondition && !isColor ? 'disabled' : ''} ${
        selected ? 'selected' : ''
      } ${className ? className : ''}`}
      onClick={() => {
        if (lockedCondition) {
          onClick()
        } else {
          sendMessage('Vous ne possédez pas ce cosmétique.')
        }
      }}
      contextMenu={() => {
        if (lockedCondition) {
          onContextMenu()
        } else {
          sendMessage('Vous ne possédez pas ce cosmétique.')
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
