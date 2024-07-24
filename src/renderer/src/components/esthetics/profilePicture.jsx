import { useContext } from 'react'
import { AuthContext } from '../../AuthContext'
import '../../styles/esthetics/profilePicture.scss'

export default function ProfilePicture({ size, customUser }) {
  const { userInfo } = useContext(AuthContext)
  const defUser = customUser ? customUser : userInfo
  return (
    <div className="profilePic" style={{ width: size, height: size }}>
      <div
        className="profilePic-border"
        style={{ borderImage: `url(${defUser.profileBorder}) 0 fill` }}
      ></div>
      <img src={defUser.profilePic} alt="Image de profil de l'utilisateur" />
    </div>
  )
}
