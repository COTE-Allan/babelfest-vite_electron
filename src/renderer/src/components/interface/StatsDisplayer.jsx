import { useEffect, useState } from 'react'
import '../../styles/interface/statsDisplayer.scss'
import { getPlayerRank } from '../others/toolBox'
import ProfilePicture from '../esthetics/profilePicture'
import achievements from '../../jsons/achievements.json'
import LeaderboardPlayerBanner from '../items/LeaderboardPlayerBanner'

export default function StatsDisplayer({ user, stats }) {
  const [playerRank, setPlayerRank] = useState(0)

  useEffect(() => {
    const fetchStats = async () => {
      const rank = await getPlayerRank(user.id)

      setPlayerRank(rank)
    }

    fetchStats()
  }, [])
  return (
    <div className="statsDisplayer">
      <LeaderboardPlayerBanner user={user} />

      <div className="statsDisplayer-content">
        <div className="statsDisplayer-category">
          <h3>Temps de jeu</h3>
          <hr />
          <ul className="statsDisplayer-category-list">
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">
                {stats.totalGamesPlayed}
              </span>
              parties jouées
            </li>
            <div className="statsDisplayer-category smaller">
              <ul className="statsDisplayer-category-list">
                <li className="statsDisplayer-category-list-item">
                  <span className="statsDisplayer-category-list-item-value">
                    {stats.gamesPlayed.quick}
                  </span>
                  rapides
                </li>
                <li className="statsDisplayer-category-list-item">
                  <span className="statsDisplayer-category-list-item-value">
                    {stats.gamesPlayed.ranked}
                  </span>
                  classés
                </li>
                <li className="statsDisplayer-category-list-item">
                  <span className="statsDisplayer-category-list-item-value">
                    {stats.gamesPlayed.custom}
                  </span>
                  customs
                </li>
              </ul>
            </div>
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">{stats.victories}</span>{' '}
              victoires
            </li>
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">{stats.defeats}</span>{' '}
              défaites
            </li>
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">
                {stats.winPercentage}%
              </span>
              Ratio de victoire
            </li>
          </ul>
        </div>
        <div className="statsDisplayer-category">
          <h3>Classement</h3>
          <hr />
          <ul className="statsDisplayer-category-list">
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">{user.level}</span>
              niveaux
              <span className="statsDisplayer-category-list-item-rank">
                (#{playerRank.levelXpRank ?? 0} du classement)
              </span>
            </li>
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">{stats.mmr}</span>
              MMR{' '}
              <span className="statsDisplayer-category-list-item-rank">
                (#{playerRank.mmrRank ?? 0} du classement)
              </span>
            </li>
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value bronze">BRONZE V</span> Rang
              de saison actuel
            </li>
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">0</span> Pts de rang
            </li>
          </ul>
        </div>
        <div className="statsDisplayer-category">
          <h3>Perfomances</h3>
          <hr />
          <ul className="statsDisplayer-category-list">
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">
                {user.achievements.length}
              </span>
              sur {achievements.length} succès obtenus
            </li>
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">{stats.winStreak}</span>
              Série de victoires actuelle
            </li>
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">
                {stats.longestWinStreak}
              </span>
              Meilleure série de victoires
            </li>
          </ul>
        </div>
        <div className="statsDisplayer-category">
          <h3>Social</h3>
          <hr />
          <ul className="statsDisplayer-category-list">
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">0</span>
              Amis
            </li>
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">{user.honor ?? 0}</span>
              Honneurs reçus
            </li>
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">{user.honored.quantity ?? 0}</span>
              Honneurs envoyés
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
