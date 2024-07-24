import { collection, doc } from 'firebase/firestore'
import { db } from '../../Firebase'
import { GlobalContext } from '../providers/GlobalProvider'
import { useContext } from 'react'

export function addLogToArrayOfLogs(arrayOfLogs, newLog) {
  newLog.date = Date.now()
  arrayOfLogs.push(newLog)
  return arrayOfLogs
}

export const usePushLogsIntoBatch = () => {
  const { room, playerID } = useContext(GlobalContext)
  async function pushLogsIntoBatch(batch, log, owner = playerID) {
    const historyColl = collection(db, 'games', room, 'logs')
    const ref = doc(historyColl)
    const ts = Date.now()
    batch.set(ref, {
      owner: owner,
      timestamp: ts,
      ...log
    })
  }
  return pushLogsIntoBatch
}

export const usePushSceneIntoBatch = () => {
  const { room } = useContext(GlobalContext)
  async function pushLogsIntoBatch(batch, log) {
    const historyColl = collection(db, 'games', room, 'scenes')
    const ref = doc(historyColl)
    const ts = Date.now()
    batch.set(ref, {
      timestamp: ts,
      playedBy: [],
      ...log
    })
  }
  return pushLogsIntoBatch
}

// owner: integer - userID
// trigger: object - card
// action: string - url icon
// from: string - coordinate,
// to: string - coordinate,
// target: object - card,
// result: object - {icon: url, value: integer}
// desc: string - description
