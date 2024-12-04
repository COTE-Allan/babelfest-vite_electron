import ProgressBar from '@ramonak/react-progress-bar'
import { getCurrentExpMax } from '../others/xpSystem'
import { useContext } from 'react'
import { AuthContext } from '../../AuthContext'

export default function ExperienceBar({ customUserInfo = null }) {
  const { userInfo } = useContext(AuthContext)

  const finalUserInfo = customUserInfo ?? userInfo

  const xpMax = getCurrentExpMax(finalUserInfo.stats.level)
  const xpPercentage = (finalUserInfo.stats.xp / xpMax) * 100

  return (
    <div className="xp-bar">
      <span className="xp-bar-infos">
        Niveau {finalUserInfo.stats.level} ({finalUserInfo.stats.xp}/{xpMax} XP)
      </span>
      <ProgressBar
        padding={2}
        completed={finalUserInfo.stats.xp}
        bgColor={finalUserInfo.skin.primaryColor.hex}
        labelColor="#fff"
        maxCompleted={xpMax}
        customLabel={`${xpPercentage.toFixed(0)}%`}
      />
    </div>
  )
}
