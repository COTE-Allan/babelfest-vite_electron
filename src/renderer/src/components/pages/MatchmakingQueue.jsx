import BackButton from '../items/BackButton'
import { useContext, useEffect } from 'react'
import { MatchmakingContext } from '../providers/MatchmakingProvider'
import { useParams } from 'react-router-dom'
import '../../styles/pages/matchmakingQueue.scss'

const MatchmakingQueue = () => {
  const { matchmakingSearch, searchTime, handleStartMatchmaking, handleStopMatchmaking } =
    useContext(MatchmakingContext)
  const { gamemode } = useParams()

  useEffect(() => {
    handleStartMatchmaking(gamemode)
  }, [])

  return (
    <div className="matchmaking">
      {matchmakingSearch && (
        <>
          <h1>Recherche en cours...</h1>
          <h2>
            {matchmakingSearch === 'quick' ? 'Partie rapide ' : 'Partie classée '} - {searchTime}
          </h2>
        </>
      )}
      <BackButton clickEvent={handleStopMatchmaking} />
    </div>
  )
}
export default MatchmakingQueue
