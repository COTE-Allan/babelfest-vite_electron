import { useEffect, useState, useContext } from 'react'
import { GlobalContext } from '../providers/GlobalProvider'
import '../../styles/esthetics/TurnAlert.scss'
import useSound from 'use-sound'
import notifSfx from '../../assets/sfx/notification_urturn.wav'
import { AuthContext } from '../../AuthContext'
import { getBackgroundStyle } from '../others/toolBox'

export default function TurnAlert() {
  const { myTurn, phase, hand, playerSelf, playerRival, myColor, rivalColor, isSpectator } =
    useContext(GlobalContext)

  const phases = [
    'Phase de préparation',
    'Phase de déplacement',
    "Phase d'attaque",
    'Phase de troc'
  ]

  const { userSettings } = useContext(AuthContext)

  const [notif] = useSound(notifSfx, { volume: userSettings.sfxVolume })

  const [animation, setAnimation] = useState(true)
  const [turnTxt, setTurnTxt] = useState('')
  const [phaseTxt, setPhaseTxt] = useState('')

  useEffect(() => {
    let turnText = ''
    let phaseText = phases[phase - 1] // En supposant que phase est entre 1 et 4

    setAnimation(true)
    setTimeout(() => {
      setAnimation(false)
    }, 2000)

    if (isSpectator) {
      const currentPlayerName = myTurn ? playerSelf.username : playerRival.username
      turnText = `Au tour de ${currentPlayerName}`
    } else {
      turnText = myTurn ? 'À vous de jouer' : "Tour de l'adversaire"
    }

    setTurnTxt(turnText)
    setPhaseTxt(phaseText)
  }, [myTurn, phase])

  useEffect(() => {
    if (myTurn && !isSpectator) {
      notif()
    }
  }, [myTurn, isSpectator])

  return (
    <div
      className={`turnAlert ${animation ? 'animation' : ''}`}
      style={{
        background: myTurn
          ? getBackgroundStyle(myColor, 'to right')
          : getBackgroundStyle(rivalColor, 'to right')
      }}
    >
      <h1>{turnTxt}</h1>
      <h2>{phaseTxt}</h2>
    </div>
  )
}
