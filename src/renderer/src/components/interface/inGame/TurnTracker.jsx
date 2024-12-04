import '../../../styles/interface/inGame/turnTracker.scss'
import { GlobalContext } from '../../providers/GlobalProvider'
import { useContext, useState } from 'react'
import { getBackgroundStyle } from '../../others/toolBox'

export default function TurnTracker() {
  const {
    myTurn,
    phase,
    firstToPlay,
    playerID,
    myColor,
    rivalColor,
    turn,
    isSpectator,
    playerSelf,
    playerRival
  } = useContext(GlobalContext)

  const [isOpen, setIsOpen] = useState(false)

  const phaseLabel = {
    0: "Échange avec l'autre joueur",
    1: 'Phase de préparation',
    2: 'Phase de déplacement',
    3: "Phase d'attaque",
    4: 'Phase de troc'
  }

  // Définir le nom du joueur dont c'est le tour
  const currentPlayerName = myTurn
    ? playerSelf?.username || 'Joueur 1'
    : playerRival?.username || 'Joueur 2'

  // Gestionnaire pour alterner la classe 'open'
  const toggleOpen = () => {
    setIsOpen((prev) => !prev)
  }

  return (
    <div className={`turnTracker ${isOpen ? 'open' : ''}`} onClick={toggleOpen}>
      <div className="turnTracker-content">
        <span className="turnTracker-activePlayer">
          {isSpectator
            ? `Au tour de ${currentPlayerName}.`
            : myTurn
              ? 'À vous de jouer.'
              : 'Votre adversaire joue.'}
        </span>

        <span className="turnTracker-order">
          {!isSpectator
            ? firstToPlay === playerID
              ? 'Vous jouez en premier.'
              : 'Vous jouez en second.'
            : firstToPlay === playerID
              ? `${playerSelf?.username} joue en premier.`
              : `${playerSelf?.username} joue en second.`}
        </span>
      </div>
      <div
        style={{
          background: myTurn
            ? getBackgroundStyle(myColor, 'to right')
            : getBackgroundStyle(rivalColor, 'to right')
        }}
        className="turnTracker-phases"
      >
        <span className="turnTracker-turns">TOUR {turn} - </span>
        <span className="turnTracker-phases-label">{phaseLabel[phase]}</span>
      </div>
    </div>
  )
}
