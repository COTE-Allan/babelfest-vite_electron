import '../../../styles/interface/inGame/turnTracker.scss'
import { useContext } from 'react'
import { SpectatorContext } from '../../providers/SpectatorProvider'

export default function SpecTurnTracker() {
  const { phase, activePlayer, player1Color, player2Color, turn, player1, player2 } =
    useContext(SpectatorContext)
  const phaseLabel = {
    0: "Échange avec l'autre joueur",
    1: 'Phase de préparation',
    2: 'Phase de déplacement',
    3: "Phase d'attaque",
    4: 'Phase de troc'
  }
  return (
    <div
      className="turnTracker"
      style={{
        borderColor:
          phase === 0 ? `transparent` : activePlayer === 1 ? `${player1Color}` : `${player2Color}`
      }}
    >
      <div className="turnTracker-content">
        {phase !== 0 ? (
          <span className="turnTracker-activePlayer">
            {`${activePlayer === 1 ? player1.username : player2.username} est en train de jouer.`}
          </span>
        ) : (
          <span className="turnTracker-activePlayer">La partie va commencer...</span>
        )}
      </div>
      <div
        style={{
          backgroundColor:
            phase === 0 ? `transparent` : activePlayer === 1 ? `${player1Color}` : `${player2Color}`
        }}
        className="turnTracker-phases"
      >
        <span className="turnTracker-turns">TOUR {turn} - </span>
        <span className="turnTracker-phases-label">{phaseLabel[phase]}</span>
      </div>
    </div>
  )
}
