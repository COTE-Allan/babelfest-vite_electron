import ProgressBar from '@ramonak/react-progress-bar'
import { getCurrentExpMax } from '../others/xpSystem'
import { useContext } from 'react'
import { AuthContext } from '../../AuthContext'

export default function ExperienceBar({ customUserInfo = null }) {
  const { userInfo } = useContext(AuthContext)

  const finalUserInfo = customUserInfo ?? userInfo

  const xpMax = getCurrentExpMax(finalUserInfo.level)
  const xpPercentage = (finalUserInfo.xp / xpMax) * 100

  console.log(finalUserInfo)

  return (
    <div className="xp-bar">
      <span className="xp-bar-infos">
        Niveau {finalUserInfo.level} ({finalUserInfo.xp}/{xpMax} XP)
      </span>
      <ProgressBar
        padding={2}
        completed={finalUserInfo.xp}
        bgColor={finalUserInfo.primaryColor.hex}
        labelColor="#fff"
        maxCompleted={xpMax}
        customLabel={`${xpPercentage.toFixed(0)}%`}
      />
    </div>
  )
}
