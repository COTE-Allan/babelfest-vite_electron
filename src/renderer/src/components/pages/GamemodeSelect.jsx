import BackButton from '../items/BackButton'
import MenuCard from '../items/MenuCard'
import TutorialCardArena from '../../assets/img/gamemode_tutoriel.png'
import RankedCardArena from '../../assets/img/gamemode_ranked.png'
import CustomCardArena from '../../assets/img/gamemode_custom.png'
import QuickplayCardArena from '../../assets/img/gamemode_quick.png'
import { useContext } from 'react'
import { AuthContext } from '../../AuthContext'
import { MatchmakingContext } from '../providers/MatchmakingProvider'
import { ServerContext } from '../../ServerContext'

const GamemodeSelect = () => {
  const { userInfo } = useContext(AuthContext)
  const { serverStatus } = useContext(ServerContext)
  const { matchmakingSearch } = useContext(MatchmakingContext)
  const isTutorialFinished = userInfo.achievements.includes('HF_tutorial')
  const isServerOnline = serverStatus === 'online'

  const lockedReason = 'Terminez le tutoriel pour débloquer ce mode de jeu.'
  const levelLockedReason = 'Atteignez le niveau 10 pour débloquer ce mode de jeu.'
  const inSearchReason = 'Quittez la recherche actuelle pour accéder à ce mode de jeu.'
  const serverNotOnline = 'Les serveurs ne sont pas activés pour le moment.'
  return (
    <div className="MenuCard-container">
      <div className="MenuCard-container-cards">
        <div className="MenuCard-container-cards-list">
          <MenuCard
            disabled={
              !isTutorialFinished
                ? lockedReason
                : matchmakingSearch
                  ? inSearchReason
                  : isServerOnline
                    ? false
                    : serverNotOnline
            }
            name="Partie rapide"
            desc="Avec un deck aléatoire, affrontez un adversaire de niveau similaire"
            where="/matchmakingQueue/quick"
            bg={QuickplayCardArena}
          />
          <MenuCard
            disabled={
              !isTutorialFinished
                ? lockedReason
                : matchmakingSearch
                  ? inSearchReason
                  : isServerOnline
                    ? false
                    : serverNotOnline
            }
            name="Partie custom"
            desc="Jouez entre amis avec des règles spéciales et modifiables"
            where="/lobbyList"
            bg={CustomCardArena}
          />
          <MenuCard
            disabled={
              !isTutorialFinished
                ? lockedReason
                : userInfo.stats.level >= 10
                  ? matchmakingSearch
                    ? inSearchReason
                    : isServerOnline
                      ? false
                      : serverNotOnline
                  : levelLockedReason
            }
            name="Partie classée"
            desc="Affrontez des joueurs avec vos propres decks et grimpez le classement !"
            where="/matchmakingQueue/ranked"
            requiresDeck={true}
            bg={RankedCardArena}
          />
        </div>
        <div className="MenuCard-container-cards-list">
          <MenuCard
            disabled={matchmakingSearch ? inSearchReason : false}
            classNames="small"
            name="Tutoriel"
            desc="Découvrez comment jouer avec un court tutoriel"
            where="/tutorial"
            bg={TutorialCardArena}
          />
          {/* Autres cartes éventuelles */}
        </div>
      </div>
      <BackButton />
    </div>
  )
}

export default GamemodeSelect
