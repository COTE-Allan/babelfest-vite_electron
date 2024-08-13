import ProfilePicture from '../esthetics/profilePicture'
import '../../styles/items/leaderboardPlayerBanner.scss'
import { useNavigate } from 'react-router-dom'

export default function LeaderboardPlayerBanner({ user, accessProfile }) {
  const navigate = useNavigate()
  return (
    <div
      className="leaderboardPlayerBanner"
      onClick={() => {
        if (accessProfile) {
          navigate(`/userProfile/${user.id}`)
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
        <h1>{user.username}</h1>
        <h2>{user.title === 'level' ? `Niveau ${user.level}` : user.title}</h2>
      </div>
    </div>
  )
}
