import ProgressBar from '@ramonak/react-progress-bar'
import { AuthContext } from '../../AuthContext'
import { getRankProgress } from '../others/xpSystem'
import { useContext } from 'react'

export default function RankProgressBar({ prObtained, customUser }) {
  const { userInfo } = useContext(AuthContext)

  // Obtenir les PR du joueur
  const pr = customUser ? customUser.stats.pr || 0 : userInfo.stats?.pr || 0

  // Obtenir les détails de progression du rang
  const { currentRank, nextRank, prForNextRank, prInCurrentRank, rankClass } = getRankProgress(pr)

  // Calculer le PR relatif pour l'affichage correct
  const relativePr = pr - prInCurrentRank
  const maxPrInCurrentRank = prForNextRank - prInCurrentRank

  const rankHexs = {
    bronze: '#cd7f32',
    argent: '#c0c0c0',
    or: '#eaad20',
    diamant: '#b9f2ff',
    maitre: '#972c2c'
  }

  return (
    <div className={`rank-progress-bar ${rankClass}`}>
      <div className="rank-info">
        <span>
          {currentRank} - {prForNextRank - 100}
        </span>
        {prObtained ? (
          <span>
            PR {prObtained > 0 ? 'gagnés' : 'perdus'} : {prObtained}
          </span>
        ) : (
          <span>{pr} PR</span>
        )}
        {prForNextRank !== 2100 ? (
          <span>
            {nextRank} - {prForNextRank}
          </span>
        ) : (
          <span>2000+</span>
        )}
      </div>
      <ProgressBar
        className="progressBarContainer"
        padding={2}
        completed={pr >= 2000 ? 100 : relativePr}
        bgColor={rankHexs[rankClass]}
        maxCompleted={maxPrInCurrentRank}
      />
    </div>
  )
}
