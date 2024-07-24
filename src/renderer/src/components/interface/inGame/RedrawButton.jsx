import { useContext } from 'react'
import { GlobalContext } from '../../providers/GlobalProvider'
import { doc, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '../../../Firebase'
import { PopulateDeck } from '../../controllers/ManageLobbyAndGame'
import IconButton from '../../items/iconButton'
import { VscDebugRestart } from 'react-icons/vsc'

export default function RedrawButton() {
  const { room, playerID, gameData, setSelectedCards } = useContext(GlobalContext)
  const requestRedraw = async () => {
    if (gameData.redraw && gameData.redraw !== null) {
      const batch = writeBatch(db)
      // =====
      const tradePhaseJ1Ref = doc(db, `games/${room}/tradePhase`, 'forJ1')
      batch.delete(tradePhaseJ1Ref)
      // =====
      const tradePhaseJ2Ref = doc(db, `games/${room}/tradePhase`, 'forJ2')
      batch.delete(tradePhaseJ2Ref)
      // =====
      const gameRef = doc(db, 'games', room)
      batch.update(gameRef, {
        redraw: null
      })
      // =====
      await batch.commit()
      // =====
      PopulateDeck(room, gameData.settings.cards)
      setSelectedCards([])
    } else {
      // Mettre à jour le statut de redraw
      const gameRef = doc(db, 'games', room)
      await updateDoc(gameRef, {
        redraw: playerID
      })
      setSelectedCards([])
    }
  }

  return (
    <IconButton
      className={`footer-button ${
        gameData.redraw && gameData.redraw === playerID && 'disabled'
      } ${gameData.redraw && gameData.redraw !== playerID ? 'alert' : ''}`}
      onClick={() => {
        if (!gameData.redraw || gameData.redraw !== playerID) {
          requestRedraw()
        }
      }}
    >
      <span>
        {gameData.redraw && gameData.redraw !== null
          ? gameData.redraw === playerID
            ? 'En attente...'
            : 'Repiocher les cartes'
          : 'Demander à repiocher'}
      </span>
      <VscDebugRestart size={45} />
    </IconButton>
  )
}
