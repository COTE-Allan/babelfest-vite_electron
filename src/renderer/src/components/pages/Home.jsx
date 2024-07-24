import { useLocation, useNavigate } from 'react-router-dom'
import ProfilePicture from '../esthetics/profilePicture'

import '../../styles/pages/home.scss'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'
import MenuFooter from '../interface/MenuFooter'
import { useContext, useEffect, useRef, useState } from 'react'
import {
  getFeaturedCards,
  getOnlineUsersCount,
  getTopUsersByLevel,
  getTopUsersByMMR,
  getTopUsersByMMRAndLevel,
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

import LogoAnimate from '../../assets/svg/logo_babelfest_animated.svg'
import { MatchmakingContext } from '../providers/MatchmakingProvider'

const Home = () => {
  const navigate = useNavigate()
  const [playerCount, setPlayerCount] = useState(0)
  const [topUsers, setTopUsers] = useState([])
  const sendErrorMessage = useSendErrorMessage()
  const handleItemClick = (path) => {
    navigate(path)
  }
  const { state } = useLocation()
  const joinLobby = useJoinLobby()
  const leaveLobby = useLeaveLobby()
  const [lastBlogPost, setLastBlogPost] = useState(null)
  const [lastBlogPostDate, setLastBlogPostDate] = useState(null)
  const { matchmakingSearch, searchTime, handleStartMatchmaking, handleStopMatchmaking } =
    useContext(MatchmakingContext)

  useEffect(() => {
    const unsubscribe = getOnlineUsersCount(setPlayerCount)
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchTopUsers = async () => {
      const users = await getTopUsersByMMRAndLevel()
      setTopUsers(users)
    }
    fetchTopUsers()
  }, [])

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          'https://blog.babelfest.fr/wp-json/wp/v2/posts?_embed&per_page=1'
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

  const getRankClass = (index) => {
    switch (index) {
      case 0:
        return 'maitre'
      case 1:
        return 'diamant'
      case 2:
        return 'or'
      case 3:
        return 'argent'
      case 4:
        return 'bronze'
      default:
        return ''
    }
  }

  return (
    <div className="home fade-in">
      <div className="home-content">
        <div className="home-grid">
          <HomeGridItem
            isButton
            needLogin
            className="grid-ranked disabled"
            bg="https://res.cloudinary.com/dxdtcakuv/image/upload/w_500/v1718097337/bouton_ranked.webp"
            onClick={() => sendErrorMessage("Cette fonctionnalité n'est pas encore disponible.")}
          >
            <h1>PARTIE CLASSÉE</h1>
            <span className="ranked bronze">BRONZE IV</span>
          </HomeGridItem>
          <HomeGridItem
            isButton
            needLogin
            className={`grid-qp ${matchmakingSearch === 'quick' && 'active'}`}
            bg="https://res.cloudinary.com/dxdtcakuv/image/upload/w_500/v1711031517/bouton_rapide.webp"
            onClick={() => {
              if (matchmakingSearch === 'quick') {
                handleStopMatchmaking()
              } else {
                handleStartMatchmaking('quick')
              }
            }}
          >
            <h1>PARTIE RAPIDE</h1>
            {matchmakingSearch && (
              <>
                <span>Recherche en cours - {searchTime}</span>
                <br />
                <span>Appuyez pour annuler</span>
              </>
            )}
          </HomeGridItem>
          <HomeGridItem
            isButton
            needLogin
            className="grid-custom"
            bg="https://res.cloudinary.com/dxdtcakuv/image/upload/w_500/v1711032350/bouton_custom.webp"
            onClick={() => {
              if (matchmakingSearch) {
                sendErrorMessage("Quittez la file d'attente pour accéder à cette fonctionnalitée.")
              } else {
                handleItemClick('/lobbyList')
              }
            }}
          >
            <h1>PARTIE CUSTOM</h1>
          </HomeGridItem>
          <HomeGridItem
            isButton
            needLogin
            className="grid-bot disabled"
            bg="https://res.cloudinary.com/dxdtcakuv/image/upload/w_500/v1718097996/bouton_solo.webp"
            onClick={() => {
              sendErrorMessage("Cette fonctionnalité n'est pas encore disponible.")
            }}
          >
            <h1>Solo</h1>
          </HomeGridItem>
          <HomeGridItem
            isButton
            needLogin
            className="grid-tuto disabled"
            bg="https://res.cloudinary.com/dxdtcakuv/image/upload/w_500/v1718098167/bouton_tuto.webp"
            onClick={() => {
              sendErrorMessage("Cette fonctionnalité n'est pas encore disponible.")
            }}
          >
            <h1>Tutoriel</h1>
          </HomeGridItem>
          <HomeGridItem className="grid-leaderboard">
            <h1>CLASSEMENT</h1>
            <div className="grid-leaderboard-content">
              {topUsers.map((user, index) => (
                <div key={user.id} className="grid-leaderboard-user">
                  <span className={`rank ${getRankClass(index)}`}>{index + 1}</span>
                  <ProfilePicture customUser={user} size={60} />
                  <div className="grid-leaderboard-user-infos">
                    <h2>{user.username}</h2>
                    <span>Niveau {user.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </HomeGridItem>
          <HomeGridItem className="grid-featured">
            <FeaturedCards />
          </HomeGridItem>

          {lastBlogPost ? (
            <HomeGridItem
              className="grid-news"
              bg={lastBlogPost.featured_media_src_url}
              link={lastBlogPost.link}
              isButton
            >
              <>
                <h1>{lastBlogPost.title.rendered}</h1>
                <span className="date">{lastBlogPostDate}</span>
                <span className="grid-link-button">Lire l'article...</span>
              </>
            </HomeGridItem>
          ) : (
            <HomeGridItem className="grid-news" bg="">
              <img src={LogoAnimate} alt="logo animé de chargement" className="spinner" />
            </HomeGridItem>
          )}

          <HomeGridItem className="grid-playerCount">
            <span>EN LIGNE : {playerCount}</span>
          </HomeGridItem>
        </div>
      </div>
      <MenuFooter />

      {state?.askToRejoin && (
        <ClassicModal>
          <p>Il semblerait que vous étiez déjà dans un lobby, voulez-vous le rejoindre ?</p>
          <div>
            <Button onClick={() => joinLobby(state?.askToRejoin, true)}>Rejoindre</Button>
            <Button onClick={() => leaveLobby(state?.askToRejoin)}>Quitter</Button>
          </div>
        </ClassicModal>
      )}
    </div>
  )
}

export default Home

const HomeGridItem = ({ bg, onClick, className, children, isButton, needLogin, link }) => {
  const { userSettings, user } = useContext(AuthContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const sendErrorMessage = useSendErrorMessage()
  const navigate = useNavigate()
  return (
    <div
      className={`home-grid-item ${className} ${isButton ? 'grid-button' : ''}`}
      onClick={() => {
        if (isButton) {
          select()
          onClick()
        }
      }}
      onMouseEnter={() => isButton && hover()}
      style={{
        backgroundColor: bg ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.5)'
      }}
    >
      {bg && <img className="home-grid-item-bg" src={bg} alt="Fond du bouton" />}
      <div className={`home-grid-item-content ${link && 'grid-link'}`}>
        {link ? (
          <a target="_blank" href={link} rel="noreferrer">
            {children}
          </a>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

const FeaturedCards = () => {
  const featuredCards = getFeaturedCards()
  const { userSettings } = useContext(AuthContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inProp, setInProp] = useState(false)
  const nodeRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    setInProp(true)
    const interval = setInterval(() => {
      setInProp(false)

      // Mettez à jour l'index après une légère attente pour permettre à la transition de sortie de se terminer
      setTimeout(() => {
        setCurrentIndex((currentIndex) => (currentIndex + 1) % featuredCards.length)
        setInProp(true)
      }, 500)
    }, 10000)

    return () => clearInterval(interval)
  }, [featuredCards.length])

  // Sélectionner la carte actuelle basée sur currentIndex
  const currentCard = featuredCards[currentIndex]

  return (
    <>
      <h1>CARTES À LA UNE</h1>
      <CSSTransition
        in={inProp}
        timeout={500}
        classNames="grid-featured-carousel-transition"
        nodeRef={nodeRef}
        unmountOnExit
      >
        <div className="grid-featured-carousel" ref={nodeRef}>
          {currentCard && (
            <div
              className="grid-featured-carousel-item"
              onClick={() => {
                select()
                navigate('/library', { state: { selected: currentCard } })
              }}
              onMouseEnter={hover}
            >
              <Tilt
                glareEnable={false}
                gyroscope={true}
                tiltMaxAngleX={7}
                tiltMaxAngleY={7}
                className={`tilt ${currentCard.shiny && currentCard.shiny}`}
              >
                <div className="img-container">
                  <img src={currentCard.url} alt={'Visuel de la carte' + currentCard.name} />
                </div>
              </Tilt>
              <h2>
                {currentCard.name} - {currentCard.title}
              </h2>
              <span>Par {currentCard.author}</span>
            </div>
          )}
        </div>
      </CSSTransition>
    </>
  )
}
