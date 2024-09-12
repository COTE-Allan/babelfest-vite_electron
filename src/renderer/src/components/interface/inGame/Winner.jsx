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
import endingSfx from '../../../assets/sfx/match_end.mp3'
import { deleteAllLogs } from '../../others/manageFirestore'
import useCheckForAchievements from '../../controllers/AchievementsController'

export default function Winner() {
  const {
    winner,
    gameData,
    room,
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
  const [xpDetails, setXpDetails] = useState([])
  const [handleWin, setHandleWin] = useState(null)
  const [levelup] = useSound(levelupSfx, { volume: userSettings.sfxVolume })
  const [ending] = useSound(endingSfx, { volume: userSettings.sfxVolume })

  const createGame = useCreateGame()
  const leaveLobby = useLeaveLobby()
  const checkForAchievements = useCheckForAchievements()

  useEffect(() => {
    if (winner !== null) {
      ending()
      setTimeout(() => {
        setHandleWin(true)
      }, 1000)
    } else {
      setHandleWin(null)
    }
  }, [winner])

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

      setHandleWin(null)
      createGame(gameData.lobbyId, gameData.player1, gameData.player2, room, gameData.settings)
    } else {
      // Update revenge status
      const gameRef = doc(db, 'games', room)
      await updateDoc(gameRef, {
        revenge: { state: 'want', id: playerID }
      })
    }
  }

  const handleExpAndStats = async () => {
    let gameWon = winner === playerID
    let newXpDetails = []

    // Vérifie si c'est la première partie de la journée
    const today = new Date().setHours(0, 0, 0, 0)
    const matchSummaries = userInfo.matchSummaries || []

    // Filtre les parties du jour
    const gamesToday = matchSummaries.filter((match) => {
      const matchDate = new Date(match.gameDetails.timestamp).setHours(0, 0, 0, 0)
      return matchDate === today
    })

    // Vérifie si toutes les parties du jour sont des "lots de consolation" (tour 1 uniquement)
    const allGamesConsolation = gamesToday.every((game) => game.gameDetails.turnCount === 1)
    console.log(allGamesConsolation, gamesToday)

    // Définit isFirstGameOfDay et isFirstWinOfDay selon les parties précédentes
    const isFirstGameOfDay = allGamesConsolation || gamesToday.length === 0
    const isFirstWinOfDay =
      gameWon &&
      (allGamesConsolation || gamesToday.every((game) => game.gameDetails.result !== 'victory'))

    // Utilisation de la fonction obtainExp qui gère l'ajout aux détails d'XP
    const xpObtained = obtainExp(
      turn,
      gameWon,
      gameData.gamemode,
      isFirstGameOfDay,
      isFirstWinOfDay,
      newXpDetails,
      gameWon ? userInfo.stats?.winStreak + 1 : false
    )

    setXpGained(xpObtained)

    // Mettre à jour l'expérience du joueur
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

    // Handle win streak and MMR only for non-custom game modes
    let currentStreak = userInfo.stats?.winStreak || 0
    let longestStreak = userInfo.stats?.longestWinStreak || 0
    let mmrChangeValue = 0
    let newMMR = currentMMR

    if (gameWon) {
      if (turn !== 1) {
        currentStreak += 1
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak
        }
      } else {
        newXpDetails.push('Votre série de victoire reste inchangée.')
      }
    } else {
      currentStreak = 0
    }

    setXpDetails(newXpDetails)

    if (gameMode !== 'custom') {
      const baseMMRChange = 15
      const maxMMRChange = 100
      const minMMRChange = 5
      const scalingFactor = Math.abs(mmrDifference) / 100

      if (gameWon) {
        if (mmrDifference < 0) {
          mmrChangeValue = baseMMRChange - scalingFactor * 10
          mmrChangeValue = Math.max(minMMRChange, mmrChangeValue)
        } else {
          mmrChangeValue = baseMMRChange + scalingFactor * 10
          mmrChangeValue = Math.min(mmrChangeValue, maxMMRChange)
        }
      } else {
        if (mmrDifference < 0) {
          mmrChangeValue = -(baseMMRChange + scalingFactor * 20)
          mmrChangeValue = Math.min(mmrChangeValue, -minMMRChange)
        } else {
          mmrChangeValue = -(baseMMRChange - scalingFactor * 5)
          mmrChangeValue = Math.max(mmrChangeValue, -maxMMRChange)
        }
      }
      mmrChangeValue = Math.min(maxMMRChange, Math.max(-maxMMRChange, mmrChangeValue))
      mmrChangeValue = Math.round(mmrChangeValue)
      newMMR = Math.max(0, currentMMR + mmrChangeValue)
    }

    setMmrChange(mmrChangeValue)

    function cleanObject(obj) {
      const cleanedObj = {} // Crée un nouvel objet vide

      for (const key in obj) {
        // Parcourt toutes les clés de l'objet
        if (obj.hasOwnProperty(key)) {
          // Vérifie si la clé existe dans l'objet
          cleanedObj[key] = obj[key] !== undefined ? obj[key] : null // Si la valeur est undefined, remplace par null
        }
      }

      return cleanedObj // Retourne l'objet nettoyé
    }

    const matchSummary = {
      player: cleanObject({
        id: playerSelf.id,
        username: playerSelf.username,
        primaryColor: playerSelf.primaryColor,
        profilePic: playerSelf.profilePic,
        profileBorder: playerSelf.profileBorder,
        title: playerSelf.title,
        prestige: playerSelf.prestige,
        level: playerSelf.level,
        xpGained: xpObtained,
        mmrGained: mmrChangeValue,
        gameWon: gameWon
      }),
      opponent: cleanObject({
        id: playerRival.id,
        username: playerRival.username,
        primaryColor: playerRival.primaryColor,
        profilePic: playerRival.profilePic,
        profileBorder: playerRival.profileBorder,
        banner: playerRival.banner,
        prestige: playerRival.prestige,
        title: playerRival.title,
        level: playerRival.level,
        previousMMR: playerRival.stats.mmr,
        mmrDifference: mmrDifference
      }),
      gameDetails: {
        mode: gameData.gamemode,
        turnCount: turn,
        timestamp: new Date().toISOString(),
        result: gameWon ? 'victory' : 'defeat'
      }
    }

    let updatedMatchSummaries = userInfo.matchSummaries ? [...userInfo.matchSummaries] : []
    updatedMatchSummaries.push(matchSummary)
    if (updatedMatchSummaries.length >= 9) {
      updatedMatchSummaries = updatedMatchSummaries.slice(-9)
    }

    await updateDoc(doc(db, 'users', user.uid), {
      level: newPlayerExp.level,
      xp: newPlayerExp.xp,
      'stats.mmr': newMMR,
      'stats.winStreak': currentStreak,
      'stats.longestWinStreak': longestStreak,
      ...gamesPlayedUpdate,
      'stats.victories': newVictories,
      matchSummaries: updatedMatchSummaries
    })

    // console.log('Match Summary:', matchSummary)

    setTimeout(async () => {
      await updateUserState(user)
      levelup()
    }, 1000)
  }

  useEffect(() => {
    if (handleWin !== null) {
      checkForAchievements(gameData, winner === playerID)
    }
  }, [userInfo])

  useEffect(() => {
    if (handleWin !== null) {
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
  }, [handleWin])

  if (handleWin !== null) {
    return (
      <div className={`winner`}>
        <h1>{playerID === winner ? 'Vous avez gagné !' : 'Vous avez perdu...'}</h1>
        <div style={{ marginTop: 10 }}>
          <div className="xp-bar_container">
            <h2>XP gagnée : {xpGained}</h2>
            {xpDetails.length > 0 && (
              <ul className="winner-details">
                {xpDetails.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            )}
            {gameData.gamemode !== 'custom' && (
              <h2>
                MMR {mmrChange > 0 ? 'gagné' : 'perdu'} : {mmrChange}
              </h2>
            )}
            <ExperienceBar />
          </div>
          {gameData.revenge?.state !== 'quit' && (
            <Button
              className={`ingame-button ${
                gameData.revenge?.id !== playerID && gameData.revenge !== null ? 'alert' : ''
              }`}
              onClick={async () => {
                if (gameData.revenge?.id !== playerID) {
                  requestRevanche()
                }
              }}
            >
              {gameData.revenge?.id === playerID
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
