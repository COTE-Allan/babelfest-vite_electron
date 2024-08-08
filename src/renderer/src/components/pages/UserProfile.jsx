import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../../Firebase'
import { getPlayerStats } from '../others/toolBox'
import '../../styles/pages/UserProfile.scss'
import PlayerBanner from '../interface/inGame/PlayerBanner'
import ProfilePicture from '../esthetics/profilePicture'

const UserProfile = () => {
  const { userId } = useParams()
  const [user, setUser] = useState(null)

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
      setUser(userInfo)
    }
  }

  useEffect(() => {
    GetUser()
  }, [])

  if (user === null) return
  return (
    <div className="userProfile">
      <div className="userProfile-avatar">
        <ProfilePicture
          size={400}
          customUser={{
            profilePic: user.profilePic,
            profileBorder: user.profileBorder
          }}
        />
        <PlayerBanner user={user} color={user.primaryColor} />
      </div>
    </div>
  )
}

export default UserProfile
