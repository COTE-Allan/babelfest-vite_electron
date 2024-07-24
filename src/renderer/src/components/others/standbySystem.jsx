import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../Firebase'

export async function goingStandby(room, playerID, phaseStandby = true) {
  const gameRef = doc(db, 'games', room)
  // Mettre à jour Firestore
  await updateDoc(gameRef, { standby: [playerID, phaseStandby] })
}

export async function finishStandby(room) {
  const gameRef = doc(db, 'games', room)
  // Mettre à jour Firestore
  await updateDoc(gameRef, { standby: false })
}
