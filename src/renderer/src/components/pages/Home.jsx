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
import { FaCircle } from 'react-icons/fa'
import { NameAndTitle } from '../items/NameAndTitle'

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
  const { userInfo, userSettings, user } = useContext(AuthContext)
  const myID = user.uid
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })

  let isTutorialFinished = userInfo.achievements.includes('HF_tutorial')

  useEffect(() => {
    const unsubscribe = getOnlineUsersCount(setPlayerCount)
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchTopUsers = async () => {
      const users = await getTopUsersByMMR()
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

  return (
    <>
      <div className="home">
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
              className={`grid-qp ${matchmakingSearch === 'quick' && 'active'} ${!isTutorialFinished && 'disabled'}`}
              bg="https://res.cloudinary.com/dxdtcakuv/image/upload/w_500/v1711031517/bouton_rapide.webp"
              onClick={() => {
                if (!isTutorialFinished) {
                  sendErrorMessage(
                    'Terminez le tutoriel pour débloquer cette fonctionnalité.',
                    'info'
                  )
                } else if (matchmakingSearch === 'quick') {
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
              className={`grid-custom ${!isTutorialFinished && 'disabled'}`}
              bg="https://res.cloudinary.com/dxdtcakuv/image/upload/w_500/v1711032350/bouton_custom.webp"
              onClick={() => {
                if (!isTutorialFinished) {
                  sendErrorMessage(
                    'Terminez le tutoriel pour débloquer cette fonctionnalité.',
                    'info'
                  )
                } else if (matchmakingSearch) {
                  sendErrorMessage(
                    "Quittez la file d'attente pour accéder à cette fonctionnalitée."
                  )
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
              className="grid-tuto"
              bg="https://res.cloudinary.com/dxdtcakuv/image/upload/w_500/v1718098167/bouton_tuto.webp"
              onClick={() => {
                handleItemClick('/tutorial')
              }}
            >
              <h1>Tutoriel</h1>
            </HomeGridItem>
            <HomeGridItem className="grid-leaderboard">
              <h1>CLASSEMENT</h1>
              <h2>(par MMR)</h2>
              <div className="grid-leaderboard-content">
                {topUsers.map((user, index) => (
                  <NavLink
                    key={user.id}
                    className="grid-leaderboard-user"
                    to={user.id && user.id !== 'myID' ? `/userProfile/${user.id}` : '/account/1'}
                    onMouseEnter={hover}
                    onClick={select}
                  >
                    <span className={`rank ${getRankClass(index)}`}>{index + 1}</span>
                    <ProfilePicture customUser={user} size={60} />
                    <div className="grid-leaderboard-user-infos">
                      <NameAndTitle user={user} />
                    </div>
                    <img
                      className="grid-leaderboard-user-banner"
                      src={user.banner}
                      alt="bannière du joueur"
                    />
                  </NavLink>
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
              <span>
                <FaCircle color="4ead35" size={20} /> EN LIGNE : {playerCount}
              </span>
            </HomeGridItem>
          </div>
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
      </div>
      <MenuFooter />
    </>
  )
}

export default Home

const HomeGridItem = ({ bg, onClick, className, children, isButton, needLogin, link }) => {
  const { userSettings, user } = useContext(AuthContext)
  const [isUpdating, setIsUpdating] = useState(false)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const sendErrorMessage = useSendErrorMessage()

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setIsUpdating(true)
    }

    const handleUpdateFinished = () => {
      setIsUpdating(false)
    }

    window.api.on('update_available', handleUpdateAvailable)
    window.api.on('update_downloaded', handleUpdateFinished)
    window.api.on('update_error', handleUpdateFinished)

    return () => {
      window.api.removeListener('update_available', handleUpdateAvailable)
      window.api.removeListener('update_downloaded', handleUpdateFinished)
      window.api.removeListener('update_error', handleUpdateFinished)
    }
  }, [])

  return (
    <div
      className={`home-grid-item ${className} ${isButton ? 'grid-button' : ''}`}
      onClick={() => {
        if (isButton) {
          select()
          if (isUpdating) {
            sendErrorMessage('Attendez la fin du téléchargement pour continuer.')
          } else {
            onClick()
          }
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

  // Initialiser l'index de la carte courante de manière aléatoire
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * featuredCards.length)
  )
  const [inProp, setInProp] = useState(false)
  const nodeRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    setInProp(true)
    let previousIndex = currentIndex
    const interval = setInterval(() => {
      setInProp(false)

      // Mettre à jour l'index après une légère attente pour permettre à la transition de sortie de se terminer
      setTimeout(() => {
        let nextIndex
        do {
          nextIndex = Math.floor(Math.random() * featuredCards.length)
        } while (nextIndex === previousIndex)
        previousIndex = nextIndex
        setCurrentIndex(nextIndex)
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
