import ProgressBar from '@ramonak/react-progress-bar'
import { AuthContext } from '../../AuthContext'
import { getRankProgress } from '../others/xpSystem'
import { useContext } from 'react'

export default function RankProgressBar({ prObtained }) {
  const { userInfo } = useContext(AuthContext)

  // Obtenir les PR du joueur
  const pr = userInfo.stats?.pr || 0

  // Obtenir les détails de progression du rang
  const { currentRank, nextRank, prForNextRank, prInCurrentRank, rankClass } = getRankProgress(pr)

  // Calculer le PR relatif pour l'affichage correct
  const relativePr = pr - prInCurrentRank
  const maxPrInCurrentRank = prForNextRank - prInCurrentRank

  return (
    <div className={`rank-progress-bar ${rankClass}`}>
      <div className="rank-info">
        <span>{currentRank}</span>
        {prObtained ? (
          <span>
            PR {prObtained > 0 ? 'gagnés' : 'perdus'} : {prObtained}
          </span>
        ) : (
          <span>
            {relativePr} / {maxPrInCurrentRank}
          </span>
        )}
        <span>{nextRank}</span>
      </div>
      <ProgressBar
        className="progressBarContainer"
        padding={2}
        completed={relativePr}
        bgColor={userInfo.primaryColor.hex}
        maxCompleted={maxPrInCurrentRank}
      />
    </div>
  )
}
