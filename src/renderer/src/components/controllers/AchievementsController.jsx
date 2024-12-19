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
const checkObjective = (objective, userInfo, playerStats, gameData, winner) => {
  if (objective.win) {
    if (!winner) {
      return false
    }
  }

  let value

  if (objective.stat) {
    value = getNestedValue(playerStats, objective.stat)
    console.log(objective, value, objective.value, value >= objective.value)
    if (value !== undefined) {
      return value >= objective.value
    }
  } else if (objective.profile) {
    value = getValue(userInfo, objective.profile)
    return value !== undefined && value >= objective.value
  } else if (objective.gameData) {
    if (objective.gamemode.includes(gameData.gamemode)) {
      value = getValue(gameData, objective.gameData)
      if (value !== undefined) {
        if (objective.condition.startsWith('<')) {
          return value < parseInt(objective.condition.substring(1), 10)
        } else if (objective.condition.startsWith('>')) {
          return value > parseInt(objective.condition.substring(1), 10)
        } else if (objective.condition.startsWith('=')) {
          return value === parseInt(objective.condition.substring(1), 10)
        }
      }
    }
  }

  return false
}

const getNestedValue = (obj, path) => {
  const parts = path.split('.')
  let current = obj
  for (const part of parts) {
    if (current[part] === undefined) {
      return undefined
    }
    current = current[part]
  }
  return current
}

// Hook pour vérifier et décerner les succès
export const useCheckForAchievements = () => {
  const { userInfo, giveAchievement } = useContext(AuthContext)

  const checkForAchievements = async (gameData = null, winner = false) => {
    console.log('checkForAchivement')
    const userAchievements = userInfo.achievements
    const playerStats = getPlayerStats(userInfo.stats)
    const achievementsToCheck = achievements.filter((achievement) => {
      if (!achievement.objective) return false
      if (!Array.isArray(userAchievements)) return true
      return !userAchievements.includes(achievement.id)
    })

    for (const ach of achievementsToCheck) {
      if (checkObjective(ach.objective, userInfo, playerStats, gameData, winner)) {
        await giveAchievement(ach.id)
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
