import { useContext } from 'react'
import { MatchmakingContext } from '../providers/MatchmakingProvider'
import '../../styles/pages/matchmakingQueue.scss'
import { FaSearch } from 'react-icons/fa'

const MatchmakingTracker = () => {
  const { matchmakingSearch, searchTime, handleStopMatchmaking } = useContext(MatchmakingContext)

  if (matchmakingSearch) {
    return (
      <div className="matchmaking-tracker" onClick={handleStopMatchmaking}>
        <FaSearch size={40} />
        <span className="hidden-span">
          {matchmakingSearch === 'quick' ? 'Partie rapide ' : 'Partie classée '} - {searchTime}{' '}
          <small>(cliquez pour annuler)</small>
        </span>
      </div>
    )
  }
}
export default MatchmakingTracker
