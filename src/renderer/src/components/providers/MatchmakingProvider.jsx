import React, { useState, useEffect, useContext, createContext } from 'react'
import { db } from '../../Firebase'
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore'
import { AuthContext } from '../../AuthContext'
import { useCreateLobby, useJoinLobby } from '../controllers/ManageLobbyAndGame'
import changelog from '../../jsons/changelog.json'
import queueSound from '../../assets/sfx/queue_tick.mp3'
import successSound from '../../assets/sfx/success_bell.mp3'
import useSound from 'use-sound'

export const MatchmakingContext = createContext()

export const MatchmakingProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [match, setMatch] = useState(null)
  const [matchmakingSearch, setMatchmakingSearch] = useState(false)
  const [searchTime, setSearchTime] = useState(0)
  const { userInfo, user, userSettings } = useContext(AuthContext)
  const [playQueue] = useSound(queueSound, { volume: userSettings.sfxVolume })
  const [successQueue] = useSound(successSound, {
    volume: userSettings.sfxVolume
  })

  const createLobby = useCreateLobby()
  const joinLobby = useJoinLobby()
  const verName = changelog.slice(-1)[0].title

  const intervalTime = 4000

  useEffect(() => {
    let timer
    let playQueueTimer

    if (matchmakingSearch) {
      playQueue()
      timer = setInterval(() => {
        setSearchTime((prevTime) => prevTime + 1)
      }, 1000)

      playQueueTimer = setInterval(() => {
        playQueue()
      }, intervalTime)
    } else {
      setSearchTime(0)
    }

    return () => {
      clearInterval(timer)
      clearInterval(playQueueTimer)
    }
  }, [matchmakingSearch])

  useEffect(() => {
    const handleSnapshot = async (snapshot) => {
      const data = snapshot.data()
      if (data && data.lobbyFound) {
        await deleteDoc(doc(db, 'matchmaking', user.uid))
        successQueue()
        setTimeout(() => {
          joinLobby(data.lobbyFound)
        }, 1000)
      }
    }

    if (currentUser) {
      const playerDocRef = doc(db, 'matchmaking', currentUser.id)
      setDoc(playerDocRef, { ...currentUser, timeWaiting: new Date() })
      const unsubscribe = onSnapshot(playerDocRef, (snapshot) => {
        handleSnapshot(snapshot)
      })
      findMatch(currentUser)
      return () => unsubscribe()
    }
  }, [currentUser])

  const findMatch = async (player) => {
    let match = null
    let mmrRange = 50
    let rankRange = 3

    while (!match) {
      const lowerMMRBound = player.mmr - mmrRange
      const upperMMRBound = player.mmr + mmrRange
      const lowerRankBound = player.rank - rankRange
      const upperRankBound = player.rank + rankRange

      let playersQuery

      if (player.mode === 'quick') {
        playersQuery = query(
          collection(db, 'matchmaking'),
          where('mmr', '>=', lowerMMRBound),
          where('mmr', '<=', upperMMRBound),
          where('mode', '==', 'quick')
        )
      } else if (player.mode === 'ranked') {
        playersQuery = query(
          collection(db, 'matchmaking'),
          where('mmr', '>=', lowerMMRBound),
          where('mmr', '<=', upperMMRBound),
          where('rank', '>=', lowerRankBound),
          where('rank', '<=', upperRankBound),
          where('mode', '==', 'ranked')
        )
      }

      const snapshot = await getDocs(playersQuery)

      for (const docSnapshot of snapshot.docs) {
        const potentialMatch = docSnapshot.data()
        if (potentialMatch && potentialMatch.id !== player.id) {
          setMatch(potentialMatch)
          return
        }
      }

      if (!match) {
        mmrRange *= 2
        if (player.mode === 'ranked') {
          rankRange += 2
        }
        await new Promise((resolve) => setTimeout(resolve, 10000)) // Attendre 10 secondes
      }
    }
  }

  const handleStartMatchmaking = (mode) => {
    const player = {
      id: user.uid,
      name: userInfo.username,
      mmr: userInfo.stats.mmr,
      rank: 1,
      mode: mode
    }
    setCurrentUser(player)
    setMatchmakingSearch(mode)
  }

  const handleStopMatchmaking = async () => {
    if (currentUser) {
      await deleteDoc(doc(db, 'matchmaking', currentUser.id))
      setCurrentUser(null)
      setMatch(null)
      setMatchmakingSearch(false)
    }
  }

  useEffect(() => {
    const startMatch = async () => {
      if (match) {
        await deleteDoc(doc(db, 'matchmaking', user.uid))
        successQueue()
        setTimeout(async () => {
          await createLobby(
            {
              version: verName,
              gamemode: match.mode
            },
            match.id
          )
        }, 1000)
      }
    }
    startMatch()
  }, [match])

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = timeInSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const contextValue = {
    handleStartMatchmaking,
    handleStopMatchmaking,
    matchmakingSearch,
    searchTime: formatTime(searchTime)
  }

  return <MatchmakingContext.Provider value={contextValue}>{children}</MatchmakingContext.Provider>
}
