export function getCurrentExpMax(currentLevel) {
  let expMax = 100 // XP requis pour le niveau 1

  // Calcul de l'XP requis pour le niveau actuel
  for (let level = 2; level <= currentLevel; level++) {
    expMax += 50 * 1.05
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
