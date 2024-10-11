import BackButton from '../items/BackButton'
import { useContext, useEffect } from 'react'
import { MatchmakingContext } from '../providers/MatchmakingProvider'
import { useParams, useLocation } from 'react-router-dom'
import Button from '../items/Button'
import { useTransition } from '../../TransitionContext'

const MatchmakingQueue = () => {
  const { matchmakingSearch, searchTime, handleStartMatchmaking, handleStopMatchmaking } =
    useContext(MatchmakingContext)
  const { gamemode } = useParams()
  const location = useLocation()
  const { goHome } = useTransition()
  const selectedDeck = location.state?.deck ?? null

  useEffect(() => {
    if (!matchmakingSearch) {
      handleStartMatchmaking(gamemode, selectedDeck)
    }
  }, [])

  useEffect(() => {
    if (!matchmakingSearch) {
      // goHome()
    }
  }, [matchmakingSearch])

  const handleStop = async () => {
    await handleStopMatchmaking()
    goHome()
  }

  return (
    <div className="matchmaking">
      {matchmakingSearch && (
        <>
          <h1>Recherche en cours...</h1>
          <h2>
            {matchmakingSearch === 'quick' ? 'Partie rapide ' : 'Partie classée '} - {searchTime}
          </h2>
          <small>(Vous pouvez quitter cette page, la recherche ne sera pas interrompue.)</small>
          <div className="matchmaking-control">
            <Button onClick={goHome}>Retour au menu</Button>
            <Button onClick={handleStop}>Annuler la recherche</Button>
          </div>
        </>
      )}
      <BackButton />
    </div>
  )
}
export default MatchmakingQueue
