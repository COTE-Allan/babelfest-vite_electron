import { TbCardsFilled } from 'react-icons/tb'
import ProfilePicture from '../../esthetics/profilePicture'
import { NameAndTitle } from '../../items/NameAndTitle'

export default function PlayerBanner({ user, cardsLeft, color, side, gradient }) {
  return (
    <div
      className={`playerBanner`}
      style={{
        border: 'double 5px transparent',
        backgroundImage: `linear-gradient(white, white), linear-gradient(to bottom, ${color.hex}, ${color.gradient ? color.gradient : color.hex})`,
        backgroundOrigin: 'border-box',
        backgroundClip: 'content-box, border-box',
        opacity: user.disconnected ? 0.5 : 1
      }}
    >
      {side !== 'rival' && (
        <div className="playerBanner-infos">
          <ProfilePicture customUser={user} size={85} />
          <div className="playerBanner-infos-content">
            <NameAndTitle
              user={user}
              nameClass="playerBanner-infos-name"
              titleClass="playerBanner-infos-title"
            />
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
            <NameAndTitle
              user={user}
              nameClass="playerBanner-infos-name"
              titleClass="playerBanner-infos-title"
            />
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
