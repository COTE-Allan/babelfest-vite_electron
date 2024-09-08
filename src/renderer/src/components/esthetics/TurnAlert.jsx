import { useEffect, useState, useContext } from 'react'
import { GlobalContext } from '../providers/GlobalProvider'
import '../../styles/esthetics/TurnAlert.scss'
import useSound from 'use-sound'
import notifSfx from '../../assets/sfx/notification_urturn.wav'
import { AuthContext } from '../../AuthContext'
import { getBackgroundStyle } from '../others/toolBox'

export default function TurnAlert() {
  const { myTurn, phase, hand, host, myColor, rivalColor } = useContext(GlobalContext)
  const phases = [
    'Phase de préparation',
    'Phase de déplacement',
    "Phase d'attaque",
    'Phase de troc'
  ]

  const { userSettings } = useContext(AuthContext)

  const [notif] = useSound(notifSfx, { volume: userSettings.sfxVolume })

  const [animation, setAnimation] = useState(true)

  useEffect(() => {
    const turnText = myTurn ? 'À vous de jouer' : "Tour de l'adversaire"
    const phaseText = phases[phase - 1] // Assuming phase is always between 1 and 4

    setAnimation(true)

    setTimeout(() => {
      setAnimation(false)
    }, 2000)

    setTurnTxt(phase === 0 ? 'Début de la partie !' : turnText)
    setPhaseTxt(phase === 0 ? 'Distribution et échange des cartes' : phaseText)
  }, [myTurn, phase])

  useEffect(() => {
    if (myTurn) {
      notif()
    }
  }, [myTurn])

  const [turnTxt, setTurnTxt] = useState('')
  const [phaseTxt, setPhaseTxt] = useState('')

  return (
    <div
      className={`turnAlert ${animation ? 'animation' : ''}`}
      style={{
        background: host && myTurn ? getBackgroundStyle(myColor, "to right") : getBackgroundStyle(rivalColor, "to right")
      }}
    >
      <h1>{turnTxt}</h1>
      <h2>{phaseTxt}</h2>
    </div>
  )
}
