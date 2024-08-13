import React, { useContext, useState } from 'react'

import { AuthContext } from '../../AuthContext'

import '../../styles/pages/home.scss'
import '../../styles/pages/account.scss'
import '../../styles/accountEditor/skins.scss'

import ProfilePicture from '../esthetics/profilePicture'
import CosmecticsController from '../accountEditor/CosmeticsController'
import Button from '../items/Button'
import UserSettingsController from '../accountEditor/UserSettingsController'
import PlayerBanner from '../interface/inGame/PlayerBanner'
import ExperienceBar from '../interface/ExperienceBar'
import UserStatsController from '../accountEditor/UserStatsController'
import UserAchievements from '../accountEditor/UserAchievements'
import { FaBookOpen, FaCog, FaTrophy, FaTshirt, FaUserAlt } from 'react-icons/fa'
import HudNavLink from '../items/hudNavLink'

const Account = () => {
  const { userInfo } = useContext(AuthContext)
  const [page, setPage] = useState(2)

  const [profile, setProfile] = useState(null)
  const [border, setBorder] = useState(null)
  const [arena, setArena] = useState([])
  const [selectedPrimary, setSelectedPrimary] = useState(null)
  const [selectedSecondary, setSelectedSecondary] = useState(null)
  const [title, setTitle] = useState(null)
  const [banner, setBanner] = useState(null)

  const handleSwitchPage = (id) => {
    setPage(id)
  }

  const userData = {
    username: userInfo.username,
    primaryColor: selectedPrimary ? selectedPrimary : userInfo.primaryColor,
    secondaryColor: selectedSecondary ? selectedSecondary : userInfo.secondaryColor,
    profilePic: profile ? profile : userInfo.profilePic,
    profileBorder: border ? border : userInfo.profileBorder,
    arena: arena.length > 0 ? arena : userInfo.arena,
    title: title ? title : userInfo.title,
    banner: banner ? banner : userInfo.banner,
    level: userInfo.level
  }

  let props = {
    userData,
    profile,
    border,
    arena,
    title,
    banner,
    selectedPrimary,
    selectedSecondary,
    setProfile,
    setBorder,
    setArena,
    setSelectedPrimary,
    setSelectedSecondary,
    setTitle,
    setBanner
  }

  return (
    <div className="account">
      <div className="account-profile">
        <ProfilePicture
          size={300}
          customUser={{
            profilePic: userData.profilePic,
            profileBorder: userData.profileBorder
          }}
        />
        <ExperienceBar />
        <PlayerBanner user={userData} color={userData.primaryColor} />
        <Button className="account-profile-logout">Déconnexion</Button>
      </div>
      <div className="account-main">
        <nav className="account-main-nav">
          <HudNavLink onClick={() => handleSwitchPage(1)} selected={page === 1} permOpen>
            <FaUserAlt size={45} />
            <span className="hidden-span">Statistiques</span>
          </HudNavLink>
          <HudNavLink permOpen className={'disabled'}>
            <FaBookOpen size={45} />
            <span className="hidden-span">Historique</span>
          </HudNavLink>
          <HudNavLink onClick={() => handleSwitchPage(2)} selected={page === 2} permOpen>
            <FaTshirt size={45} />
            <span className="hidden-span">Customisation</span>
          </HudNavLink>
          <HudNavLink onClick={() => handleSwitchPage(4)} selected={page === 4} permOpen>
            <FaTrophy size={45} />
            <span className="hidden-span">Progression</span>
          </HudNavLink>
          <HudNavLink onClick={() => handleSwitchPage(3)} selected={page === 3} permOpen>
            <FaCog size={45} />
            <span className="hidden-span">Modifier Profil</span>
          </HudNavLink>
        </nav>
        <div className="account-main-content">
          {page === 1 && <UserStatsController />}
          {page === 2 && <CosmecticsController {...props} />}
          {page === 3 && <UserSettingsController />}
          {page === 4 && <UserAchievements />}
        </div>
      </div>
    </div>
  )
}

export default Account
