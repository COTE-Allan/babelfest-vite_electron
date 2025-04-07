import { useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../AuthContext'
import { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import LogoAnimate from '../../assets/svg/logo_babelfest_animated.svg'
import useCheckForAchievements from '../controllers/AchievementsController'
import { ServerContext } from '../../ServerContext'
import Logo from '../../assets/svg/babelfest.svg'

export default function Loading(params) {
  const { loading, userInfo, updateOnlineStatus, user, tryAuth } = useContext(AuthContext)
  const navigate = useNavigate()
  const { state } = useLocation()
  const checkForAchievements = useCheckForAchievements()
  const { serverStatus } = useContext(ServerContext)
  const [hasStarted, setHasStarted] = useState(false)

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
    if (state?.login) {
      setHasStarted(true)
    }
  }, [])

  useEffect(() => {
    if (!hasStarted) return

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
  }, [userInfo, hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    setTimeout(() => {
      handleUpdateOnlineStatus()
    }, 1000)
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    const redirectTimeout = setTimeout(() => {
      navigate('/login')
    }, 15000) // 15 secondes

    return () => clearTimeout(redirectTimeout)
  }, [navigate, hasStarted])

  return (
    <div className="loadingScreen fade-in">
      {!hasStarted ? (
        <div onClick={() => setHasStarted(true)} className="startScreen">
          <img src={Logo} className="logo" alt="Babelfest Logo" />
          <p>Cliquez sur l'écran pour commencer...</p>
        </div>
      ) : (
        <>
          <img src={LogoAnimate} alt="logo animé de chargement" className="spinner" />
          <h1>Chargement...</h1>
        </>
      )}
    </div>
  )
}
