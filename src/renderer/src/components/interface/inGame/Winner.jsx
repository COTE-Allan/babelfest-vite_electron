import { useContext, useEffect, useState } from 'react'
import '../../../styles/interface/inGame/Winner.scss'
import { GlobalContext } from '../../providers/GlobalProvider'
import { doc, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '../../../Firebase'
import Button from '../../items/Button'
import { useCreateGame, useLeaveLobby } from '../../controllers/ManageLobbyAndGame'
import { addExpToPlayer, obtainExp } from '../../others/xpSystem'
import { AuthContext } from '../../../AuthContext'
import ExperienceBar from '../ExperienceBar'
import useSound from 'use-sound'
import levelupSfx from '../../../assets/sfx/level_up.mp3'
import { deleteAllLogs } from '../../others/manageFirestore'

export default function Winner() {
  const {
    winner,
    gameData,
    room,
    host,
    myColor,
    rivalColor,
    playerID,
    playerSelf,
    playerRival,
    turn,
    setSelectedCells,
    setSelectedCards,
    setMovesLeft,
    setPlacementCostLeft,
    setTradeButton
  } = useContext(GlobalContext)
  const { userInfo, user, updateUserState, userSettings } = useContext(AuthContext)
  const [xpGained, setXpGained] = useState(0)
  const [mmrChange, setMmrChange] = useState(0)
  const [levelup] = useSound(levelupSfx, { volume: userSettings.sfxVolume })

  const createGame = useCreateGame()
  const leaveLobby = useLeaveLobby()

  const winnerPlayer = playerID === winner ? playerSelf.username : playerRival.username

  const handleQuit = async () => {
    leaveLobby(gameData.lobbyId, room, gameData.gamemode)
  }

  const requestRevanche = async () => {
    if (gameData.revenge !== null) {
      // Create a batch
      const batch = writeBatch(db)

      // Add delete operations to the batch
      const tradePhaseJ1Ref = doc(db, `games/${room}/tradePhase`, 'forJ1')
      batch.delete(tradePhaseJ1Ref)

      const tradePhaseJ2Ref = doc(db, `games/${room}/tradePhase`, 'forJ2')
      batch.delete(tradePhaseJ2Ref)

      await deleteAllLogs(room, batch)

      // Commit the batch
      await batch.commit()

      createGame(gameData.lobbyId, gameData.player1, gameData.player2, room, gameData.settings)
    } else {
      // Update revenge status
      const gameRef = doc(db, 'games', room)
      await updateDoc(gameRef, {
        revenge: playerID
      })
    }
  }

  const handleExpAndStats = async () => {
    let xpObtained = 0
    let gameWon = winner === playerID

    if (turn === 1) {
      xpObtained = 10
    } else {
      xpObtained = obtainExp(turn, gameWon, gameData.gamemode)
    }

    setXpGained(xpObtained)

    // Update player experience
    let newPlayerExp = addExpToPlayer(userInfo.level, userInfo.xp, xpObtained)

    // Prepare to update stats
    const gameMode = gameData.gamemode // Get the current game mode
    let gamesPlayedUpdate = {} // Object to hold the updated games played counters
    gamesPlayedUpdate[`stats.gamesPlayed.${gameMode}`] =
      (userInfo.stats?.gamesPlayed?.[gameMode] || 0) + 1 // Increment the specific game mode counter

    let newVictories = gameWon
      ? (userInfo.stats?.victories || 0) + 1
      : userInfo.stats?.victories || 0

    // Check MMR value
    let currentMMR = 500 // Default MMR
    if (userInfo.stats?.mmr !== 'NaN' && userInfo.stats?.mmr !== undefined) {
      currentMMR = userInfo.stats.mmr
    }

    // Handle win streak
    let currentStreak = userInfo.stats?.winStreak || 0
    let longestStreak = userInfo.stats?.longestWinStreak || 0
    let mmrChangeValue = 15 // Base MMR change
    let newMMR = currentMMR

    if (gameMode !== 'custom') {
      if (gameWon) {
        currentStreak += 1
        mmrChangeValue += currentStreak * 2
        if (mmrChangeValue > 30) {
          mmrChangeValue = 30
        }
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak
        }
      } else {
        currentStreak = 0 // Reset win streak on loss
        mmrChangeValue = -15 // Decrease MMR
      }

      newMMR = Math.max(0, currentMMR + mmrChangeValue) // Ensure MMR does not go below 0
    }

    setMmrChange(mmrChangeValue)

    // Update the user in the database
    await updateDoc(doc(db, 'users', user.uid), {
      level: newPlayerExp.level,
      xp: newPlayerExp.xp,
      'stats.mmr': newMMR,
      'stats.winStreak': currentStreak,
      'stats.longestWinStreak': longestStreak,
      ...gamesPlayedUpdate, // Spread the updated games played counters
      'stats.victories': newVictories
    })

    setTimeout(() => {
      updateUserState(user)
      levelup()
    }, 1000)
  }

  useEffect(() => {
    if (winner !== null) {
      setSelectedCells([])
      setSelectedCards([])
      setMovesLeft(4)
      setPlacementCostLeft(4)
      setTradeButton(true)

      handleExpAndStats()
    } else {
      setXpGained(0)
      setMmrChange(0)
    }
  }, [winner])

  if (winner !== null) {
    return (
      <div
        className={`winner`}
        style={{
          backgroundColor:
            winner == 1 && host ? myColor : winner == 2 && !host ? myColor : rivalColor
        }}
      >
        <h1>{playerID === winner ? 'Vous avez gagné !' : 'Vous avez perdu...'}</h1>
        <div style={{ marginTop: 10 }}>
          <div className="xp-bar_container">
            <h2>XP gagnée : {xpGained}</h2>
            {gameData.gamemode !== 'custom' && (
              <h2>
                MMR {mmrChange > 0 ? 'gagné' : 'perdu'} : {mmrChange}
              </h2>
            )}
            <ExperienceBar />
          </div>
          {gameData.revenge !== 'quit' && (
            <Button
              className={`ingame-button ${
                gameData.revenge !== playerID && gameData.revenge !== null ? 'alert' : ''
              }`}
              onClick={async () => {
                if (gameData.revenge !== playerID) {
                  requestRevanche()
                }
              }}
            >
              {gameData.revenge === playerID
                ? "En attente de l'autre joueur..."
                : gameData.revenge !== null
                  ? 'Accepter la revanche !'
                  : 'Demander une revanche'}
            </Button>
          )}

          <Button className="ingame-button" onClick={handleQuit}>
            Retour au menu
          </Button>
        </div>
      </div>
    )
  }

  return null
}
