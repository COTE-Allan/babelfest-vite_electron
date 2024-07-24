import React, { useState, useEffect, useContext } from 'react'
import '../../styles/esthetics/chessTimer.scss'
import { useEndTurn } from '../controllers/PhaseController'
import timerSound from '../../assets/sfx/timer_tick.wav'
import useSound from 'use-sound'
import { GlobalContext } from '../providers/GlobalProvider'
import { AuthContext } from '../../AuthContext'

export default function ChessTimer() {
  const { phase, askForTarget, winner } = useContext(GlobalContext)
  const { userSettings } = useContext(AuthContext)

  const [playTimer] = useSound(timerSound, { volume: userSettings.sfxVolume })
  const timerVal = 31
  const [timer, setTimer] = useState(timerVal)
  const EndTurn = useEndTurn()

  useEffect(() => {
    setTimer(timerVal)
  }, [phase])

  useEffect(() => {
    // Si le timer est déjà à 0, ou si askForTarget est vrai, ou si winner n'est pas null, ne fais rien
    if (timer === 0 || askForTarget || winner !== null) return

    // Crée un intervalle qui décompte chaque seconde
    const intervalId = setInterval(() => {
      setTimer((timer) => timer - 1)

      if (timer === 6) playTimer()

      // Lorsque le timer atteint 0, déclenche une fonction
      if (timer === 1) {
        onTimerEnd()
      }
    }, 1000)

    // Nettoie l'intervalle lors du démontage du composant ou si le timer change
    return () => clearInterval(intervalId)
  }, [timer, askForTarget, winner])

  // Fonction à exécuter lorsque le timer atteint 0
  function onTimerEnd() {
    EndTurn()
  }

  return <div className="chessTimer">{timer - 1}</div>
}
