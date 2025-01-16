import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../AuthContext'
import ProfileDisplayer from '../account/ProfileDisplayer'
import { useLocation, useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../Firebase'
import { createUserInfo, getPlayerRank, getPlayerStats } from '../others/toolBox'

const Account = () => {
  const { userInfo, user } = useContext(AuthContext)
  const [targetUser, setTargetUser] = useState(null)
  const { userId } = useParams()
  const isMine = userId === user.uid
  const location = useLocation()
  console.log(userInfo)

  async function GetUser(userId) {
    const userRef = doc(db, 'users', userId)
    const docSnap = await getDoc(userRef)

    if (docSnap.exists()) {
      const userData = docSnap.data()
      const userInfo = createUserInfo(userData)
      let stats = getPlayerStats(userInfo.stats)
      userInfo.stats = stats
      userInfo.id = userId
      const rank = await getPlayerRank(userId)
      userInfo.rank = rank
      setTargetUser(userInfo)
    } else {
      setTargetUser('nan')
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      if (isMine) {
        const rank = await getPlayerRank(user.uid)

        const extendedUserInfo = {
          ...structuredClone(userInfo), // Conserver les propriétés existantes de userInfo
          id: user.uid, // Ajouter la propriété id depuis user
          stats: getPlayerStats(userInfo.stats),
          rank: rank
        }
        console.log(extendedUserInfo)
        setTargetUser(extendedUserInfo)
      } else {
        await GetUser(userId) // Appeler GetUser avec await
      }
    }

    fetchUserData()
  }, [])

  return (
    <ProfileDisplayer
      userInfo={targetUser}
      isMine={isMine}
      setUser={setTargetUser}
      defaultPage={location.state?.openMenu ? location.state?.openMenu : 1}
    />
  )
}

export default Account
