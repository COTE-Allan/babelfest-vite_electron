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

export default useCheckForAchievements
