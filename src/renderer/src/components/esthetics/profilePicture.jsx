import { useContext } from 'react'
import { AuthContext } from '../../AuthContext'
import '../../styles/esthetics/profilePicture.scss'

export default function ProfilePicture({ size, customUser, border }) {
  const { userInfo } = useContext(AuthContext)
  const defUser = customUser ? customUser : userInfo

  let style = {
    width: size,
    height: size
  }

  if (border) {
    // Si border est un string, on assume qu'il s'agit du hex
    const borderHex = typeof border === 'string' ? border : border.hex
    const borderGradient =
      typeof border === 'object' && border.gradient ? border.gradient : borderHex

    style = {
      ...style,
      border: 'double 5px transparent',
      backgroundImage: `linear-gradient(white, white), linear-gradient(to bottom, ${borderHex}, ${borderGradient})`,
      backgroundOrigin: 'border-box',
      backgroundClip: 'content-box, border-box'
    }
  }

  return (
    <div className="profilePic" style={style}>
      {defUser.profileBorder && (
        <div
          className="profilePic-border"
          style={{ borderImage: `url(${defUser.profileBorder}) 0 fill` }}
        ></div>
      )}
      <img src={defUser.profilePic} alt="Image de profil de l'utilisateur" />
    </div>
  )
}
