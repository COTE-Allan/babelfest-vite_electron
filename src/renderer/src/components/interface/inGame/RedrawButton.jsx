import { useContext, useState } from 'react'
import { GlobalContext } from '../../providers/GlobalProvider'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../../Firebase'
import IconButton from '../../items/iconButton'
import { VscDebugRestart } from 'react-icons/vsc'
import { drawHandWithRarityConstraint } from '../../effects/editCards'

export default function RedrawButton() {
  const { room, playerID, gameData, deck, setSelectedCards, setPlayerSelf, playerSelf } =
    useContext(GlobalContext)
  const [redrawUsed, setRedrawUsed] = useState(false)

  const executeRedraw = async () => {
    try {
      const clonedDeck = [...deck]
      const newHand = await drawHandWithRarityConstraint(clonedDeck, gameData.settings.cards)
      setSelectedCards([])

      console.log('Avant redraw, main du joueur:', playerSelf.hand)
      console.log('Nouvelle main après redraw:', newHand)

      const handKey = playerID === 1 ? 'handJ1' : 'handJ2'

      await updateDoc(doc(db, 'games', room), {
        [handKey]: newHand,
        deck: clonedDeck
      })

      // Mettre à jour l'état local
      setPlayerSelf((prevState) => ({
        ...prevState,
        hand: newHand
      }))

      console.log("Après mise à jour, nouvelle main dans l'état local:", newHand)

      // setRedrawUsed(true)
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
