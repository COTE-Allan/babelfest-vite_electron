import BackButton from '../items/BackButton'
import MenuCard from '../items/MenuCard'
import RankedCardArena from '../../assets/img/rankedMenuCard.png'
import TutorialCardArena from '../../assets/img/tutorialMenuCard.png'
import QuickplayCardArena from '../../assets/img/quickplayMenuCard.png'
import { useContext } from 'react'
import { AuthContext } from '../../AuthContext'
import { MatchmakingContext } from '../providers/MatchmakingProvider'

const GamemodeSelect = () => {
  const { userInfo } = useContext(AuthContext)
  const { matchmakingSearch } = useContext(MatchmakingContext)
  const isTutorialFinished = userInfo.achievements.includes('HF_tutorial')
  const lockedReason = 'Terminez le tutoriel pour débloquer ce mode de jeu.'
  const levelLockedReason = 'Atteignez le niveau 10 pour débloquer ce mode de jeu.'
  const inSearchReason = 'Quittez la recherche actuelle pour accéder à ce mode de jeu.'

  return (
    <div className="MenuCard-container">
      <div className="MenuCard-container-cards">
        <div className="MenuCard-container-cards-list">
          <MenuCard
            disabled={
              !isTutorialFinished ? lockedReason : matchmakingSearch ? inSearchReason : false
            }
            name="Partie rapide"
            desc="Avec un deck généré aléatoirement, affrontez un adversaire de niveau similaire"
            where="/matchmakingQueue/quick"
            bg={QuickplayCardArena}
          />
          <MenuCard
            disabled={
              !isTutorialFinished ? lockedReason : matchmakingSearch ? inSearchReason : false
            }
            name="Partie custom"
            desc="Jouez entre amis avec des règles modifiables et des decks construits"
            where="/lobbyList"
            bg={RankedCardArena}
          />
          <MenuCard
            disabled={
              !isTutorialFinished
                ? lockedReason
                : userInfo.level <= 10
                  ? levelLockedReason
                  : matchmakingSearch
                    ? inSearchReason
                    : false
            }
            name="Partie classée"
            desc="Affrontez des joueurs avec vos propres decks et grimpez le classement !"
            where="/matchmakingQueue/ranked"
            requiresDeck={true}
            // bg={RankedCardArena}
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
