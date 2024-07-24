import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../AuthContext'
import { getPlayerRank, getTotalPlayers } from '../others/toolBox'

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

  const totalGamesPlayed = Object.values(userInfo.stats.gamesPlayed).reduce(
    (total, current) => total + current,
    0
  )

  // Calcul du nombre de défaites
  const defeats = totalGamesPlayed - userInfo.stats.victories

  // Calcul du pourcentage de victoires
  const winPercentage =
    totalGamesPlayed > 0 ? (userInfo.stats.victories / totalGamesPlayed) * 100 : 0

  return (
    <div className="account-stats">
      <div className="account-stats-row">
        <div className="account-stats-item">
          <span className="value">{totalGamesPlayed}</span>
          <span className="value-label">Parties jouées</span>
        </div>
        <div className="account-stats-item">
          <span className="value">{userInfo.stats.victories}</span>
          <span className="value-label">Victoires</span>
        </div>
        <div className="account-stats-item">
          <span className="value">{defeats}</span>
          <span className="value-label">Défaites</span>
        </div>
        <div className="account-stats-item">
          <span className="value">{winPercentage.toFixed(1)} %</span>
          <span className="value-label">Ratio de victoire</span>
        </div>
      </div>
      <div className="account-stats-row">
        <div className="account-stats-item">
          <span className="value">{userInfo.stats.gamesPlayed.quick ?? 0}</span>
          <span className="value-label">Parties rapides</span>
        </div>
        <div className="account-stats-item">
          <span className="value">{userInfo.stats.gamesPlayed.ranked ?? 0}</span>
          <span className="value-label">Parties classées</span>
        </div>
        <div className="account-stats-item">
          <span className="value">{userInfo.stats.gamesPlayed.private ?? 0}</span>
          <span className="value-label">Parties customs</span>
        </div>
      </div>
      <div className="account-stats-row">
        <div className="account-stats-item rank">
          <span className="value bronze">BRONZE V</span>
          <span className="value-label">Rang actuel</span>
        </div>
        <div className="account-stats-item">
          <span className="value">{userInfo.stats.mmr}</span>
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
          <span className="value">{userInfo.stats.winStreak ?? 0}</span>
          <span className="value-label">Série de victoires</span>
        </div>
        <div className="account-stats-item">
          <span className="value">{userInfo.stats.longestWinStreak ?? 0}</span>
          <span className="value-label">Record de victoires consécutives</span>
        </div>
      </div>
    </div>
  )
}
