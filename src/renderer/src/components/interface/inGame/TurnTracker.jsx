import ProfilePicture from '../../esthetics/profilePicture'
import '../../../styles/interface/inGame/turnTracker.scss'
import { GlobalContext } from '../../providers/GlobalProvider'
import { useContext } from 'react'

export default function TurnTracker() {
  const { myTurn, phase, firstToPlay, playerID, myColor, rivalColor, turn } =
    useContext(GlobalContext)
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
        borderColor: phase === 0 ? `transparent` : myTurn ? `${myColor}` : `${rivalColor}`
      }}
    >
      <div className="turnTracker-content">
        <span className="turnTracker-activePlayer">
          {myTurn || phase === 0 ? 'À vous de jouer.' : 'Votre adversaire joue.'}
        </span>

        <span className="turnTracker-order">
          {firstToPlay === playerID ? 'Vous jouez en premier.' : 'Vous jouez en second.'}
        </span>
      </div>
      <div
        style={{
          backgroundColor: phase === 0 ? `transparent` : myTurn ? `${myColor}` : `${rivalColor}`
        }}
        className="turnTracker-phases"
      >
        <span className="turnTracker-turns">TOUR {turn} - </span>
        <span className="turnTracker-phases-label">{phaseLabel[phase]}</span>
      </div>
    </div>
  )
}
