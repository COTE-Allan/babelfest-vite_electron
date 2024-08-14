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
import useCheckForAchievements from '../../controllers/AchievementsController'

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
  const checkForAchievements = useCheckForAchievements()

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
    const gameMode = gameData.gamemode
    let gamesPlayedUpdate = {}
    gamesPlayedUpdate[`stats.gamesPlayed.${gameMode}`] =
      (userInfo.stats?.gamesPlayed?.[gameMode] || 0) + 1

    let newVictories = gameWon
      ? (userInfo.stats?.victories || 0) + 1
      : userInfo.stats?.victories || 0

    // Check MMR value
    let currentMMR = 500
    if (playerSelf.stats?.mmr !== 'NaN' && playerSelf.stats?.mmr !== undefined) {
      currentMMR = playerSelf.stats.mmr
    }

    // Get opponent's MMR
    const opponentMMR = playerRival.stats.mmr

    // Calculate MMR difference
    const mmrDifference = opponentMMR - currentMMR
    console.log(opponentMMR, currentMMR, mmrDifference)

    // Handle win streak and MMR only for non-custom game modes
    let currentStreak = userInfo.stats?.winStreak || 0
    let longestStreak = userInfo.stats?.longestWinStreak || 0
    let mmrChangeValue = 0
    let newMMR = currentMMR

    if (gameMode !== 'custom') {
      const baseMMRChange = 15;
      const maxMMRChange = 100;
      const minMMRChange = 5;
      // Factor for scaling the MMR change based on the difference in MMR
      const scalingFactor = Math.abs(mmrDifference) / 100; // Adjusted for more gradual scaling
    
      if (gameWon) {
        if (mmrDifference < 0) {
          // Won against a lower-rated player
          mmrChangeValue = baseMMRChange - scalingFactor * 10;
          mmrChangeValue = Math.max(minMMRChange, mmrChangeValue);  // Ensure it's at least the minimum
        } else {
          // Won against a higher-rated player
          console.log(mmrChangeValue, mmrDifference, scalingFactor) 
          mmrChangeValue = baseMMRChange + scalingFactor * 10;
          mmrChangeValue = Math.min(mmrChangeValue, maxMMRChange); // Cap the gain
        }
      } else {
        if (mmrDifference < 0) {
          // Lost to a lower-rated player
          mmrChangeValue = -(baseMMRChange + scalingFactor * 20);
          mmrChangeValue = Math.min(mmrChangeValue, -minMMRChange); // Ensure loss is at least the minimum
        } else {
          // Lost to a higher-rated player
          mmrChangeValue = -(baseMMRChange - scalingFactor * 5);
          mmrChangeValue = Math.max(mmrChangeValue, -maxMMRChange); // Cap the loss
        }
      }
      mmrChangeValue = Math.min(maxMMRChange, Math.max(-maxMMRChange, mmrChangeValue));
    
      mmrChangeValue = Math.round(mmrChangeValue);
      newMMR = Math.max(0, currentMMR + mmrChangeValue); // Ensure MMR does not go below 0
    }
    
    
    setMmrChange(mmrChangeValue)

    // Update the user in the database
    await updateDoc(doc(db, 'users', user.uid), {
      level: newPlayerExp.level,
      xp: newPlayerExp.xp,
      'stats.mmr': newMMR,
      'stats.winStreak': currentStreak,
      'stats.longestWinStreak': longestStreak,
      ...gamesPlayedUpdate,
      'stats.victories': newVictories
    })

    // Créer l'objet résumé du match
    const matchSummary = {
      player: {
        id: playerSelf.id,
        username: playerSelf.username,
        primaryColor: playerSelf.primaryColor,
        profilePic: playerSelf.profilePic,
        profileBorder: playerSelf.profileBorder,
        title: playerSelf.title,
        level: playerSelf.level,
        xpGained: xpObtained,
        previousMMR: currentMMR,
        newMMR: newMMR,
        gameWon: gameWon
      },
      opponent: {
        id: playerRival.id,
        username: playerRival.username,
        primaryColor: playerRival.primaryColor,
        profilePic: playerRival.profilePic,
        profileBorder: playerRival.profileBorder,
        title: playerRival.title,
        level: playerRival.level,
        previousMMR: playerRival.stats.mmr,
        mmrDifference: mmrDifference
      },
      gameDetails: {
        mode: gameData.gamemode,
        turnCount: turn,
        timestamp: new Date().toISOString(),
        result: gameWon ? 'victory' : 'defeat'
      }
    }

    // Log l'objet résumé du match
    console.log('Match Summary:', matchSummary)

    setTimeout(async () => {
      await updateUserState(user)
      levelup()
    }, 1000)
  }

  useEffect(() => {
    if (winner !== null) {
      console.log('checking')

      checkForAchievements(gameData, winner === playerID)
    }
  }, [userInfo])

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
