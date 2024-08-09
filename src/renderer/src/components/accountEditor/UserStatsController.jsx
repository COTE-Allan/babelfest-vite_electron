import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../AuthContext'
import { getPlayerRank, getPlayerStats, getTotalPlayers } from '../others/toolBox'
import StatsDisplayer from '../interface/StatsDisplayer'

export default function StatsController() {
  const { userInfo, user } = useContext(AuthContext)

  const playerStats = getPlayerStats(userInfo.stats)
  userInfo.id = user.uid

  return <StatsDisplayer user={userInfo} stats={playerStats} />
}
