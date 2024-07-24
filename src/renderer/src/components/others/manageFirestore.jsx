import { collection, query, getDocs } from 'firebase/firestore'
import { db } from '../../Firebase'

export const deleteAllLogs = async (room, batch) => {
  const logsRef = collection(db, `games/${room}/logs`)

  // Obtenir tous les documents de la collection 'logs'
  const snapshot = await getDocs(query(logsRef))

  // Ajouter chaque document à un batch de suppression
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref)
  })
}
