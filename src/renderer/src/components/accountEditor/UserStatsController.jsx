import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../AuthContext'
import { getPlayerRank, getPlayerStats, getTotalPlayers } from '../others/toolBox'

export default function StatsController() {
  const { userInfo, user } = useContext(AuthContext)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [playerRank, setPlayerRank] = useState(0)

  useEffect(() => {
    const fetchStats = async () => {
      const total = await getTotalPlayers()
      const rank = await getPlayerRank(user.uid)

      setTotalPlayers(total)
      setPlayerRank(rank)
    }

    fetchStats()
  }, [userInfo.id]) // Ce useEffect dépend de l'ID de l'utilisateur et sera réexécuté si celui-ci change

  const playerStats = getPlayerStats(userInfo.stats)

  return (
    <div className="account-stats">
      <div className="account-stats-row">
        <div className="account-stats-item">
          <span className="value">{playerStats.totalGamesPlayed}</span>
          <span className="value-label">Parties jouées</span>
        </div>
        <div className="account-stats-item">
          <span className="value">{playerStats.victories}</span>
          <span className="value-label">Victoires</span>
        </div>
        <div className="account-stats-item">
          <span className="value">{playerStats.defeats}</span>
          <span className="value-label">Défaites</span>
        </div>
        <div className="account-stats-item">
          <span className="value">{playerStats.winPercentage} %</span>
          <span className="value-label">Ratio de victoire</span>
        </div>
      </div>
      <div className="account-stats-row">
        <div className="account-stats-item">
          <span className="value">{playerStats.gamesPlayed.quick}</span>
          <span className="value-label">Parties rapides</span>
        </div>
        <div className="account-stats-item">
          <span className="value">{playerStats.gamesPlayed.ranked}</span>
          <span className="value-label">Parties classées</span>
        </div>
        <div className="account-stats-item">
          <span className="value">{playerStats.gamesPlayed.custom}</span>
          <span className="value-label">Parties customs</span>
        </div>
      </div>
      <div className="account-stats-row">
        <div className="account-stats-item rank">
          <span className="value bronze">BRONZE V</span>
          <span className="value-label">Rang actuel</span>
        </div>
        <div className="account-stats-item">
          <span className="value">{playerStats.mmr}</span>
          <span className="value-label">MMR</span>
        </div>
        <div className="account-stats-item rank">
          {/* Affichage du rang du joueur et du nombre total de joueurs */}
          <span className="value">
            {playerRank} sur {totalPlayers}
          </span>
          <span className="value-label">Position sur le classement</span>
        </div>
      </div>
      <div className="account-stats-row">
        <div className="account-stats-item">
          <span className="value">{playerStats.winStreak}</span>
          <span className="value-label">Série de victoires</span>
        </div>
        <div className="account-stats-item">
          <span className="value">{playerStats.longestWinStreak}</span>
          <span className="value-label">Record de victoires consécutives</span>
        </div>
      </div>
    </div>
  )
}
