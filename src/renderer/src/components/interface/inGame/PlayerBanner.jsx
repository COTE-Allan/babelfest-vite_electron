import { TbCardsFilled } from 'react-icons/tb'
import ProfilePicture from '../../esthetics/profilePicture'

export default function PlayerBanner({ user, cardsLeft, color, side }) {
  return (
    <div
      className={`playerBanner`}
      style={{
        border: `${color} 5px solid`,
        opacity: user.disconnected ? 0.5 : 1
      }}
    >
      {side !== 'rival' && (
        <div className="playerBanner-infos">
          <ProfilePicture customUser={user} size={85} />
          <div className="playerBanner-infos-content">
            <span className="playerBanner-infos-name">
              {user.disconnected ? 'Deconnecté' : user.username}
            </span>
            {!user.disconnected && (
              <span className="playerBanner-infos-title">
                {user.title === 'level' ? 'Niveau ' + user.level : user.title}
              </span>
            )}
          </div>
        </div>
      )}

      {cardsLeft && (
        <div className="playerBanner-cardsLeft">
          <TbCardsFilled />
          <span>{cardsLeft}</span>
        </div>
      )}
      {side === 'rival' && (
        <div className="playerBanner-infos">
          <div className="playerBanner-infos-content">
            <span className="playerBanner-infos-name">
              {user.disconnected ? 'Deconnecté' : user.username}
            </span>
            {!user.disconnected && (
              <span className="playerBanner-infos-title">
                {user.title === 'level' ? 'Niveau ' + user.level : user.title}
              </span>
            )}
          </div>
          <ProfilePicture customUser={user} size={85} />
        </div>
      )}
      <div className={`playerBanner-background-filter ${side}`}></div>

      <img
        className={`playerBanner-background ${side}`}
        src={user.banner}
        alt="Bannière du joueur"
      />
    </div>
  )
}
