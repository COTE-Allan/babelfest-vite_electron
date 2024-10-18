import BackButton from '../items/BackButton'
import { useContext } from 'react'
import { AuthContext } from '../../AuthContext'
import RankBar from '../interface/RankBar'
import '../../styles/account/rankedInfos.scss'
import rankedSeasons from '../../jsons/rankedSeasons.json'
import { getRankProgress } from '../others/xpSystem'
import SkinItem from './SkinItem'
import { getSeasonalsSkins, getSkinsWithLevel } from '../others/toolBox'

const RankedInfos = () => {
  const { userInfo } = useContext(AuthContext)

  // const { currentRank, nextRank, prForNextRank, prInCurrentRank, rankClass } = getRankProgress(
  //   userInfo.stats.pr
  // )

  const endDate = rankedSeasons[0].endDate * 1000 // Convertir la date de fin en millisecondes
  const now = Date.now()
  const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)))

  const seasonalsSkins = getSeasonalsSkins(rankedSeasons[0].id)

  return (
    <div className="rankedInfos">
      <div className="rankedInfos-wrapper">
        <div
          style={{ backgroundColor: rankedSeasons[0].hex + '50' }}
          className="rankedInfos-header"
        >
          <h1>{rankedSeasons[0].name}</h1>
          <h2>{daysRemaining} jours restants</h2>
        </div>

        <div className="rankedInfos-ranks">
          <div className="rankedInfos-ranks-item bronze box-bronze">
            <h2>BRONZE</h2>
            <span>0-499 PR</span>
          </div>
          <div className="rankedInfos-ranks-item argent box-argent">
            <h2>ARGENT</h2>
            <span>500-999 PR</span>
          </div>
          <div className="rankedInfos-ranks-item or box-or">
            <h2>OR</h2>
            <span>1000-1499 PR</span>
          </div>
          <div className="rankedInfos-ranks-item diamant box-diamant">
            <h2>Diamant</h2>
            <span>1500-1999 PR</span>
          </div>
          <div className="rankedInfos-ranks-item maitre box-maitre">
            <h2>Maître</h2>
            <span>2000+ PR</span>
          </div>
        </div>

        <div className="rankedInfos-rewards">
          <div className="rankedInfos-rewards-item box-bronze" style={{opacity: seasonalsSkins[0] === "nothing" ? 0 : 1}}>
            {seasonalsSkins[0] &&
            <SkinItem rankReward skin={seasonalsSkins[0]} userInfo={userInfo} xpPercentage={0} />
            }
          </div>
          <div className="rankedInfos-rewards-item box-argent" style={{opacity: seasonalsSkins[1] === "nothing" ? 0 : 1}}>
            {seasonalsSkins[1] &&
            <SkinItem rankReward skin={seasonalsSkins[1]} userInfo={userInfo} xpPercentage={0} />
            }
          </div>
          <div className="rankedInfos-rewards-item box-or" style={{opacity: seasonalsSkins[2] === "nothing" ? 0 : 1}}>
            {seasonalsSkins[2] &&
            <SkinItem rankReward skin={seasonalsSkins[2]} userInfo={userInfo} xpPercentage={0} />
            }
          </div>
          <div className="rankedInfos-rewards-item box-diamant" style={{opacity: seasonalsSkins[3] === "nothing" ? 0 : 1}}>
            {seasonalsSkins[3] &&
            <SkinItem rankReward skin={seasonalsSkins[3]} userInfo={userInfo} xpPercentage={0} />
            }
          </div>
          <div className="rankedInfos-rewards-item box-maitre" style={{opacity: seasonalsSkins[4] === "nothing" ? 0 : 1}}>
            {seasonalsSkins[4] &&
            <SkinItem rankReward skin={seasonalsSkins[4]} userInfo={userInfo} xpPercentage={0} />
            }
          </div>
        </div>

        <div className="rankedInfos-myRank">
          <RankBar />
        </div>
      </div>
    </div>
  )
}

export default RankedInfos
