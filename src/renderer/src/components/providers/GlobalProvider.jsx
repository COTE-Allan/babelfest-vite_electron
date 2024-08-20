import { createContext, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AuthContext } from '../../AuthContext'
import { db } from '../../Firebase'
import { doc, onSnapshot, query, collection, orderBy } from 'firebase/firestore'
import Room from '../pages/Room'
import { DefinePhaseRule } from '../controllers/PhaseController'
import { useTradeCard } from '../effects/editCards'
import LogoAnimate from '../../assets/svg/logo_babelfest_animated.svg'

export const GlobalContext = createContext(null)
export const GlobalProvider = () => {
  const { room } = useParams()
  const { user } = useContext(AuthContext)
  const [host, setHost] = useState(false)
  // Données Globales
  const [gameData, setGameData] = useState(null)
  const [playerSelf, setPlayerSelf] = useState(null)
  const [playerRival, setPlayerRival] = useState(null)
  const [playerID, setPlayerID] = useState(0)
  const [winner, setWinner] = useState(null)
  const [turn, setTurn] = useState(null)
  // Gestion des cartes
  const [selectedCards, setSelectedCards] = useState([])
  const [deck, setDeck] = useState([])
  const [tradeButton, setTradeButton] = useState(true)
  // Gestion du placement
  const [askForRectoVerso, setAskForRectoVerso] = useState(false)
  const [placementCostLeft, setPlacementCostLeft] = useState(4)
  // Gestion des skins
  const [myColor, setMyColor] = useState('')
  const [rivalColor, setRivalColor] = useState('')
  // Gestion du déplacement
  const [selectedCells, setSelectedCells] = useState([])
  const [movesLeft, setMovesLeft] = useState(4)
  // Gestion de l'attaque
  const [rivalEndedAttack, setRivalEndedAttack] = useState(false)
  const [processDeath, setProcessDeath] = useState(false)
  // Gestion du shop
  const [shop, setShop] = useState([])
  const [selectedShopCards, setSelectedShopCards] = useState([])
  const [handCardsCredits, setHandCardsCredits] = useState([])
  const [shopCardsCredits, setShopCardsCredits] = useState([])
  // Système de standby
  const [standby, setStandby] = useState(false)
  const [phaseEffects, setPhaseEffects] = useState(false)
  // Gestion des tours
  const [turnOrder, setTurnOrder] = useState(null)
  const [activePlayer, setActivePlayer] = useState(null)
  const [firstToPlay, setFirstToPlay] = useState(null)
  const [myTurn, setMyTurn] = useState(false)
  const [phase, setPhase] = useState(null)
  const [phaseRules, setPhaseRules] = useState([])
  // Gestion des effets
  const [askForTarget, setAskForTarget] = useState(false)
  // Gestion de l'arène
  const [confirmModal, setConfirmModal] = useState(null)
  const [greenCells, setGreenCells] = useState([])
  const [showArenaInModal, setShowArenaInModal] = useState(false)
  // Paramètres du joueur
  const [detailCard, setDetailCard] = useState(null)
  const [advancedDetailCard, setAdvancedDetailCard] = useState(null)
  // Contrôle des fenêtres
  const [rightWindow, setRightWindow] = useState(null)
  const [leftWindow, setLeftWindow] = useState(null)
  const [musicPlayer, setMusicPlayer] = useState(false)

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
    // Gérer l'utilisateur qui quitte
    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = 'Vous êtes sûr de vouloir quitter ?'
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    console.log('useEffect activé !')

    const unsubscribe = onSnapshot(
      doc(db, 'games', room),
      async (doc) => {
        console.log('changement detecté')
        const data = doc.data()

        setGameData(data)

        const {
          handJ1,
          handJ2,
          FirstToPlay,
          phase,
          activePlayer,
          shop,
          standby,
          deck,
          finished,
          processDeath,
          turn,
          player1,
          player2,
          disconnected
        } = data
        // =====================
        let isHost = user.uid === player1.id
        setHost(isHost)
        player1.hand = handJ1
        player2.hand = handJ2
        setPlayerID(isHost ? 1 : 2)
        setRivalColor(player1.primaryColor)
        if (isHost) {
          if (player2.primaryColor === player1.primaryColor) {
            setRivalColor(player2.secondaryColor)
          } else {
            setRivalColor(player2.primaryColor)
          }
          setMyColor(player1.primaryColor)
        } else {
          if (player2.primaryColor === player1.primaryColor) {
            setMyColor(player2.secondaryColor)
          } else {
            setMyColor(player2.primaryColor)
          }
          setRivalColor(player1.primaryColor)
        }
        // =====================
        setStandby(standby)
        setDeck(deck)
        setShop(shop)
        setPhase(phase)
        setFirstToPlay(FirstToPlay)
        setProcessDeath(processDeath)
        setTurnOrder((isHost && FirstToPlay === 1) || (!isHost && FirstToPlay === 2) ? 1 : 2)
        setActivePlayer(activePlayer)
        setTurn(turn)
        // =====================
        if (finished !== false) {
          setWinner(finished)
        } else {
          setWinner(null)
        }
        // =====================

        if (disconnected) {
          player1.disconnected = disconnected.includes(player1.id)
          player2.disconnected = disconnected.includes(player2.id)
        }

        setPlayerRival(isHost ? player2 : player1)
        setPlayerSelf(isHost ? player1 : player2)

        if (handJ1 && handJ2) {
          setPhaseRules(DefinePhaseRule(phase, isHost ? handJ1.length : handJ2.length))
        }
        // ====================
        setMyTurn(activePlayer === (isHost ? 1 : 2))
        // ====================
      },
      (error) => {
        console.error("Erreur lors de l'écoute des modifications de la base de données :", error)
      }
    )

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      unsubscribe()
    }
  }, [user])

  const useStartWatchingTradePhase = () => {
    const tradeCard = useTradeCard()

    function startWatchingTradePhase() {
      setPhaseRules([0, 0, 0])
      setSelectedCards([])
      if (!host) {
        watchTradeRequests()
      }
    }

    function watchTradeRequests() {
      const tradeQuery = query(collection(db, `games/${room}/tradePhase`))
      const unsubscribe = onSnapshot(tradeQuery, (querySnapshot) => {
        const requests = querySnapshot.docs.map((doc) => [doc.id, doc.data()])

        if (requests.length === 2) {
          const J1Request = requests.find((request) => request[0] === 'forJ1')
          const J2Request = requests.find((request) => request[0] === 'forJ2')

          if (J1Request && J2Request) {
            const J1newCards = J1Request[1].cards
            const J2newCards = J2Request[1].cards

            tradeCard('Player&Player', J1newCards, J2newCards, true)
            unsubscribe()
          }
        }
      })
    }

    return startWatchingTradePhase
  }

  let propsList = {
    room,
    user,
    host,
    gameData,
    playerSelf,
    playerRival,
    playerID,
    winner,
    selectedCards,
    setSelectedCards,
    setPlayerSelf,
    deck,
    askForRectoVerso,
    setAskForRectoVerso,
    placementCostLeft,
    setPlacementCostLeft,
    selectedCells,
    setSelectedCells,
    movesLeft,
    setMovesLeft,
    rivalEndedAttack,
    setRivalEndedAttack,
    shop,
    selectedShopCards,
    setSelectedShopCards,
    standby,
    phaseEffects,
    setPhaseEffects,
    turnOrder,
    activePlayer,
    firstToPlay,
    myTurn,
    setMyTurn,
    phase,
    phaseRules,
    setPhaseRules,
    askForTarget,
    setAskForTarget,
    confirmModal,
    setConfirmModal,
    greenCells,
    setGreenCells,
    showArenaInModal,
    setShowArenaInModal,
    detailCard,
    setDetailCard,
    advancedDetailCard,
    setAdvancedDetailCard,
    pattern,
    logs,
    myColor,
    rivalColor,
    useStartWatchingTradePhase,
    rightWindow,
    setRightWindow,
    leftWindow,
    setLeftWindow,
    musicPlayer,
    setMusicPlayer,
    processDeath,
    setProcessDeath,
    turn,
    scenes,
    tradeButton,
    setTradeButton,
    handCardsCredits,
    setHandCardsCredits,
    shopCardsCredits,
    setShopCardsCredits
  }
  return (
    <GlobalContext.Provider value={propsList}>
      {playerRival && playerSelf ? (
        <Room />
      ) : (
        <div className="waiting">
          <img src={LogoAnimate} alt="logo animé de chargement" className="spinner" /> Chargement...
        </div>
      )}
    </GlobalContext.Provider>
  )
}
