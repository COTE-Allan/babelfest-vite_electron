import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import ProfilePicture from '../esthetics/profilePicture'

import '../../styles/pages/home.scss'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'
import MenuFooter from '../interface/MenuFooter'
import { useContext, useEffect, useRef, useState } from 'react'
import {
  getFeaturedCards,
  getOnlineUsersCount,
  getRankClass,
  getTopUsersByMMR,
  getTotalAndOnlinePlayers,
  shuffleArray,
  useSendErrorMessage
} from '../others/toolBox'
import { CSSTransition } from 'react-transition-group'
import { AuthContext } from '../../AuthContext'
import useSound from 'use-sound'
import Tilt from 'react-parallax-tilt'
import ClassicModal from '../items/ClassicModal'
import Button from '../items/Button'
import { useJoinLobby, useLeaveLobby } from '../controllers/ManageLobbyAndGame'
import axios from 'axios'

import Logo from '../../assets/svg/babelfest.svg'
import LogoAnimate from '../../assets/svg/logo_babelfest_animated.svg'
import { MatchmakingContext } from '../providers/MatchmakingProvider'
import { FaCircle, FaPlay } from 'react-icons/fa'
import { NameAndTitle } from '../items/NameAndTitle'
import { IoLibrarySharp, IoLogOut } from 'react-icons/io5'
import { MdLeaderboard } from 'react-icons/md'
import { IoMdSettings } from 'react-icons/io'
import { useTransition } from '../../TransitionContext'
import MusicPlayer from '../interface/musicPlayer'

const Home = () => {
  const navigate = useNavigate()
  const [playerCount, setPlayerCount] = useState(0)
  const [topUsers, setTopUsers] = useState([])
  const sendErrorMessage = useSendErrorMessage()
  const handleItemClick = (path) => {
    navigate(path)
  }
  const { goForward } = useTransition()

  const { state } = useLocation()
  const joinLobby = useJoinLobby()
  const leaveLobby = useLeaveLobby()
  const [lastBlogPost, setLastBlogPost] = useState(null)
  const [lastBlogPostDate, setLastBlogPostDate] = useState(null)
  const { matchmakingSearch, searchTime, handleStartMatchmaking, handleStopMatchmaking } =
    useContext(MatchmakingContext)
  const { userInfo, userSettings, user } = useContext(AuthContext)
  const myID = user.uid
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const [featuredCards, setFeaturedCards] = useState(null)
  const [askForLogout, setAskForLogout] = useState(false)

  let isTutorialFinished = userInfo.achievements.includes('HF_tutorial')

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
    const unsubscribe = getOnlineUsersCount(setPlayerCount)
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

  useEffect(() => {
    if (lastBlogPost) {
      setLastBlogPostDate(
        new Date(lastBlogPost.date).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: '2-digit',
          hour12: false
        })
      )
    }
  }, [lastBlogPost])
  return (
    <div className="home">
      <MusicPlayer role="menu" />
      <div className="home-col home-nav">
        <img src={Logo} className="logo" alt="Babelfest Logo" />
        <nav>
          <a onClick={() => goForward('/play')} onMouseEnter={hover} onMouseDown={select}>
            <FaPlay size={50} />
            Jouer
          </a>
          <a onClick={() => goForward('/compendium')} onMouseEnter={hover} onMouseDown={select}>
            <IoLibrarySharp size={40} />
            Bibliothèque
          </a>
          <a onClick={() => goForward('/account')} onMouseEnter={hover} onMouseDown={select}>
            <ProfilePicture size={40} />
            Profil
          </a>
          <a onClick={() => goForward('/leaderboards')} onMouseEnter={hover} onMouseDown={select}>
            <MdLeaderboard size={40} />
            Classements
          </a>
          <a onClick={() => goForward('/settings')} onMouseEnter={hover} onMouseDown={select}>
            <IoMdSettings size={40} />
            Paramètres
          </a>
          <a onClick={handleLeaveGame} onMouseEnter={hover} onMouseDown={select}>
            <IoLogOut size={40} />
            Quitter
          </a>
        </nav>
      </div>
      <div className="home-col home-secondary">
        {featuredCards && (
          <div className="home-featured">
            <Tilt
              glareEnable={false}
              gyroscope={true}
              tiltMaxAngleX={7}
              tiltMaxAngleY={7}
              className={`tilt ${featuredCards[0].shiny && featuredCards[0].shiny}`}
            >
              <img src={featuredCards[0].url} alt="Featured card" />
            </Tilt>
          </div>
        )}

        {lastBlogPost ? (
          <a
            href={lastBlogPost.link}
            target="_blank"
            rel="noopener noreferrer"
            className="home-news"
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
