import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../AuthContext'
import { useContext, useEffect } from 'react'
import { toast } from 'react-toastify'
import LogoAnimate from '../../assets/svg/logo_babelfest_animated.svg'
import useCheckForAchievements from '../controllers/AchievementsController'
import { ServerContext } from '../../ServerContext'

export default function Loading(params) {
  const { loading, userInfo, updateOnlineStatus, user, tryAuth } = useContext(AuthContext)
  const navigate = useNavigate()
  const checkForAchievements = useCheckForAchievements()
  const { serverStatus } = useContext(ServerContext)

  async function handleUpdateOnlineStatus() {
    tryAuth()
  }

  async function goToHomePage(askToRejoin) {
    checkForAchievements()
    if (askToRejoin) {
      navigate('/home', { state: { askToRejoin: askToRejoin } })
    } else {
      navigate('/home')
    }
  }

  useEffect(() => {
    const connectPlayer = async () => {
      let askToRejoin = false
      if (serverStatus === 'offline') {
        toast.error('Les serveurs sont fermés pour le moment.')
        navigate('/login')
        return
      }
      if (user && userInfo && (userInfo?.status?.state !== 'online' || !userInfo.status)) {
        if (userInfo?.status?.state === 'disconnecting' && userInfo?.currentLobby) {
          askToRejoin = userInfo?.currentLobby.id
        }
        await updateOnlineStatus(user.uid, false)
        goToHomePage(askToRejoin)
      } else if (user) {
        toast.error("Connexion interrompue, vérifiez que vous n'êtes pas connecté ailleurs.")
        navigate('/login')
      }
    }
    if (user) {
      connectPlayer()
    } else if (user === false) {
      navigate('/login')
    }
  }, [userInfo])

  useEffect(() => {
    setTimeout(() => {
      handleUpdateOnlineStatus()
    }, 1000)
  }, [])

  // Redirection après 15 secondes
  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      navigate('/login')
    }, 15000) // 15 secondes

    // Nettoyage du timeout si l'utilisateur quitte la page avant la fin
    return () => clearTimeout(redirectTimeout)
  }, [navigate])

  return (
    <div className={`loadingScreen fade-in`}>
      <img src={LogoAnimate} alt="logo animé de chargement" className={`spinner`} />
      <h1>Chargement...</h1>
    </div>
  )
}
