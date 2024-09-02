import { useContext, useEffect, useState } from 'react'

import ColorSkins from '../accountEditor/ColorSkins'
import ProfilePics from '../accountEditor/ProfilePics'
import BorderProfile from '../accountEditor/BorderProfile'
import { GiCancel, GiConfirmed } from 'react-icons/gi'
import { AuthContext } from '../../AuthContext'
import Button from '../items/Button'
import UserTitle from './UserTitle'
import UserBanner from './UserBanner'
import HudNavLink from '../items/hudNavLink'
import { FaTshirt } from 'react-icons/fa'
import { BiSolidUserRectangle } from 'react-icons/bi'
import { FaBorderTopLeft } from 'react-icons/fa6'
import { MdOutlineTitle } from 'react-icons/md'
import { PiFlagBannerFill } from 'react-icons/pi'
import { IoIosColorPalette } from 'react-icons/io'
import { AiFillGold } from 'react-icons/ai'
import UserPrestige from './UserPrestige'

export default function CosmecticsController({
  profile,
  setProfile,
  border,
  setBorder,
  arena,
  title,
  banner,
  setArena,
  selectedPrimary,
  setSelectedPrimary,
  selectedSecondary,
  setSelectedSecondary,
  setTitle,
  setBanner,
  prestige,
  setPrestige
}) {
  const [page, setPage] = useState(1)
  const [needUpdate, setNeedUpdate] = useState(false)

  const { updateUser, userInfo } = useContext(AuthContext)

  const handleSwitchPage = (id) => {
    setPage(id)
  }

  const cancelUpdate = () => {
    setProfile(null)
    setBorder(null)
    setSelectedPrimary(null)
    setSelectedSecondary(null)
    setArena([])
    setTitle(null)
    setBanner(null)
    setPrestige(null)
  }

  const handleUpdateUser = () => {
    let updates = {}
    let isValidUpdate = true

    // Check if both primary and secondary are selected and different
    if (selectedPrimary && selectedSecondary) {
      isValidUpdate = selectedPrimary.hex !== selectedSecondary.hex
    }
    // Check if only one is selected and it's different from the existing other color
    else if (selectedPrimary || selectedSecondary) {
      isValidUpdate =
        selectedPrimary?.hex !== userInfo.secondaryColor &&
        selectedSecondary?.hex !== userInfo.primaryColor
    }

    if (isValidUpdate) {
      if (profile) updates.profilePic = profile
      if (selectedPrimary) {
        updates.primaryColor = selectedPrimary
      }
      if (selectedSecondary) {
        updates.secondaryColor = selectedSecondary
      }
      if (border) updates.profileBorder = border
      if (arena.length !== 0) updates.arena = arena[0]
      if (arena.length !== 0) updates.arenaReverse = arena[1]
      if (title) updates.title = title
      if (banner) updates.banner = banner
      if (prestige) updates.prestige = prestige

      if (Object.keys(updates).length !== 0) updateUser(updates)
      cancelUpdate()
    } else {
      toast.error('Les couleurs primaire et secondaire doivent être différentes.')
    }
  }

  useEffect(() => {
    if (
      profile == null &&
      border == null &&
      selectedPrimary == null &&
      selectedSecondary == null &&
      arena.length == 0 &&
      title == null &&
      banner == null &&
      prestige == null
    ) {
      setNeedUpdate(false)
    } else {
      setNeedUpdate(true)
    }
  }, [profile, border, selectedPrimary, selectedSecondary, arena, title, banner, prestige])

  return (
    <div className="cosmetics">
      <nav className="cosmetics-nav">
        <div className="cosmetics-nav-list">
          <HudNavLink onClick={() => handleSwitchPage(1)} selected={page === 1} permOpen>
            <BiSolidUserRectangle size={45} />
            <span className="hidden-span">Avatar</span>
          </HudNavLink>
          <HudNavLink onClick={() => handleSwitchPage(2)} selected={page === 2} permOpen>
            <FaBorderTopLeft size={45} />
            <span className="hidden-span">Cadre</span>
          </HudNavLink>
          <HudNavLink onClick={() => handleSwitchPage(5)} selected={page === 5} permOpen>
            <MdOutlineTitle size={45} />
            <span className="hidden-span">Titre</span>
          </HudNavLink>
          <HudNavLink onClick={() => handleSwitchPage(6)} selected={page === 6} permOpen>
            <PiFlagBannerFill size={45} />
            <span className="hidden-span">Bannière</span>
          </HudNavLink>
          <HudNavLink onClick={() => handleSwitchPage(3)} selected={page === 3} permOpen>
            <IoIosColorPalette size={45} />
            <span className="hidden-span">Couleurs</span>
          </HudNavLink>
          <HudNavLink selected={page === 7} onClick={() => handleSwitchPage(7)} permOpen>
            <AiFillGold size={45} />
            <span className="hidden-span">Prestige</span>
          </HudNavLink>
        </div>
        {needUpdate && (
          <div className="cosmetics-controls">
            <span className="warning">Vous avez des changements non sauvegardés !</span>
            <Button onClick={handleUpdateUser}>
              <GiConfirmed size={25} /> Valider
            </Button>
            <Button onClick={cancelUpdate}>
              <GiCancel size={25} /> Annuler
            </Button>
          </div>
        )}
      </nav>
      <div className="cosmetics-content">
        {page === 3 && (
          <ColorSkins
            selectedPrimary={selectedPrimary}
            selectedSecondary={selectedSecondary}
            setSelectedPrimary={setSelectedPrimary}
            setSelectedSecondary={setSelectedSecondary}
          />
        )}
        {page === 1 && <ProfilePics profile={profile} setProfile={setProfile} />}
        {page === 2 && <BorderProfile border={border} setBorder={setBorder} />}
        {page === 5 && <UserTitle title={title} setTitle={setTitle} />}
        {page === 6 && <UserBanner banner={banner} setBanner={setBanner} />}
        {page === 7 && <UserPrestige prestige={prestige} setPrestige={setPrestige} />}
      </div>
    </div>
  )
}
