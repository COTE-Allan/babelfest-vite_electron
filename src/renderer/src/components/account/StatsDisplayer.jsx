import { getRankProgress } from '../others/xpSystem'
import '../../styles/account/statsDisplayer.scss'
import achievements from '../../jsons/achievements.json'

export default function StatsDisplayer({ user, stats }) {
  // Obtenir les PR du joueur
  const pr = stats.pr || 0
  const maxPr = stats.maxPr || 0

  // Utiliser getRankProgress pour obtenir les informations de rang
  const rankProgress = getRankProgress(pr)
  const currentRankName = rankProgress.currentRank
  const rankClassName = rankProgress.rankClass
  const nextRankName = rankProgress.nextRank
  const nextRankClassName = rankProgress.nextRankClass
  const prForNextRank = rankProgress.prForNextRank
  const prInCurrentRank = rankProgress.prInCurrentRank

  // Calculer le pourcentage de progression dans le rang actuel
  const progressPercentage = ((pr - prInCurrentRank) / (prForNextRank - prInCurrentRank)) * 100
  return (
    <div className="statsDisplayer">
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
              <span className="statsDisplayer-category-list-item-value">{user.stats.level}</span>
              niveaux
              <span className="statsDisplayer-category-list-item-rank">
                (#{user.rank.levelXpRank ?? 0} du classement)
              </span>
            </li>
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">{stats.mmr}</span>
              MMR{' '}
              <span className="statsDisplayer-category-list-item-rank">
                (#{user.rank.mmrRank ?? 0} du classement)
              </span>
            </li>
            <li className="statsDisplayer-category-list-item">
              <span className={`statsDisplayer-category-list-item-value ${rankClassName}`}>
                {currentRankName.toUpperCase()}
              </span>{' '}
              Rang de saison actuel
            </li>
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">{pr}</span> Pts de rang
              <span className="statsDisplayer-category-list-item-rank">
                (#{user.rank.prRank ?? 0} du classement)
              </span>
            </li>
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">{maxPr}</span> PR max
              atteint
            </li>
          </ul>
        </div>
        <div className="statsDisplayer-category">
          <h3>Performances</h3>
          <hr />
          <ul className="statsDisplayer-category-list">
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">
                {user.achievements.length}
              </span>
              sur {achievements.length} succès obtenus
            </li>
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">
                {user.alternates.length + user.shopFlags.length}
              </span>
              objets achetés
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
            {/* <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">
                {user.friends?.length || 0}
              </span>
              Amis
            </li> */}
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">{stats.honor ?? 0}</span>
              Honneurs reçus
            </li>
            <li className="statsDisplayer-category-list-item">
              <span className="statsDisplayer-category-list-item-value">
                {stats.honored?.quantity ?? 0}
              </span>
              Honneurs envoyés
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
