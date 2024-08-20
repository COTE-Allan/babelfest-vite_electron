import { useContext, useEffect } from 'react'
import { GlobalContext } from '../providers/GlobalProvider'
import { useTryEffect } from './EffectsController'
import { db } from '../../Firebase'
import { doc, updateDoc, writeBatch } from 'firebase/firestore'
import { finishStandby, goingStandby } from '../others/standbySystem'
import { removeCardAndBatch } from '../effects/editCards'
import { useEndTurn } from './PhaseController'
import { getPattern } from '../others/toolBox'

export default function DeathController() {
  const { playerID, processDeath, room, phase, pattern, myTurn } = useContext(GlobalContext)
  const tryEffect = useTryEffect()
  let EndTurn = useEndTurn()

  useEffect(() => {
    async function killingCards() {
      let deadCells = pattern.filter((cell) => cell.card && cell.card.dead)

      if (deadCells.length > 0 && processDeath === playerID) {
        // Check for specialDeath at the beginning
        const hasSpecialDeath = deadCells.some((cell) => cell.card.dead.specialDeath)

        await goingStandby(room, playerID === 1 ? 2 : 1, false)
        let continueProcessDeath = true

        while (continueProcessDeath) {
          continueProcessDeath = false
          const batch = writeBatch(db)
          for (const deadCell of deadCells) {
            let killer = pattern.find((cell) => cell.id === deadCell.card.dead.cell)
            let stillDead = await tryEffect('death', undefined, undefined, deadCell, false, killer)
            await tryEffect('cardDeath', undefined, undefined, deadCell, false, killer)
            if (stillDead) {
              removeCardAndBatch(deadCell.id, room, batch)
            }
          }
          await batch.commit()
          let newPattern = await getPattern(room)
          deadCells = newPattern.filter((cell) => cell.card && cell.card.dead)
          if (deadCells.length > 0) {
            continueProcessDeath = true
          }
        }

        await finishStandby(room)
        await updateDoc(doc(db, 'games', room), { processDeath: null })

        // Use the initial hasSpecialDeath value
        if (phase === 3 && !hasSpecialDeath) {
          EndTurn(false)
        }
      }
    }
    killingCards()
  }, [processDeath])

  useEffect(() => {
    async function checkDeath() {
      if (pattern.some((cell) => cell.card && cell.card.dead) && !processDeath && myTurn) {
        await updateDoc(doc(db, 'games', room), { processDeath: playerID })
      }
    }
    checkDeath()
  }, [pattern])
}
