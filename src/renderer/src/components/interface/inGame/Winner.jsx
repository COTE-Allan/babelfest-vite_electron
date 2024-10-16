import { useContext, useEffect, useState } from 'react'
import '../../../styles/interface/inGame/Winner.scss'
import { GlobalContext } from '../../providers/GlobalProvider'
import { doc, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '../../../Firebase'
import Button from '../../items/Button'
import { useCreateGame, useLeaveLobby } from '../../controllers/ManageLobbyAndGame'
import {
  addExpToPlayer,
  calculateMMRChange,
  calculatePRChange,
  getRankProgress,
  obtainExp
} from '../../others/xpSystem'
import { AuthContext } from '../../../AuthContext'
import ExperienceBar from '../ExperienceBar'
import useSound from 'use-sound'
import levelupSfx from '../../../assets/sfx/level_up.mp3'
import endingSfx from '../../../assets/sfx/match_end.mp3'
import { deleteAllLogs } from '../../others/manageFirestore'
import useCheckForAchievements from '../../controllers/AchievementsController'
import { useNavigate } from 'react-router-dom'
import RankProgressBar from '../RankBar'

export default function Winner() {
  const {
    winner,
    gameData,
    room,
    host,
    playerID,
    playerSelf,
    playerRival,
    turn,
    setSelectedCells,
    setSelectedCards,
    setTradeButton,
    pattern,
    setRightWindow,
    setLeftWindow,
    isSpectator
  } = useContext(GlobalContext)
  const { userInfo, user, updateUserState, userSettings, giveAchievement } = useContext(AuthContext)
  const [xpGained, setXpGained] = useState(0)
  const [mmrChange, setMmrChange] = useState(0)
  const [xpDetails, setXpDetails] = useState([])
  const [prChange, setPrChange] = useState(0)
  const [newRank, setNewRank] = useState('')
  const [handleWin, setHandleWin] = useState(null)
  const [levelup] = useSound(levelupSfx, { volume: userSettings.sfxVolume })
  const [ending] = useSound(endingSfx, { volume: userSettings.sfxVolume })
  const navigate = useNavigate()
  const createGame = useCreateGame()
  const leaveLobby = useLeaveLobby()
  const checkForAchievements = useCheckForAchievements()

  useEffect(() => {
    let timeoutId
    if (winner !== null) {
      ending()
      timeoutId = setTimeout(() => {
        setHandleWin(true)
      }, 1000)
    } else {
      setHandleWin(null)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [winner])

  // Déterminer le nom du joueur gagnant
  const winnerPlayer = winner === playerID ? playerSelf.username : playerRival.username

  const handleQuit = async () => {
    if (isSpectator) {
      navigate('/lobbyList')
    } else {
      leaveLobby(gameData.lobbyId, room, gameData.gamemode)
    }
  }

  const requestRevanche = async () => {
    if (gameData.revenge !== null) {
      // Créer un batch pour les opérations Firestore
      const batch = writeBatch(db)

      // Ajouter les opérations de suppression au batch
      const tradePhaseJ1Ref = doc(db, `games/${room}/tradePhase`, 'forJ1')
      batch.delete(tradePhaseJ1Ref)

      const tradePhaseJ2Ref = doc(db, `games/${room}/tradePhase`, 'forJ2')
      batch.delete(tradePhaseJ2Ref)

      await deleteAllLogs(room, batch)

      // Valider le batch
      await batch.commit()

      setHandleWin(null)
      createGame(
        gameData.lobbyId,
        gameData.player1,
        gameData.player2,
        room,
        gameData.settings,
        gameData.gameMode,
        gameData.deckJ1,
        gameData.deckJ2,
        gameData.deckType
      )
    } else {
      // Mettre à jour le statut de revanche
      const gameRef = doc(db, 'games', room)
      await updateDoc(gameRef, {
        revenge: { state: 'want', id: playerID }
      })
    }
  }

  const handleExpAndStats = async () => {
    if (!isSpectator && !playerSelf.receiveRewards) {
      let gameWon = winner === playerID
      let newXpDetails = []

      // Vérifier si c'est la première partie de la journée
      const today = new Date().setHours(0, 0, 0, 0)
      const matchSummaries = userInfo.matchSummaries || []

      // Filtrer les parties du jour
      const gamesToday = matchSummaries.filter((match) => {
        const matchDate = new Date(match.gameDetails.timestamp).setHours(0, 0, 0, 0)
        return matchDate === today
      })

      // Vérifier si toutes les parties du jour sont des "lots de consolation" (tour 1 uniquement)
      const allGamesConsolation = gamesToday.every((game) => game.gameDetails.turnCount === 1)

      // Définir isFirstGameOfDay et isFirstWinOfDay selon les parties précédentes
      const isFirstGameOfDay = allGamesConsolation || gamesToday.length === 0
      const isFirstWinOfDay =
        gameWon &&
        (allGamesConsolation || gamesToday.every((game) => game.gameDetails.result !== 'victory'))

      // Obtenir l'XP gagnée
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

      // Préparer la mise à jour des statistiques
      const gameMode = gameData.gamemode
      let gamesPlayedUpdate = {}
      gamesPlayedUpdate[`stats.gamesPlayed.${gameMode}`] =
        (userInfo.stats?.gamesPlayed?.[gameMode] || 0) + 1

      let newVictories = gameWon
        ? (userInfo.stats?.victories || 0) + 1
        : userInfo.stats?.victories || 0

      // Mettre à jour la série de victoires
      let currentStreak = userInfo.stats?.winStreak || 0
      let longestStreak = userInfo.stats?.longestWinStreak || 0

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

      // Initialiser les variables pour le MMR et les PR
      let mmrChangeValue = 0
      let newMMR = playerSelf.stats?.mmr || 500
      let prChangeValue = 0
      let newPR = playerSelf.stats?.pr || 0 // PR : Points de Rang

      // Calculer le MMR pour tous les modes sauf 'custom'
      if (gameMode !== 'custom') {
        let currentMMR = playerSelf.stats?.mmr
        if (isNaN(currentMMR) || currentMMR === undefined) {
          currentMMR = 500
        }

        const opponentMMR = playerRival.stats?.mmr || 500

        mmrChangeValue = calculateMMRChange(currentMMR, opponentMMR, gameWon, gameMode)
        newMMR = Math.max(0, currentMMR + mmrChangeValue)
        setMmrChange(mmrChangeValue)
      }

      // Calculer les PR uniquement pour le mode 'ranked'
      if (gameMode === 'ranked') {
        prChangeValue = calculatePRChange(gameWon, currentStreak, gameMode)
        let potentialPR = newPR + prChangeValue

        // Vérifier si le PR potentiel est inférieur à zéro
        if (potentialPR < 0) {
          // Ajuster le prChangeValue pour refléter le changement réel
          prChangeValue = -newPR
          newPR = 0
        } else {
          newPR = potentialPR
        }

        // Déterminer le rang actuel
        const currentRank = getRankProgress(newPR)

        // Mettre à jour l'état local si nécessaire
        setPrChange(prChangeValue)
        console.log(currentRank)
        setNewRank(currentRank)
      }

      // Construire le résumé du match avec les informations souhaitées
      const matchSummary = {
        player: {
          id: user.uid,
          xpGained: xpObtained,
          mmrGained: mmrChangeValue,
          prGained: prChangeValue,
          gameWon: gameWon
        },
        opponent: {
          id: playerRival.id
        },
        gameDetails: {
          mode: gameData.gamemode,
          turnCount: turn,
          timestamp: new Date().toISOString(),
          result: gameWon ? 'victory' : 'defeat'
        }
      }

      // Mettre à jour les résumés de match de l'utilisateur
      let updatedMatchSummaries = userInfo.matchSummaries ? [...userInfo.matchSummaries] : []
      updatedMatchSummaries.push(matchSummary)
      if (updatedMatchSummaries.length >= 9) {
        updatedMatchSummaries = updatedMatchSummaries.slice(-9)
      }

      // Création du batch pour les opérations Firestore
      const batch = writeBatch(db)

      // Préparer les mises à jour pour l'utilisateur
      const userRef = doc(db, 'users', user.uid)
      let userUpdates = {
        level: newPlayerExp.level,
        xp: newPlayerExp.xp,
        'stats.winStreak': currentStreak,
        'stats.longestWinStreak': longestStreak,
        ...gamesPlayedUpdate,
        'stats.victories': newVictories,
        matchSummaries: updatedMatchSummaries
      }

      // Mise à jour du MMR et des PR en fonction du mode de jeu
      if (gameMode !== 'custom') {
        userUpdates['stats.mmr'] = newMMR
      }
      if (gameMode === 'ranked') {
        userUpdates['stats.pr'] = newPR
      }

      batch.update(userRef, userUpdates)

      // Mise à jour du jeu pour définir `receiveRewards` à `true`
      const gameRef = doc(db, 'games', room)
      batch.update(gameRef, {
        [host ? 'player1.receiveRewards' : 'player2.receiveRewards']: true
      })

      // Exécuter le batch
      await batch.commit()

      // Mettre à jour l'état de l'utilisateur après un délai
      setTimeout(async () => {
        await updateUserState(user)
        levelup()
      }, 1000)
    }
  }

  useEffect(() => {
    if (!isSpectator) {
      const checkAchievements = async () => {
        if (handleWin !== null) {
          checkForAchievements(gameData, winner === playerID)
          // Vérifier l'obtention de l'achievement "Chegel"
          if (
            winner === playerID &&
            pattern.some(
              (cell) =>
                cell.card &&
                cell.card.name === 'Chegel' &&
                cell.card.title === "L'omniscient" &&
                cell.owner === playerID
            )
          ) {
            await giveAchievement('HF_chegel')
          }
        }
      }

      checkAchievements()
    }
  }, [userInfo])

  useEffect(() => {
    if (handleWin !== null) {
      setSelectedCells([])
      setSelectedCards([])
      setRightWindow(null)
      setLeftWindow(null)
      setTradeButton(true)
      if (!isSpectator) {
        handleExpAndStats()
      }
    } else {
      setXpGained(0)
      setMmrChange(0)
    }
  }, [handleWin])

  if (handleWin !== null) {
    return (
      <div className={`winner`}>
        <h1>
          {isSpectator
            ? `${winnerPlayer} a gagné !`
            : playerID === winner
              ? 'Vous avez gagné !'
              : 'Vous avez perdu...'}
        </h1>
        <div style={{ marginTop: 10 }}>
          {!isSpectator && (
            <div className="xp-bar_container">
              {xpGained !== 0 && (
                <>
                  <h2>XP gagnée : {xpGained}</h2>
                  {xpDetails.length > 0 && (
                    <ul className="winner-details">
                      {xpDetails.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  )}
                  <ExperienceBar />
                </>
              )}
              {/* {gameData.gamemode !== 'custom' && (
                <h2>
                  MMR {mmrChange > 0 ? 'gagné' : 'perdu'} : {mmrChange}
                </h2>
              )} */}
              {gameData.gamemode === 'ranked' && newRank && (
                <RankProgressBar prObtained={prChange} />
              )}
            </div>
          )}
          {!isSpectator &&
            gameData.revenge?.state !== 'quit' &&
            gameData.revenge !== 'quit' &&
            gameData.gamemode !== 'ranked' && (
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
            {isSpectator ? 'Retour aux lobbies' : 'Retour au menu'}
          </Button>
        </div>
      </div>
    )
  }

  return null
}
