import { useContext } from 'react'
import achievements from '../../jsons/achievements.json'
import { AuthContext } from '../../AuthContext'
import { getPlayerStats } from '../others/toolBox'

export function getAchievementById(id) {
  const achievement = achievements.find((ach) => ach.id === id)
  if (!achievement) {
    throw new Error(`Achievement with id ${id} not found`)
  }
  return achievement
}

export const useCheckForAchievements = () => {
  const { userInfo, giveAchievement } = useContext(AuthContext)

  const checkForAchievements = async () => {
    const userAchievements = userInfo.achievements
    const achievementsToCheck = achievements.filter((achievement) => {
      if (!achievement.objective) return false
      if (!Array.isArray(userAchievements)) return true
      return !userAchievements.includes(achievement.id)
    })
    const playerStats = getPlayerStats(userInfo.stats)

    for (const ach of achievementsToCheck) {
      const objective = ach.objective
      if (objective.stat && playerStats[ach.objective.stat] >= objective.value) {
        await giveAchievement(ach)
      }
      if (objective.profile && userInfo[ach.objective.profile] >= objective.value) {
        await giveAchievement(ach)
      }
    }

    return achievementsToCheck
  }

  return checkForAchievements
}

export const useCheckAchievementValue = () => {
  const { userInfo } = useContext(AuthContext)

  const checkAchievementValue = (achievementId) => {
    const achievement = achievements.find((ach) => ach.id === achievementId)
    if (!achievement || !achievement.objective) {
      return userInfo.achievements.includes(achievementId) ? 1 : 0
    }

    const playerStats = getPlayerStats(userInfo.stats)
    const objective = achievement.objective

    if (objective.stat && playerStats[objective.stat] !== undefined) {
      return playerStats[objective.stat]
    } else if (objective.profile && userInfo[objective.profile] !== undefined) {
      return userInfo[objective.profile]
    }

    return userInfo.achievements.includes(achievementId) ? 1 : 0
  }

  return checkAchievementValue
}

export default useCheckForAchievements
