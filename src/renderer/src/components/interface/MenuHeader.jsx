import { NavLink } from 'react-router-dom'
import bbfLogoSm from '../../assets/svg/babelfest_small.svg'
import '../../styles/interface/menuHeader.scss'
import { useState, useContext } from 'react'
import MusicPlayer from './musicPlayer'
import HudNavLink from '../items/hudNavLink'
import { AuthContext } from '../../AuthContext'
import ProfilePicture from '../esthetics/profilePicture'

import { IoLibrarySharp, IoLogOut } from 'react-icons/io5'
import { FaPlay, FaSearch, FaUserFriends } from 'react-icons/fa'
import { SiCodemagic } from 'react-icons/si'
import { IoMdSettings } from 'react-icons/io'
import { MdArticle, MdLeaderboard, MdMusicNote } from 'react-icons/md'
import Modal from '../items/ClassicModal'
import Button from '../items/Button'
import Clock from '../esthetics/Clock'
import { MatchmakingContext } from '../providers/MatchmakingProvider'
import { GiArena } from 'react-icons/gi'

export default function MenuHeader() {
  const [musicPlayer, setMusicPlayer] = useState(false)
  const [askForLogout, setAskForLogout] = useState(false)

  const { user } = useContext(AuthContext)
  const { matchmakingSearch, searchTime } = useContext(MatchmakingContext)

  const handleLeaveGame = () => {
    if (askForLogout) {
      // Envoyer un événement IPC pour fermer l'application
      window.api.send('close-app')
      setAskForLogout(false)
    } else {
      setAskForLogout(true)
    }
  }
  let headerClasses = 'menuHeader fade-in'

  return (
    <header className={headerClasses}>
      <div className="menuHeader-box">
        <div className="menuHeader-logo-container">
          <NavLink to={'/home'}>
            <img src={bbfLogoSm} alt="Logo du jeu Babelfest en petit" className="menuHeader-logo" />
          </NavLink>
          <Clock />
        </div>
        <nav className="menuHeader-nav">
          <HudNavLink to={'/home'}>
            <FaPlay size={35} />
            <span className="hidden-span">Jouer</span>
          </HudNavLink>
          <HudNavLink to={'/library'}>
            <IoLibrarySharp size={40} /> <span className="hidden-span">Catalogue</span>
          </HudNavLink>
          <HudNavLink to={'/effects'}>
            <SiCodemagic size={40} />
            <span className="hidden-span">Effets</span>
          </HudNavLink>
          <HudNavLink to={'/arenasList'}>
            <GiArena size={40} />
            <span className="hidden-span">Arènes</span>
          </HudNavLink>
          <HudNavLink to={'/leaderboards'}>
            <MdLeaderboard size={40} />
            <span className="hidden-span">Classements</span>
          </HudNavLink>
          <a
            className="hudNavLink"
            href="https://blog.babelfest.fr"
            target="_blank"
            rel="noreferrer"
          >
            <MdArticle size={40} />
            <span className="hidden-span">Blog</span>
          </a>
          {matchmakingSearch && (
            <HudNavLink to={'/home'} className="special">
              <FaSearch size={40} />
              <span className="hidden-span">Recherche en cours...</span>
              <span className="hidden-span">
                {matchmakingSearch === 'quick' ? 'Partie rapide ' : 'Partie classée '}- {searchTime}
              </span>
            </HudNavLink>
          )}
        </nav>
      </div>
      <div className="menuHeader-box">
        <nav className="menuHeader-nav">
          {user && (
            <HudNavLink className={'disabled'}>
              <span className="hidden-span">Amis</span>
              <FaUserFriends size={40} />
            </HudNavLink>
          )}
          <HudNavLink onClick={() => setMusicPlayer(!musicPlayer)}>
            <span className="hidden-span">Musique</span>
            <MdMusicNote size={40} />
          </HudNavLink>
          <HudNavLink to={'/settings'}>
            <span className="hidden-span"> Paramètres</span>
            <IoMdSettings size={40} />
          </HudNavLink>
          <HudNavLink onClick={handleLeaveGame}>
            <span className="hidden-span">Quitter</span>
            <IoLogOut size={40} />
          </HudNavLink>
          {user && (
            <HudNavLink to={'/account'}>
              <span className="hidden-span">Profil</span>
              <ProfilePicture size={60} />
            </HudNavLink>
          )}
        </nav>
      </div>
      <div className={`menuHeader-musicBox ${musicPlayer ? 'active' : ''}`}>
        <MusicPlayer role={'menu'} />
      </div>
      {askForLogout && (
        <Modal>
          <div className="modal-container">
            <span>Voulez-vous vraiment quitter Babelfest ?</span>
            <Button onClick={handleLeaveGame}>Confirmer</Button>
            <Button onClick={() => setAskForLogout(false)}>Retour</Button>
          </div>
        </Modal>
      )}
    </header>
  )
}
