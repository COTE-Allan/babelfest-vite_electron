import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../AuthContext'
import ProfileDisplayer from '../account/ProfileDisplayer'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../Firebase'
import { getPlayerRank, getPlayerStats } from '../others/toolBox'

const Account = () => {
  const { userInfo, user } = useContext(AuthContext)
  const [targetUser, setTargetUser] = useState(null)
  const { userId } = useParams()
  const isMine = userId === user.uid

  async function GetUser(userId) {
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
        xp: userData.xp ?? 0,
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
        matchSummaries: userData.matchSummaries,
        prestige: userData.prestige ?? null
      }
      let stats = getPlayerStats(userInfo.stats)
      userInfo.stats = stats
      userInfo.id = userId
      const rank = await getPlayerRank(userId)
      userInfo.rank = rank
      setTargetUser(userInfo)
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      if (isMine) {
        const rank = await getPlayerRank(user.uid)

        const extendedUserInfo = {
          ...userInfo, // Conserver les propriétés existantes de userInfo
          id: user.uid, // Ajouter la propriété id depuis user
          stats: getPlayerStats(userInfo.stats),
          rank: rank
        }
        setTargetUser(extendedUserInfo)
      } else {
        await GetUser(userId) // Appeler GetUser avec await
      }
    }

    fetchUserData()
  }, [])

  return <ProfileDisplayer userInfo={targetUser} isMine={isMine} setUser={setTargetUser} />
}

export default Account
