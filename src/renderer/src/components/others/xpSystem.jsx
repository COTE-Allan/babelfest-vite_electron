export function getCurrentExpMax(currentLevel) {
  let expMax = 100 // XP requis pour le niveau 1

  // Calcul de l'XP requis pour le niveau actuel
  for (let level = 2; level <= currentLevel; level++) {
    expMax += 50 * 1.05
    expMax = Math.ceil(expMax) // Arrondi à l'unité supérieure
  }

  return expMax
}

export function obtainExp(turns, winner, gamemode) {
  let xpTurns = 0
  if (turns > 15) {
    xpTurns = 25 * 15
  } else {
    xpTurns = 25 * turns
  }

  let xpResult = winner ? 150 : 75

  let xpGamemode
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

  return xpTurns + xpResult + xpGamemode
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
