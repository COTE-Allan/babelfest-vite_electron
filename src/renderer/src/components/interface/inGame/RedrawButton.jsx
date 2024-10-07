import { useContext, useEffect, useState } from 'react'
import { GlobalContext } from '../../providers/GlobalProvider'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../../Firebase'
import IconButton from '../../items/iconButton'
import { VscDebugRestart } from 'react-icons/vsc'
import { generateDeck } from '../../effects/editCards'

export default function RedrawButton() {
  const { room, playerID, gameData, setSelectedCards, setPlayerSelf, playerSelf, winner } =
    useContext(GlobalContext)
  const [redrawUsed, setRedrawUsed] = useState(false)

  useEffect(() => {
    if (winner !== null) {
      setRedrawUsed(false)
    }
  }, [winner])

  const executeRedraw = async () => {
    try {
      // Generate a new deck via drawDeck
      const newDeck = generateDeck(gameData.settings.cards)

      setSelectedCards([])

      console.log('Avant redraw, main du joueur:', playerSelf.hand)
      console.log('Nouveau deck après redraw:', newDeck)

      const handKey = playerID === 1 ? 'handJ1' : 'handJ2'

      await updateDoc(doc(db, 'games', room), {
        [handKey]: newDeck
        // No need to update the deck in the database
      })

      // Update the local state
      setPlayerSelf((prevState) => ({
        ...prevState,
        hand: newDeck
        // If you maintain deck in state, update it here
        // deck: newDeck
      }))

      console.log("Après mise à jour, nouvelle main dans l'état local:", newDeck)

      setRedrawUsed(true)
    } catch (error) {
      console.error('Error in executeRedraw:', error)
    }
  }

  if (redrawUsed) return null
  return (
    <IconButton className="footer-button" onClick={executeRedraw}>
      <span>
        {gameData.redraw && gameData.redraw !== null
          ? gameData.redraw === playerID
            ? 'En attente...'
            : 'Repiocher les cartes'
          : 'Faire un mulligan'}
      </span>
      <VscDebugRestart size={45} />
    </IconButton>
  )
}
