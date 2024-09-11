import BackButton from '../items/BackButton'
import { useContext, useEffect } from 'react'
import { MatchmakingContext } from '../providers/MatchmakingProvider'
import { useParams } from 'react-router-dom'
import Button from '../items/Button'
import { useTransition } from '../../TransitionContext'

const MatchmakingQueue = () => {
  const { matchmakingSearch, searchTime, handleStartMatchmaking, handleStopMatchmaking } =
    useContext(MatchmakingContext)
  const { gamemode } = useParams()
  const { goHome } = useTransition()

  const randomTips = [
    "Placez une carte sur votre base pour la protéger d'une capture !",
    "Réfléchissez bien à l'ordre de vos attaques...",
    "N'oubliez jamais quel joueur à la priorité sur le tour !", 
    "Est ce que vous avez déjà essayer d'attaquer vos propres cartes ?",
    "Babelfest était à l'origine un concept de jeu de combat.",
    'Le terme Babel se réfère à la bibliothèque de Babel.'
  ]

  useEffect(() => {
    if (!matchmakingSearch) {
      handleStartMatchmaking(gamemode)
    }
  }, [])

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
