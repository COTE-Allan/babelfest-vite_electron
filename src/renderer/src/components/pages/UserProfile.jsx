import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../../Firebase'
import { getPlayerStats, useSendErrorMessage } from '../others/toolBox'
import '../../styles/pages/UserProfile.scss'
import ProfilePicture from '../esthetics/profilePicture'
import StatsDisplayer from '../interface/StatsDisplayer'
import HudNavLink from '../items/hudNavLink'
import { FaArrowLeft, FaBookOpen, FaCircle, FaThumbsUp, FaUserPlus } from 'react-icons/fa'
import { AuthContext } from '../../AuthContext'
import { toast } from 'react-toastify'
import useSound from 'use-sound'
import successSfx from '../../assets/sfx/info_notification.mp3'
import { ImCross } from 'react-icons/im'
import MatchSummaries from '../interface/MatchSummaries'

const UserProfile = () => {
  const { user, userInfo, updateUserState, userSettings } = useContext(AuthContext)
  const { userId } = useParams()
  const [targetUser, setTargetUser] = useState(null)
  const [canHonor, setCanHonor] = useState(false)
  const sendErrorMessage = useSendErrorMessage()
  const [playSuccess] = useSound(successSfx, {
    volume: userSettings.sfxVolume
  })

  async function GetUser() {
    const userRef = doc(db, 'users', userId)
    const docSnap = await getDoc(userRef)

    if (docSnap.exists()) {
      const userData = docSnap.data()
      const userInfo = {
        username: userData.username,
        primaryColor: userData.primaryColor,
        profilePic: userData.profilePic,
        profileBorder: userData.profileBorder,
        title: userData.title,
        banner: userData.banner,
        level: userData.level,
        honor: userData.honor,
        stats: {
          gamesPlayed: userData.stats?.gamesPlayed || 0,
          victories: userData.stats?.victories || 0,
          mmr: userData.stats?.mmr || 500,
          winStreak: userData.stats?.winStreak || 0,
          longestWinStreak: userData.stats?.longestWinStreak || 0
        },
        status: userData.status,
        achievements: userData.achievements || [],
        honored: userData.honored || { timestamp: 0, quantity: 0 },
        matchSummaries: userData.matchSummaries
      }
      let stats = getPlayerStats(userInfo.stats)
      userInfo.stats = stats
      userInfo.id = userId
      setTargetUser(userInfo)
    }
  }

  useEffect(() => {
    GetUser()
    const currentTime = Date.now()
    if (
      !userInfo.honored.timestamp ||
      currentTime - userInfo.honored.timestamp >= 24 * 60 * 60 * 1000
    ) {
      setCanHonor(true)
    } else {
      setCanHonor(false)
    }
  }, [userId])

  const handleHonor = async () => {
    const currentTime = Date.now()

    if (!canHonor) {
      const nextAvailableTime = new Date(userInfo.honored.timestamp + 24 * 60 * 60 * 1000)
      sendErrorMessage(
        `Vous pourrez honorer à nouveau le ${nextAvailableTime.toLocaleDateString()} à ${nextAvailableTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
      )
      return
    }

    try {
      const userRef = doc(db, 'users', user.uid)
      const targetUserRef = doc(db, 'users', userId)

      // Mettre à jour le timestamp et incrémenter la quantité dans honored
      await updateDoc(userRef, {
        'honored.timestamp': currentTime,
        'honored.quantity': increment(1)
      })

      // Incrémenter le compteur honor de targetUser
      await updateDoc(targetUserRef, {
        honor: increment(1)
      })

      setTargetUser({ ...targetUser, honor: targetUser.honor + 1 })

      playSuccess()
      toast.success(`Vous avez honoré ${targetUser.username} !`)
      await updateUserState(user)
      setCanHonor(false)
    } catch (error) {
      console.error("Erreur lors de l'honoration:", error)
    }
  }

  if (targetUser === null) return null

  return (
    <div className="userProfile">
      <div className="userProfile-profile">
        <div className="userProfile-profile-avatar">
          <ProfilePicture customUser={targetUser} size={200} border={targetUser.primaryColor} />
          <div className="userProfile-profile-avatar-name">
            <FaCircle
              color={targetUser.status.state === 'online' ? '4ead35' : '888888'}
              size={20}
            />
            <h1>{targetUser.username}</h1>
          </div>
        </div>
        <div className="userProfile-control">
          <HudNavLink permOpen onClick={handleHonor} className={!canHonor ? 'disabled' : ''}>
            <FaThumbsUp size={35} />
            <span className="hidden-span">Honorer</span>
          </HudNavLink>
          {/* <HudNavLink permOpen className={'disabled'}>
            <FaUserPlus size={40} />
            <span className="hidden-span">Ajouter en ami</span>
          </HudNavLink> */}
          <HudNavLink to={-1} permOpen>
            <FaArrowLeft size={35} />
            <span className="hidden-span">Page précédente</span>
          </HudNavLink>
        </div>
      </div>

      <div className="userProfile-content">
        <StatsDisplayer user={targetUser} stats={targetUser.stats} />
        {targetUser.matchSummaries && (
          <>
            <h2 className="summary-title">Historique</h2>
            <MatchSummaries summaries={targetUser.matchSummaries} />
          </>
        )}
      </div>
    </div>
  )
}

export default UserProfile
