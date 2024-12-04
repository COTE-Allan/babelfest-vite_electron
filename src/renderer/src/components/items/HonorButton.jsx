import React, { useState, useEffect, useContext } from 'react'
import { doc, updateDoc, increment } from 'firebase/firestore'
import { FaThumbsUp } from 'react-icons/fa'
import { db } from '../../Firebase'
import { AuthContext } from '../../AuthContext'
import { useSendMessage } from '../others/toolBox'
import HudNavLink from '../items/hudNavLink'
import useCheckForAchievements from '../controllers/AchievementsController'

const HonorButton = ({ targetUserId, targetUser }) => {
  const { user, userInfo, updateUserState, userSettings, giveAchievement } = useContext(AuthContext)
  const [canHonor, setCanHonor] = useState(false)
  const sendMessage = useSendMessage()
  const checkForAchievements = useCheckForAchievements()

  useEffect(() => {
    const currentTime = Date.now()
    if (
      !userInfo.stats.honored ||
      currentTime - userInfo.stats.honored.timestamp >= 24 * 60 * 60 * 1000
    ) {
      setCanHonor(true)
    } else {
      setCanHonor(false)
    }
  }, [userInfo])

  const handleHonor = async () => {
    const currentTime = Date.now()
    if (!canHonor) {
      const nextAvailableTime = new Date(userInfo.stats.honored.timestamp + 24 * 60 * 60 * 1000)
      sendMessage(
        `Vous pourrez honorer à nouveau le ${nextAvailableTime.toLocaleDateString()} à ${nextAvailableTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        'error'
      )
      return
    }

    try {
      const userRef = doc(db, 'users', user.uid)
      const targetUserRef = doc(db, 'users', targetUserId)

      if (userInfo.stats.honored.quantity ?? 0 + 1 === 1) {
        await giveAchievement('HF_1honored')
      }

      if (userInfo.stats.honored.quantity ?? 0 + 1 === 50) {
        await giveAchievement('HF_50honored')
      }

      // Mettre à jour le timestamp et incrémenter la quantité dans honored
      await updateDoc(userRef, {
        'stats.honored.timestamp': currentTime,
        'stats.honored.quantity': increment(1)
      })

      // Incrémenter le compteur honor de targetUser
      await updateDoc(targetUserRef, {
        'stats.honor': increment(1)
      })

      sendMessage(`Vous avez honoré ${targetUser.username} !`, 'success')
      await updateUserState(user)
      setCanHonor(false)
    } catch (error) {
      console.error("Erreur lors de l'honoration:", error)
    }
  }

  return (
    <HudNavLink onClick={handleHonor} className={!canHonor ? 'disabled' : 'honor'}>
      <span className="hidden-span">Honorer</span>
      <FaThumbsUp size={35} />
    </HudNavLink>
  )
}

export default HonorButton
