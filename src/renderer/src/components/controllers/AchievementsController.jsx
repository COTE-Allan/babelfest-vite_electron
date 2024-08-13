import { useContext } from 'react'
import achievements from '../../jsons/achievements.json'
import { AuthContext } from '../../AuthContext'
import { getPlayerStats } from '../others/toolBox'

// Fonction pour obtenir un succès par ID
export function getAchievementById(id) {
  const achievement = achievements.find((ach) => ach.id === id)
  if (!achievement) {
    throw new Error(`Achievement with id ${id} not found`)
  }
  return achievement
}

// Fonction pour accéder dynamiquement aux propriétés imbriquées
const getValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

// Fonction pour vérifier un objectif
const checkObjective = (objective, userInfo, playerStats) => {
  if (objective.stat && playerStats[objective.stat] !== undefined) {
    return playerStats[objective.stat] >= objective.value
  } else if (objective.profile) {
    const value = getValue(userInfo, objective.profile)
    return value !== undefined && value >= objective.value
  }
  return false
}

// Hook pour vérifier et décerner les succès
export const useCheckForAchievements = () => {
  const { userInfo, giveAchievement } = useContext(AuthContext)

  const checkForAchievements = async () => {
    const userAchievements = userInfo.achievements
    const playerStats = getPlayerStats(userInfo.stats)
    const achievementsToCheck = achievements.filter((achievement) => {
      if (!achievement.objective) return false
      if (!Array.isArray(userAchievements)) return true
      return !userAchievements.includes(achievement.id)
    })

    for (const ach of achievementsToCheck) {
      if (checkObjective(ach.objective, userInfo, playerStats)) {
        await giveAchievement(ach)
      }
    }

    return achievementsToCheck
  }

  return checkForAchievements
}

// Hook pour vérifier la valeur d'un succès spécifique
export const useCheckAchievementValue = () => {
  const { userInfo } = useContext(AuthContext)

  const checkAchievementValue = (achievementId) => {
    const achievement = getAchievementById(achievementId)
    if (!achievement.objective) {
      return userInfo.achievements.includes(achievementId) ? 1 : 0
    }

    const playerStats = getPlayerStats(userInfo.stats)

    if (achievement.objective.stat && playerStats[achievement.objective.stat] !== undefined) {
      return playerStats[achievement.objective.stat]
    } else if (achievement.objective.profile) {
      const value = getValue(userInfo, achievement.objective.profile)
      if (value !== undefined) {
        return value
      }
    }

    return userInfo.achievements.includes(achievementId) ? 1 : 0
  }

  return checkAchievementValue
}

export default useCheckForAchievements
