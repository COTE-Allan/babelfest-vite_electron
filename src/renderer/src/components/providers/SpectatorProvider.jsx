import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthContext } from '../../AuthContext'
import { db } from '../../Firebase'
import { doc, onSnapshot, query, collection, orderBy } from 'firebase/firestore'
import SpectatorRoom from '../pages/SpectatorRoom'
import LogoAnimate from '../../assets/svg/logo_babelfest_animated.svg'

export const SpectatorContext = createContext(null)
export const SpectatorProvider = () => {
  const { room } = useParams()
  const { user } = useContext(AuthContext)
  // Données Globales
  const [gameData, setGameData] = useState(null)
  const [player1, setPlayer1] = useState(null)
  const [player2, setPlayer2] = useState(null)
  const [side, setSide] = useState(1)
  const [winner, setWinner] = useState(null)
  const [turn, setTurn] = useState(null)
  // Gestion du shop
  const [shop, setShop] = useState([])
  // Gestion des tours
  const [activePlayer, setActivePlayer] = useState(null)
  const [phase, setPhase] = useState(null)
  const [myTurn, setMyTurn] = useState(null)
  // Paramètres du joueur
  const [player1Color, setPlayer1Color] = useState(null)
  const [player2Color, setPlayer2Color] = useState(null)
  const [detailCard, setDetailCard] = useState(null)
  // Contrôle des fenêtres
  const [rightWindow, setRightWindow] = useState(null)
  const [leftWindow, setLeftWindow] = useState(null)
  const [musicPlayer, setMusicPlayer] = useState(false)

  const navigate = useNavigate()
  const [timeJoined, setTimeJoined] = useState(Date.now())
  useEffect(() => {
    setTimeJoined(Date.now())
  }, [])

  // Variable qui gère l'arène
  const usePattern = (room) => {
    const [pattern, setPattern] = useState([])
    useEffect(() => {
      const q = query(collection(db, `games/${room}/arena`), orderBy('id', 'desc'))
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setPattern(querySnapshot.docs.map((doc) => doc.data()))
      })
      return () => unsubscribe()
    }, [room])
    return pattern
  }
  const pattern = usePattern(room)

  // Variable qui gère les logs
  const useLogs = (room) => {
    const [logs, setLogs] = useState([])
    useEffect(() => {
      const q = query(collection(db, `games/${room}/logs`), orderBy('timestamp', 'desc'))
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setLogs(querySnapshot.docs.map((doc) => doc.data()))
      })
      return () => unsubscribe()
    }, [room])
    return logs
  }
  const logs = useLogs(room)

  // Variable qui gère les scenes
  const useScenes = (room) => {
    const { user } = useContext(AuthContext) // Make sure user is accessible here
    const [scenes, setScenes] = useState([])

    useEffect(() => {
      if (!timeJoined) return

      const q = query(collection(db, `games/${room}/scenes`), orderBy('timestamp', 'asc'))

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const filteredScenes = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((scene) => !scene.playedBy.includes(user.uid) && scene.timestamp > timeJoined)
        setScenes(filteredScenes)
      })

      return () => unsubscribe()
    }, [room, user.uid, timeJoined])

    return scenes
  }

  const scenes = useScenes(room)

  // Mettre a jour les states quand la db change
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'games', room),
      async (doc) => {
        console.log('changement detecté')
        const data = doc.data()

        setGameData(data)

        const {
          phase,
          shop,
          finished,
          turn,
          player1,
          player2,
          handJ1,
          handJ2,
          revenge,
          activePlayer
        } = data

        if (revenge === 'quit') {
          navigate('/lobbyList')
        }

        player1.hand = handJ1
        player2.hand = handJ2
        setShop(shop)
        setPhase(phase)
        setActivePlayer(activePlayer)
        setTurn(turn)

        setPlayer1(player1)
        setPlayer2(player2)

        if (player2.primaryColor === player1.primaryColor) {
          setPlayer2Color(player2.secondaryColor)
        } else {
          setPlayer2Color(player2.primaryColor)
        }
        setPlayer1Color(player1.primaryColor)

        // =====================
        if (finished !== false) {
          setWinner(finished)
        } else {
          setWinner(null)
        }
      },
      (error) => {
        console.error("Erreur lors de l'écoute des modifications de la base de données :", error)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [user])

  useEffect(() => {
    setMyTurn(side === activePlayer)
  }, [side])

  let propsList = {
    scenes,
    room,
    user,
    gameData,
    winner,
    shop,
    phase,
    activePlayer,
    detailCard,
    setDetailCard,
    pattern,
    logs,
    rightWindow,
    setRightWindow,
    leftWindow,
    setLeftWindow,
    musicPlayer,
    setMusicPlayer,
    turn,
    player1Color,
    player2Color,
    player1,
    player2,
    side,
    setSide,
    myTurn
  }
  return (
    <SpectatorContext.Provider value={propsList}>
      {player1 && player2 ? (
        <SpectatorRoom />
      ) : (
        <div className="waiting">
          <img src={LogoAnimate} alt="logo animé de chargement" className="spinner" />
          Chargement...
        </div>
      )}
    </SpectatorContext.Provider>
  )
}
