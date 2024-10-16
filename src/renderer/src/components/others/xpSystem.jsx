import ProgressBar from '@ramonak/react-progress-bar'
import { AuthContext } from '../../AuthContext'
import { useContext } from 'react'

export function getCurrentExpMax(currentLevel) {
  let expMax = 100 // XP requis pour le niveau 1

  // Calcul de l'XP requis pour le niveau actuel
  for (let level = 2; level <= currentLevel; level++) {
    expMax += 40
    expMax = Math.ceil(expMax) // Arrondi à l'unité supérieure
  }

  return expMax
}

export function obtainExp(
  turns,
  winner,
  gamemode,
  isFirstGameOfDay,
  isFirstWinOfDay,
  newXpDetails,
  streak
) {
  let xpObtained = 0

  if (turns === 1) {
    xpObtained = 10
    newXpDetails.push('+10xp : Lot de consolation pour un tour unique.')
    return xpObtained
  }

  // Calcul des XP pour les tours joués
  let xpTurns = 0
  if (turns > 15) {
    xpTurns = 25 * 15 // Maximum 15 tours
  } else {
    xpTurns = 25 * turns
  }
  newXpDetails.push(`+${xpTurns}xp : ${turns} tours joués`)
  xpObtained += xpTurns

  // Calcul des XP pour le résultat de la partie (victoire/défaite)
  let xpResult = winner ? 150 : 75
  newXpDetails.push(`+${xpResult}xp : ${winner ? 'Victoire' : 'Défaite'}`)
  xpObtained += xpResult

  // Calcul des XP pour le mode de jeu
  let xpGamemode = 0
  switch (gamemode) {
    case 'quick':
      xpGamemode = 125
      break
    case 'ranked':
      xpGamemode = 150
      break
    case 'custom':
      xpGamemode = 50
      break
  }
  newXpDetails.push(`+${xpGamemode}xp : Partie ${gamemode}`)
  xpObtained += xpGamemode

  // Bonus pour la première partie du jour
  if (isFirstGameOfDay) {
    const xpFirstGameBonus = 100
    xpObtained += xpFirstGameBonus
    newXpDetails.push(`+${xpFirstGameBonus}xp : Première partie du jour`)
  }

  // Bonus pour la première victoire du jour
  if (isFirstWinOfDay && winner) {
    const xpFirstWinBonus = 200
    xpObtained += xpFirstWinBonus
    newXpDetails.push(`+${xpFirstWinBonus}xp : Première victoire du jour`)
  }

  // Calcul série de victoires
  if (streak) {
    let xpStreakBonus = streak * 15
    if (streak >= 11) {
      xpStreakBonus = 150
    }
    xpObtained += xpStreakBonus
    newXpDetails.push(`+${xpStreakBonus}xp : ${streak} victoires à la suite`)
  }

  return xpObtained
}

export function addExpToPlayer(currentLevel, currentExp, newExp) {
  let totalExp = currentExp + newExp
  let expForNextLevel = getCurrentExpMax(currentLevel)

  while (totalExp >= expForNextLevel) {
    totalExp -= expForNextLevel
    currentLevel++
    expForNextLevel = getCurrentExpMax(currentLevel)
  }

  return {
    level: currentLevel,
    xp: totalExp
  }
}

// Fonction pour calculer le changement de MMR
export function calculateMMRChange(currentMMR, opponentMMR, gameWon, gameMode) {
  if (gameMode === 'custom') return 0

  // Facteur K de base
  const baseK = 30

  // Calcul de la différence de MMR
  const mmrDifference = Math.abs(currentMMR - opponentMMR)

  // Ajustement dynamique du facteur K
  let K = baseK + (mmrDifference / 400) * baseK
  K = Math.min(K, 100) // Limite maximale du facteur K

  // Limites minimales et maximales du changement de MMR
  const minMMRChange = 15
  const maxMMRChange = 150 // Augmenté pour permettre des gains/pertes plus importants

  // Calcul de la probabilité attendue avec un diviseur ajusté
  const expectedScore = 1 / (1 + Math.pow(10, (opponentMMR - currentMMR) / 400))

  // Score réel
  const actualScore = gameWon ? 1 : 0

  // Calcul du changement brut de MMR
  let mmrChangeValue = K * (actualScore - expectedScore)

  // Application des limites
  const mmrChangeSign = Math.sign(mmrChangeValue)
  const minLimit = minMMRChange * mmrChangeSign
  const maxLimit = maxMMRChange * mmrChangeSign

  mmrChangeValue = Math.max(Math.min(mmrChangeValue, maxLimit), minLimit)

  // Retourne le changement de MMR arrondi
  return Math.round(mmrChangeValue)
}

// Fonction pour calculer le changement de PR
export function calculatePRChange(gameWon, currentStreak, gameMode) {
  if (gameMode !== 'ranked') return 0
  const basePR = gameWon ? 40 : -20
  let streakBonus = 0
  if (gameWon) {
    if (currentStreak >= 4) {
      streakBonus = 10
    } else if (currentStreak >= 2) {
      streakBonus = 5
    }
  }
  const totalPRChange = basePR + streakBonus
  return totalPRChange
}

// Fonction pour obtenir le rang actuel
export function getRankProgress(pr) {
  const ranks = [
    { name: 'Bronze 5', minPR: 0, className: 'bronze' },
    { name: 'Bronze 4', minPR: 100, className: 'bronze' },
    { name: 'Bronze 3', minPR: 200, className: 'bronze' },
    { name: 'Bronze 2', minPR: 300, className: 'bronze' },
    { name: 'Bronze 1', minPR: 400, className: 'bronze' },
    { name: 'Argent 5', minPR: 500, className: 'argent' },
    { name: 'Argent 4', minPR: 600, className: 'argent' },
    { name: 'Argent 3', minPR: 700, className: 'argent' },
    { name: 'Argent 2', minPR: 800, className: 'argent' },
    { name: 'Argent 1', minPR: 900, className: 'argent' },
    { name: 'Or 5', minPR: 1000, className: 'or' },
    { name: 'Or 4', minPR: 1100, className: 'or' },
    { name: 'Or 3', minPR: 1200, className: 'or' },
    { name: 'Or 2', minPR: 1300, className: 'or' },
    { name: 'Or 1', minPR: 1400, className: 'or' },
    { name: 'Diamant 5', minPR: 1500, className: 'diamant' },
    { name: 'Diamant 4', minPR: 1600, className: 'diamant' },
    { name: 'Diamant 3', minPR: 1700, className: 'diamant' },
    { name: 'Diamant 2', minPR: 1800, className: 'diamant' },
    { name: 'Diamant 1', minPR: 1900, className: 'diamant' },
    { name: 'Maître', minPR: 2000, className: 'maitre' }
  ]

  let currentRank = ranks[0]
  let nextRank = ranks[1]

  for (let i = 0; i < ranks.length; i++) {
    if (pr >= ranks[i].minPR) {
      currentRank = ranks[i]
      nextRank = ranks[i + 1] || {
        name: 'Rang Max',
        minPR: ranks[i].minPR + 100,
        className: ranks[i].className
      }
    } else {
      break
    }
  }

  return {
    currentRank: currentRank.name,
    nextRank: nextRank.name,
    prForNextRank: nextRank.minPR,
    prInCurrentRank: currentRank.minPR,
    rankClass: currentRank.className,
    nextRankClass: nextRank.className
  }
}
