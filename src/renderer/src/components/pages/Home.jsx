import { useLocation } from 'react-router-dom'
import ProfilePicture from '../esthetics/profilePicture'

import '../../styles/pages/home.scss'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'
import { useContext, useEffect, useState } from 'react'
import { getFeaturedCards, getOnlineUsers, shuffleArray } from '../others/toolBox'
import { AuthContext } from '../../AuthContext'
import useSound from 'use-sound'
import ClassicModal from '../items/ClassicModal'
import Button from '../items/Button'
import { useJoinLobby, useLeaveLobby } from '../controllers/ManageLobbyAndGame'
import axios from 'axios'
import changelog from '../../jsons/changelog.json'

import Logo from '../../assets/svg/babelfest.svg'
import LogoAnimate from '../../assets/svg/logo_babelfest_animated.svg'
import { FaCircle, FaCompactDisc, FaDiscord, FaPlay, FaScroll, FaYoutube } from 'react-icons/fa'
import { IoLibrarySharp, IoLogOut } from 'react-icons/io5'
import { FaXTwitter } from 'react-icons/fa6'
import { MdLeaderboard } from 'react-icons/md'
import { IoMdSettings } from 'react-icons/io'
import { useTransition } from '../../TransitionContext'
import MusicPlayer from '../interface/musicPlayer'
import { useMusic } from '../providers/MusicProvider'

const Home = () => {
  const { isPlaying } = useMusic()
  const [playerCount, setPlayerCount] = useState(0)
  const { goForward } = useTransition()
  const verName = changelog.slice(-1)[0].title

  const { state } = useLocation()
  const joinLobby = useJoinLobby()
  const leaveLobby = useLeaveLobby()
  const [lastBlogPost, setLastBlogPost] = useState(null)
  const { userSettings, user } = useContext(AuthContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const [featuredCards, setFeaturedCards] = useState(null)
  const [askForLogout, setAskForLogout] = useState(false)

  const handleLeaveGame = () => {
    if (askForLogout) {
      // Envoyer un événement IPC pour fermer l'application
      window.api.send('close-app')
      setAskForLogout(false)
    } else {
      setAskForLogout(true)
    }
  }

  useEffect(() => {
    setFeaturedCards(shuffleArray(getFeaturedCards()))
    const unsubscribe = getOnlineUsers(setPlayerCount)
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          'https://babelfest.fr/wp-json/wp/v2/posts?_embed&per_page=1'
        )
        if (response.data.length > 0) {
          setLastBlogPost(response.data[0])
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'article :", error)
      }
    }

    fetchPost()
  }, [])

  return (
    <div className="home">
      <span className="home-verName">Babelfest v{verName} par Cielesis</span>
      <div className="home-music">
        <div className="home-music-wrapper">
          <MusicPlayer role="menu" />
        </div>
        <FaCompactDisc className={`disc ${isPlaying && 'rotate'}`} size={40} />
      </div>
      <div className="home-playerCount">
        <div className="home-playerCount-count">
          <FaCircle color="green" />
          {playerCount.length}
        </div>
        {playerCount?.length > 0 && (
          <div className="home-playerCount-list">
            {playerCount.map((user, index) => (
              <div
                key={index}
                className="home-playerCount-list-item"
                onClick={() => goForward(`/account/${user.id}`)}
              >
                {user.username}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="home-col home-nav">
        <img src={Logo} className="logo" alt="Babelfest Logo" />
        <nav>
          <a onClick={() => goForward('/gamemode')} onMouseEnter={hover} onMouseDown={select}>
            <FaPlay size={50} />
            Jouer
          </a>
          <a onClick={() => goForward('/compendium')} onMouseEnter={hover} onMouseDown={select}>
            <IoLibrarySharp size={50} />
            Bibliothèque
          </a>
          <a onClick={() => goForward('/leaderboards')} onMouseEnter={hover} onMouseDown={select}>
            <MdLeaderboard size={50} />
            Classements
          </a>
          <a
            onClick={() => goForward(`/account/${user.uid}`)}
            onMouseEnter={hover}
            onMouseDown={select}
          >
            <ProfilePicture size={35} />
            Profil
          </a>
          <a onClick={() => goForward('/settings')} onMouseEnter={hover} onMouseDown={select}>
            <IoMdSettings size={35} />
            Paramètres
          </a>
          <a onClick={() => goForward('/credits')} onMouseEnter={hover} onMouseDown={select}>
            <FaScroll size={35} />
            Crédits
          </a>
          <a onClick={handleLeaveGame} onMouseEnter={hover} onMouseDown={select}>
            <IoLogOut size={35} />
            Quitter
          </a>
        </nav>
      </div>
      <div className="home-col home-secondary">
        {featuredCards && (
          <div className="home-featured">
            <span>Notre sélection du moment</span>
            <div className="home-featured-list">
              {featuredCards.slice(0, 4).map((card, index) => {
                return (
                  <img
                    onMouseEnter={hover}
                    onClick={() => {
                      select()
                      goForward('/catalog', { state: { selected: card } })
                    }}
                    key={index}
                    src={card.url}
                    alt="Featured card"
                  />
                )
              })}
            </div>
          </div>
        )}

        <div className="home-socials">
          <span>Rejoignez la communauté !</span>
          <div className="home-socials-list">
            <a
              className="home-socials-list-item"
              onMouseEnter={hover}
              onClick={select}
              href="https://x.com/babelfest_"
              target="_blank"
            >
              <FaXTwitter />
            </a>
            <a
              className="home-socials-list-item"
              onMouseEnter={hover}
              onClick={select}
              href="https://discord.com/invite/WYCuMDTt45"
              target="_blank"
            >
              <FaDiscord />
            </a>
            <a
              className="home-socials-list-item"
              onMouseEnter={hover}
              onClick={select}
              href="https://www.youtube.com/channel/UCxZ85Kq0CvJXQu9jAzcNzEw"
              target="_blank"
            >
              <FaYoutube />
            </a>
          </div>
        </div>

        {lastBlogPost ? (
          <a
            href={lastBlogPost.link}
            target="_blank"
            rel="noopener noreferrer"
            className="home-news"
            onMouseEnter={hover}
            onClick={select}
          >
            <span>{lastBlogPost.title.rendered}</span>
            <img src={lastBlogPost.featured_media_src_url} alt="Last blog post" />
          </a>
        ) : (
          <a href="#" className="home-news">
            <img src={LogoAnimate} className="loading" alt="Loading animation" />
          </a>
        )}
      </div>

      {state?.askToRejoin && (
        <ClassicModal>
          <p>Il semblerait que vous étiez déjà dans un lobby, voulez-vous le rejoindre ?</p>
          <div>
            <Button onClick={() => joinLobby(state?.askToRejoin, true)}>Rejoindre</Button>
            <Button onClick={() => leaveLobby(state?.askToRejoin)}>Quitter</Button>
          </div>
        </ClassicModal>
      )}
      {askForLogout && (
        <ClassicModal>
          <div className="modal-container">
            <span>Voulez-vous vraiment quitter Babelfest ?</span>
            <Button onClick={handleLeaveGame}>Confirmer</Button>
            <Button onClick={() => setAskForLogout(false)}>Retour</Button>
          </div>
        </ClassicModal>
      )}
    </div>
  )
}

export default Home
