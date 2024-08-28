import React, { useContext, useEffect, useState } from 'react'

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
import MatchSummaries from '../interface/MatchSummaries'
import { useParams } from 'react-router-dom'

const Account = () => {
  const { userInfo } = useContext(AuthContext)

  const { defaultPage } = useParams()
  const [page, setPage] = useState(0)

  useEffect(() => {
    setPage(Number(defaultPage) !== 0 ? Number(defaultPage) : 2)
  }, [defaultPage])

  const [profile, setProfile] = useState(null)
  const [border, setBorder] = useState(null)
  const [arena, setArena] = useState([])
  const [selectedPrimary, setSelectedPrimary] = useState(null)
  const [selectedSecondary, setSelectedSecondary] = useState(null)
  const [title, setTitle] = useState(null)
  const [banner, setBanner] = useState(null)
  const [prestige, setPrestige] = useState(null)

  const userData = {
    username: userInfo.username,
    primaryColor: selectedPrimary ? selectedPrimary : userInfo.primaryColor,
    secondaryColor: selectedSecondary ? selectedSecondary : userInfo.secondaryColor,
    profilePic: profile ? profile : userInfo.profilePic,
    profileBorder: border ? border : userInfo.profileBorder,
    arena: arena.length > 0 ? arena : userInfo.arena,
    title: title ? title : userInfo.title,
    banner: banner ? banner : userInfo.banner,
    level: userInfo.level,
    prestige: prestige ? prestige : userInfo.prestige
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
    setBanner,
    prestige,
    setPrestige
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
      </div>
      <div className="account-main">
        <nav className="account-main-nav">
          <HudNavLink to={'/account/1'} selected={page === 1} permOpen>
            <FaUserAlt size={45} />
            <span className="hidden-span">Statistiques</span>
          </HudNavLink>
          <HudNavLink to={'/account/2'} selected={page === 2} permOpen>
            <FaTshirt size={45} />
            <span className="hidden-span">Customisation</span>
          </HudNavLink>
          <HudNavLink to={'/account/4'} selected={page === 4} permOpen>
            <FaTrophy size={45} />
            <span className="hidden-span">Progression</span>
          </HudNavLink>
          <HudNavLink to={'/account/3'} selected={page === 3} permOpen>
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
