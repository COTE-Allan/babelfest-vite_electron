import { useContext, useEffect, useState } from 'react'

import ColorSkins from '../accountEditor/ColorSkins'
import ProfilePics from '../accountEditor/ProfilePics'
import BorderProfile from '../accountEditor/BorderProfile'
import BorderArena from '../accountEditor/BorderArena'
import { GiCancel, GiConfirmed } from 'react-icons/gi'
import { AuthContext } from '../../AuthContext'
import Button from '../items/Button'
import UserTitle from './UserTitle'
import UserBanner from './UserBanner'

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
  setBanner
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
  }

  const handleUpdateUser = () => {
    let updates = {}
    let isValidUpdate = true

    // Check if both primary and secondary are selected and different
    if (selectedPrimary && selectedSecondary) {
      isValidUpdate = selectedPrimary !== selectedSecondary
    }
    // Check if only one is selected and it's different from the existing other color
    else if (selectedPrimary || selectedSecondary) {
      isValidUpdate =
        selectedPrimary !== userInfo.secondaryColor && selectedSecondary !== userInfo.primaryColor
    }

    if (isValidUpdate) {
      if (profile) updates.profilePic = profile
      if (selectedPrimary) updates.primaryColor = selectedPrimary
      if (selectedSecondary) updates.secondaryColor = selectedSecondary
      if (border) updates.profileBorder = border
      if (arena.length !== 0) updates.arena = arena[0]
      if (arena.length !== 0) updates.arenaReverse = arena[1]
      if (title) updates.title = title
      if (banner) updates.banner = banner

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
      banner == null
    ) {
      setNeedUpdate(false)
    } else {
      setNeedUpdate(true)
    }
  }, [profile, border, selectedPrimary, selectedSecondary, arena, title, banner])

  return (
    <div className="cosmetics">
      <nav className="cosmetics-nav">
        <div className="cosmetics-nav-list">
          <Button
            onClick={() => handleSwitchPage(1)}
            className={`cosmetics-nav-link ${page === 1 && 'selected'}`}
          >
            Avatar
          </Button>
          <Button
            onClick={() => handleSwitchPage(2)}
            className={`cosmetics-nav-link ${page === 2 && 'selected'}`}
          >
            Cadre d'avatar
          </Button>
          <Button
            onClick={() => handleSwitchPage(5)}
            className={`cosmetics-nav-link ${page === 5 && 'selected'}`}
          >
            Titre de joueur
          </Button>
          <Button
            onClick={() => handleSwitchPage(6)}
            className={`cosmetics-nav-link ${page === 6 && 'selected'}`}
          >
            Bannière de joueur
          </Button>
          <Button
            onClick={() => handleSwitchPage(3)}
            className={`cosmetics-nav-link ${page === 3 && 'selected'}`}
          >
            Couleurs d'arène
          </Button>
        </div>
        {needUpdate && (
          <div className="cosmetics-controls">
            <span className="warning">Vous avez des changements non sauvegardés !</span>
            <Button onClick={handleUpdateUser}>
              <GiConfirmed size={30} /> Valider
            </Button>
            <Button onClick={cancelUpdate}>
              <GiCancel size={30} /> Annuler
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
        {page === 4 && <BorderArena arena={arena} setArena={setArena} />}
        {page === 5 && <UserTitle title={title} setTitle={setTitle} />}
        {page === 6 && <UserBanner banner={banner} setBanner={setBanner} />}
      </div>
    </div>
  )
}
