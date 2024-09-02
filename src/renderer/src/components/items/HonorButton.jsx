import React, { useState, useEffect, useContext } from 'react'
import { doc, updateDoc, increment } from 'firebase/firestore'
import { toast } from 'react-toastify'
import { FaThumbsUp } from 'react-icons/fa'
import useSound from 'use-sound'
import { db } from '../../Firebase'
import { AuthContext } from '../../AuthContext'
import { useSendErrorMessage } from '../others/toolBox'
import successSfx from '../../assets/sfx/info_notification.mp3'
import HudNavLink from '../items/hudNavLink'

const HonorButton = ({ targetUserId, targetUser, onHonorSuccess }) => {
  const { user, userInfo, updateUserState, userSettings } = useContext(AuthContext)
  const [canHonor, setCanHonor] = useState(false)
  const sendErrorMessage = useSendErrorMessage()
  const [playSuccess] = useSound(successSfx, {
    volume: userSettings.sfxVolume
  })

  useEffect(() => {
    const currentTime = Date.now()
    if (
      !userInfo.honored.timestamp ||
      currentTime - userInfo.honored.timestamp >= 24 * 60 * 60 * 1000
    ) {
      setCanHonor(true)
    } else {
      setCanHonor(false)
    }
  }, [userInfo])

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
      const targetUserRef = doc(db, 'users', targetUserId)

      // Mettre à jour le timestamp et incrémenter la quantité dans honored
      await updateDoc(userRef, {
        'honored.timestamp': currentTime,
        'honored.quantity': increment(1)
      })

      // Incrémenter le compteur honor de targetUser
      await updateDoc(targetUserRef, {
        honor: increment(1)
      })

      playSuccess()
      toast.success(`Vous avez honoré ${targetUser.username} !`)

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
