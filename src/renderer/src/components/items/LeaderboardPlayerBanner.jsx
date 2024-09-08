import ProfilePicture from '../esthetics/profilePicture'
import '../../styles/items/leaderboardPlayerBanner.scss'
import { useNavigate } from 'react-router-dom'
import { NameAndTitle } from './NameAndTitle'
import { useTransition } from '../../TransitionContext'
import { TbCardsFilled } from 'react-icons/tb'

export default function LeaderboardPlayerBanner({ user, accessProfile, cards }) {
  const { goForward } = useTransition()

  return (
    <div
      className="leaderboardPlayerBanner"
      onClick={() => {
        if (accessProfile) {
          goForward(`/account/${user.id}`)
        }
      }}
    >
      <img src={user.banner} alt="bannière du joueur" className="leaderboardPlayerBanner-banner" />
      <ProfilePicture
        size={75}
        customUser={{
          profilePic: user.profilePic,
          profileBorder: user.profileBorder
        }}
        border={user.primaryColor}
      />
      <div className="leaderboardPlayerBanner-content">
        <NameAndTitle user={user} />
      </div>
      
      {cards && (
        <div className="playerBanner-cardsLeft">
          <TbCardsFilled />
          <span>{cards}</span>
        </div>
      )}

    </div>
  )
}
