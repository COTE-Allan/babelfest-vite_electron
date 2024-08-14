import { useContext, useState } from 'react'
import { GlobalContext } from '../../providers/GlobalProvider'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../../Firebase'
import IconButton from '../../items/iconButton'
import { VscDebugRestart } from 'react-icons/vsc'
import { drawHandWithRarityConstraint } from '../../effects/editCards'

export default function RedrawButton() {
  const { room, playerID, gameData, deck, setSelectedCards } = useContext(GlobalContext)
  const [redrawUsed, setRedrawUsed] = useState(false)
  const executeRedraw = async () => {
    try {
      // Clone le deck pour éviter de modifier l'original
      const clonedDeck = [...deck]

      // Utilise le deck cloné pour tirer une nouvelle main
      const newHand = await drawHandWithRarityConstraint(clonedDeck, gameData.settings.cards)

      setSelectedCards([])

      const handKey = playerID === 1 ? 'handJ1' : 'handJ2'

      // Met à jour le document Firestore avec la nouvelle main et le deck modifié
      await updateDoc(doc(db, 'games', room), {
        [handKey]: newHand,
        deck: clonedDeck
      })
      setRedrawUsed(true)
    } catch (error) {
      console.error('Error in executeRedraw:', error)
    }
  }

  if (redrawUsed) return
  return (
    <IconButton className={`footer-button`} onClick={() => executeRedraw()}>
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
