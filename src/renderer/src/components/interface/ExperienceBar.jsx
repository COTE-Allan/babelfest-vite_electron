import ProgressBar from '@ramonak/react-progress-bar'
import { getCurrentExpMax } from '../others/xpSystem'
import { useContext } from 'react'
import { AuthContext } from '../../AuthContext'

export default function ExperienceBar() {
  const { userInfo } = useContext(AuthContext)

  const xpMax = getCurrentExpMax(userInfo.level)
  const xpPercentage = (userInfo.xp / xpMax) * 100

  return (
    <div className="xp-bar">
      <span className="xp-bar-infos">
        Niveau {userInfo.level} ({userInfo.xp}/{xpMax} XP)
      </span>
      <ProgressBar
        padding={5}
        completed={userInfo.xp}
        bgColor={userInfo.primaryColor.hex}
        labelColor="#fff"
        maxCompleted={xpMax}
        customLabel={`${xpPercentage.toFixed(0)}%`}
      />
    </div>
  )
}
