import BackButton from '../items/BackButton'
import MenuCard from '../items/MenuCard'
import RankedCardArena from '../../assets/img/rankedMenuCard.png'
import TutorialCardArena from '../../assets/img/tutorialMenuCard.png'
import QuickplayCardArena from '../../assets/img/quickplayMenuCard.png'
import { useContext } from 'react'
import { AuthContext } from '../../AuthContext'
const GamemodeSelect = () => {
  const { userInfo } = useContext(AuthContext)
  let isTutorialFinished = userInfo.achievements.includes('HF_tutorial')
  const lockedReason = 'Terminez le tutoriel pour débloquer ce mode de jeu.'

  return (
    <div className="MenuCard-container">
      <div className="MenuCard-container-cards">
        <div className="MenuCard-container-cards-list">
          <MenuCard
            disabled={!isTutorialFinished ? lockedReason : false}
            name="Partie rapide"
            desc="Affrontez un adversaire aléatoire de niveau similaire"
            where="/matchmakingQueue/quick"
            bg={QuickplayCardArena}
          />
          <MenuCard
            disabled={!isTutorialFinished ? lockedReason : false}
            name="Partie custom"
            desc="Jouez entre amis avec des règles modifiables"
            where="/lobbyList"
            bg={RankedCardArena}
          />
          <MenuCard disabled={"Ce mode de jeu n'est pas encore disponible."} />
        </div>
        <div className="MenuCard-container-cards-list">
          <MenuCard
            classNames="small"
            name="Tutoriel"
            desc="Découvrez comment jouer avec un court tutoriel"
            where="/tutorial"
            bg={TutorialCardArena}
          />
          {/* <MenuCard classNames="small" disabled={"Ce mode de jeu n'est pas encore disponible."} /> */}
        </div>
      </div>
      <BackButton />
    </div>
  )
}
export default GamemodeSelect
