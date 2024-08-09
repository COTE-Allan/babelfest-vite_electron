import { doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore'
import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../../Firebase'
import { getPlayerStats, useSendErrorMessage } from '../others/toolBox'
import '../../styles/pages/UserProfile.scss'
import PlayerBanner from '../interface/inGame/PlayerBanner'
import ProfilePicture from '../esthetics/profilePicture'
import StatsDisplayer from '../interface/StatsDisplayer'
import HudNavLink from '../items/hudNavLink'
import { MdAddReaction } from 'react-icons/md'
import { FaBookOpen, FaThumbsUp, FaUserPlus } from 'react-icons/fa'
import { AuthContext } from '../../AuthContext'
import { toast } from 'react-toastify'
import useSound from 'use-sound'
import successSfx from '../../assets/sfx/info_notification.mp3'

const UserProfile = () => {
  const { user, userInfo, updateUserState, userSettings } = useContext(AuthContext)
  const { userId } = useParams()
  const [targetUser, setTargetUser] = useState(null)
  const [isHonored, setIsHonored] = useState(false)
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
        achievements: userData.achievements || []
      }
      let stats = getPlayerStats(userInfo.stats)
      userInfo.stats = stats
      userInfo.id = userId
      setTargetUser(userInfo)
    }
  }

  useEffect(() => {
    GetUser()

    // Vérifier si l'utilisateur a déjà honoré cette personne
    if (userInfo.honored && userInfo.honored.includes(userId)) {
      setIsHonored(true)
    }
  }, [userId, userInfo])

  const handleHonor = async () => {
    if (!isHonored) {
      try {
        const userRef = doc(db, 'users', user.uid)
        const targetUserRef = doc(db, 'users', userId)

        // Ajouter userId à la liste honored de l'utilisateur
        await updateDoc(userRef, {
          honored: arrayUnion(userId)
        })

        // Incrémenter le compteur honor de targetUser
        await updateDoc(targetUserRef, {
          honor: increment(1)
        })
        playSuccess()
        toast.success(`Vous avez honoré ${targetUser.username} !`)
        await updateUserState(user)
        setIsHonored(true) // Désactiver le bouton après avoir honoré
      } catch (error) {
        console.error("Erreur lors de l'honoration:", error)
      }
    } else {
      sendErrorMessage('Vous avez déjà honoré ce joueur.')
    }
  }

  if (targetUser === null) return null

  return (
    <div className="userProfile">
      <div className="userProfile-profile">
        <div className="userProfile-profile-avatar">
          <ProfilePicture customUser={targetUser} size={200} border={targetUser.primaryColor} />
          <h1>{targetUser.username}</h1>
        </div>
        <div className="userProfile-control">
          <HudNavLink permOpen className={isHonored ? 'disabled' : ''} onClick={handleHonor}>
            <FaThumbsUp size={35} />
            <span className="hidden-span">Honorer</span>
          </HudNavLink>
          <HudNavLink permOpen className={'disabled'}>
            <FaUserPlus size={40} />
            <span className="hidden-span">Ajouter en ami</span>
          </HudNavLink>
          <HudNavLink permOpen className={'disabled'}>
            <FaBookOpen size={35} />
            <span className="hidden-span">Historique</span>
          </HudNavLink>
        </div>
      </div>

      <div className="userProfile-content">
        <StatsDisplayer user={targetUser} stats={targetUser.stats} />
      </div>
    </div>
  )
}

export default UserProfile
