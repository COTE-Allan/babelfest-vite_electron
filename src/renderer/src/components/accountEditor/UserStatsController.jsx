import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../AuthContext'
import { getPlayerRank, getPlayerStats, getTotalPlayers } from '../others/toolBox'
import StatsDisplayer from '../interface/StatsDisplayer'
import MatchSummaries from '../interface/MatchSummaries'

export default function StatsController() {
  const { userInfo, user } = useContext(AuthContext)

  const playerStats = getPlayerStats(userInfo.stats)
  userInfo.id = user.uid

  return (
    <div className="matchSummaries-container">
      <StatsDisplayer user={userInfo} stats={playerStats} />
      <h2>Historique</h2>
      <MatchSummaries summaries={userInfo.matchSummaries} />
    </div>
  )
}
