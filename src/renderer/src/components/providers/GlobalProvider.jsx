import { createContext, useContext, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { AuthContext } from '../../AuthContext'
import { db } from '../../Firebase'
import {
  doc,
  onSnapshot,
  query,
  collection,
  orderBy,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import Room from '../pages/Room'
import { DefinePhaseRule } from '../controllers/PhaseController'
import { useTradeCard } from '../effects/editCards'
import LogoAnimate from '../../assets/svg/logo_babelfest_animated.svg'
import { useLeaveLobby } from '../controllers/ManageLobbyAndGame'
import { useSendMessage } from '../others/toolBox'

export const GlobalContext = createContext(null)
export const GlobalProvider = () => {
  const { room } = useParams()
  const { user, userSettings } = useContext(AuthContext)
  const leaveLobby = useLeaveLobby()
  const sendMessage = useSendMessage()
  const [host, setHost] = useState(false)
  let location = useLocation()
  let isSpectator = location.state?.spectator ?? false
  // Données Globales
  const [gameData, setGameData] = useState(null)
  const [playerSelf, setPlayerSelf] = useState(null)
  const [playerRival, setPlayerRival] = useState(null)
  const [playerID, setPlayerID] = useState(0)
  const [winner, setWinner] = useState(null)
  const [revenge, setRevenge] = useState(null)
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
  // Gestion des specs
  const [spectatorCount, setSpectatorCount] = useState(0)

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
          disconnected,
          revenge,
          spectators
        } = data
        // =====================
        let isHost = user.uid === player1.id || isSpectator
        setHost(isHost)
        player1.hand = handJ1
        player2.hand = handJ2
        setPlayerID(isHost ? 1 : 2)

        if (userSettings.customColors) {
          let myColor = isHost ? player1.primaryColor : player2.primaryColor
          let rivalColor = isHost ? player2.primaryColor : player1.primaryColor

          // Vérifier si les deux joueurs ont la même couleur
          if (myColor.hex === rivalColor.hex) {
            // Si la couleur identique est '#40a8f5', appliquer '#e62e31' au rival
            if (myColor.hex === '#40a8f5') {
              rivalColor = { hex: '#e62e31' }
            }
            // Si la couleur identique est '#e62e31', appliquer '#40a8f5' au rival
            else if (myColor.hex === '#e62e31') {
              rivalColor = { hex: '#40a8f5' }
            }
            // Si la couleur identique est différente, appliquer '#40a8f5' au rival
            else {
              rivalColor = { hex: '#40a8f5' }
            }
          }

          setMyColor(myColor)
          setRivalColor(rivalColor)
        } else {
          setMyColor({ hex: '#40a8f5' })
          setRivalColor({ hex: '#e62e31' })
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
        setSpectatorCount(spectators)
        // =====================
        setRevenge(revenge)
        if (finished !== false) {
          setWinner(finished)
        } else {
          setWinner(null)
        }
        // =====================

        if (phase === 1 && turn === 1) {
          setSelectedCards([])
        }

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
      unsubscribe()
    }
  }, [user])

  useEffect(() => {
    let timer
    if (revenge?.state === 'quit' && revenge?.id !== (host ? 1 : 2)) {
      sendMessage('Le lobby sera automatiquement supprimé dans 5 secondes.', 'info')
      timer = setTimeout(() => {
        leaveLobby(gameData.lobbyId, room, gameData.gamemode)
      }, 5000)
    }
    return () => clearTimeout(timer)
  }, [revenge])

  // Gestion du compteur de spec
  useEffect(() => {
    const gameDocRef = doc(db, 'games', room)

    if (isSpectator) {
      // Add spectator ID to the spectators array (avoids duplicates)
      updateDoc(gameDocRef, {
        spectators: arrayUnion(user.uid)
      }).catch((error) => {
        console.error('Error adding spectator to the list:', error)
      })
    }

    return () => {
      if (isSpectator) {
        // Remove spectator ID from the spectators array when leaving the game
        updateDoc(gameDocRef, {
          spectators: arrayRemove(user.uid)
        }).catch((error) => {
          console.error('Error removing spectator from the list:', error)
        })
      }
    }
  }, [isSpectator, room, user.uid])

  const useStartWatchingTradePhase = () => {
    const tradeCard = useTradeCard()

    function startWatchingTradePhase() {
      if (isSpectator) {
        return
      }
      setPhaseRules([0, 0, 0])
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
    setShopCardsCredits,
    isSpectator,
    spectatorCount
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
