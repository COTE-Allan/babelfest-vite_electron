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
import cancelSfx from '../../assets/sfx/menu_cancel.flac'
import successSound from '../../assets/sfx/success_bell.mp3'
import useSound from 'use-sound'
import { useLocation } from 'react-router-dom'
import { useTransition } from '../../TransitionContext'

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
  const [cancel] = useSound(cancelSfx, { volume: userSettings.sfxVolume })

  const createLobby = useCreateLobby()
  const joinLobby = useJoinLobby()
  const verName = changelog.slice(-1)[0].title

  const location = useLocation()
  const { goHome } = useTransition()

  const intervalTime = 10000

  useEffect(() => {
    let timer
    let playQueueTimer

    if (matchmakingSearch) {
      playQueue()
      timer = setInterval(() => {
        setSearchTime((prevTime) => prevTime + 1)
      }, 1000)

      playQueueTimer = setInterval(() => {
        if (userSettings.searchPing) {
          playQueue()
        }
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
          joinLobby(data.lobbyFound, false, currentUser.deck) // Passer le deck ici
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
    let matchFound = false
    let prRange = 100
    let mmrRange = 50

    while (!matchFound) {
      let playersQuery

      if (player.mode === 'quick') {
        // Pour le mode rapide, on recherche sur le MMR
        const lowerMMRBound = player.mmr - mmrRange
        const upperMMRBound = player.mmr + mmrRange

        playersQuery = query(
          collection(db, 'matchmaking'),
          where('mmr', '>=', lowerMMRBound),
          where('mmr', '<=', upperMMRBound),
          where('mode', '==', 'quick'),
          where('verName', '==', player.verName)
        )
      } else if (player.mode === 'ranked') {
        // Pour le mode classé, on recherche sur le PR
        const lowerPRBound = player.pr - prRange
        const upperPRBound = player.pr + prRange

        playersQuery = query(
          collection(db, 'matchmaking'),
          where('pr', '>=', lowerPRBound),
          where('pr', '<=', upperPRBound),
          where('mode', '==', 'ranked'),
          where('verName', '==', player.verName)
        )
      }

      const snapshot = await getDocs(playersQuery)

      for (const docSnapshot of snapshot.docs) {
        const potentialMatch = docSnapshot.data()
        if (potentialMatch && potentialMatch.id !== player.id) {
          if (player.mode === 'quick') {
            // On accepte le match directement en mode rapide
            setMatch(potentialMatch)
            matchFound = true
            break
          } else if (player.mode === 'ranked') {
            // En mode classé, on filtre sur le MMR côté code
            const mmrDifference = Math.abs(player.mmr - potentialMatch.mmr)
            if (mmrDifference <= mmrRange) {
              setMatch(potentialMatch)
              matchFound = true
              break
            }
          }
        }
      }

      if (!matchFound) {
        // Augmenter les plages si aucun match n'est trouvé
        if (player.mode === 'quick') {
          mmrRange += 50
        } else if (player.mode === 'ranked') {
          prRange += 300
          mmrRange += 200
        }
        await new Promise((resolve) => setTimeout(resolve, 10000)) // Attendre 10 secondes
      }
    }
  }

  const handleStartMatchmaking = (mode, selectedDeck) => {
    const player = {
      id: user.uid,
      name: userInfo.username,
      mmr: userInfo.stats.mmr || 500,
      pr: userInfo.stats.pr || 0,
      mode: mode,
      verName: verName,
      deck: selectedDeck || null
    }
    setCurrentUser(player)
    setMatchmakingSearch(mode)
  }

  const handleStopMatchmaking = async () => {
    if (currentUser) {
      cancel()
      await deleteDoc(doc(db, 'matchmaking', currentUser.id))
      setCurrentUser(null)
      setMatch(null)
      setMatchmakingSearch(false)

      if (location.pathname.includes('matchmakingQueue')) {
        goHome()
      }
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
            match.id,
            currentUser.deck
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
