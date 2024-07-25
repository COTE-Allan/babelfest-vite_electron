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
        <div
          className="account-profile-pictureContainer"
          style={{
            background: `linear-gradient(180deg, ${userData.primaryColor} 50%, ${userData.secondaryColor} 50%`
          }}
        >
          <ProfilePicture
            size={'100%'}
            customUser={{
              profilePic: userData.profilePic,
              profileBorder: userData.profileBorder
            }}
          />
        </div>
        <ExperienceBar />
        <PlayerBanner user={userData} color={userData.primaryColor} />
        <Button className="account-profile-logout">Déconnexion</Button>
      </div>
      <div className="account-main">
        <nav className="account-main-nav">
          <Button
            onClick={() => handleSwitchPage(1)}
            className={`account-main-nav-link ${page === 1 && 'selected'}`}
          >
            Statistiques
          </Button>
          <Button
            onClick={() => handleSwitchPage(2)}
            className={`account-main-nav-link ${page === 2 && 'selected'}`}
          >
            Cosmétiques
          </Button>
          <Button
            onClick={() => handleSwitchPage(4)}
            className={`account-main-nav-link ${page === 4 && 'selected'}`}
          >
            Progression
          </Button>
          <Button
            onClick={() => handleSwitchPage(3)}
            className={`account-main-nav-link ${page === 3 && 'selected'}`}
          >
            Modifier mon compte
          </Button>
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
