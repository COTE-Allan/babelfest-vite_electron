import React, { useState, useEffect, useContext } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { doc, onSnapshot, updateDoc, deleteDoc, getDoc, arrayRemove } from 'firebase/firestore'
import { db } from '../../Firebase'
import '../../styles/pages/lobby.scss'
import ProfilePicture from '../esthetics/profilePicture'
import { AuthContext } from '../../AuthContext'
import Button from '../items/Button'
import { FaLock } from 'react-icons/fa'
import { useCreateGame, useLeaveLobby } from '../controllers/ManageLobbyAndGame'
import Slider from 'rc-slider'
import ClassicModal from '../items/ClassicModal'
import { getArenaPattern, getRandomPattern, useSendMessage } from '../others/toolBox'
import { IoMdSettings } from 'react-icons/io'
import ArenaPicker from '../others/ArenaPicker'

// >>> Assure-toi d’importer IsDeckValid au bon endroit <<<
import { IsDeckValid } from '../others/toolBox'

const Lobby = () => {
  const { lobbyId } = useParams()
  const [lobbyData, setLobbyData] = useState(null)
  const [player1, setPlayer1] = useState(null)
  const [player2, setPlayer2] = useState(null)
  const [selectedDeck, setSelectedDeck] = useState(null)
  const [mapChoice, setMapChoice] = useState(false)
  const [selectedMaps, setSelectedMaps] = useState([])

  const { user, userInfo } = useContext(AuthContext)
  const leaveLobby = useLeaveLobby()
  const createGame = useCreateGame()
  const navigate = useNavigate()
  const location = useLocation()

  const isSpectator = location.state?.spectator ?? false
  const deckFromState = location.state?.deck ?? null // Récupérer le deck depuis le state
  const sendMessage = useSendMessage()

  // ================================================
  // FETCH LOBBY
  // ================================================
  useEffect(() => {
    if (!lobbyId) return

    const lobbyRef = doc(db, 'lobbies', lobbyId)
    const unsubscribe = onSnapshot(lobbyRef, (doc) => {
      if (doc.exists()) {
        setLobbyData(doc.data())
      } else {
        console.log("Le document du lobby n'existe pas !")
        navigate('/lobbyList')
      }
    })
    return () => unsubscribe()
  }, [lobbyId])

  // ================================================
  // FETCH PLAYERS
  // ================================================
  useEffect(() => {
    let unsubscribeJ1, unsubscribeJ2

    const fetchPlayerInfo = (playerRef, setPlayer) => {
      if (!playerRef) {
        setPlayer(null)
        return
      }
      return onSnapshot(playerRef, (doc) => {
        if (doc.exists()) {
          setPlayer(doc.data())
        } else {
          setPlayer(null)
        }
      })
    }

    if (lobbyData) {
      unsubscribeJ1 = fetchPlayerInfo(lobbyData.j1, setPlayer1)
      unsubscribeJ2 = fetchPlayerInfo(lobbyData.j2, setPlayer2)
    }

    return () => {
      if (unsubscribeJ1) unsubscribeJ1()
      if (unsubscribeJ2) unsubscribeJ2()
    }
  }, [lobbyData])

  // ================================================
  // UTILS & VARIABLES
  // ================================================
  const isUserHost = user && user.uid === lobbyData?.j1?.id // Seul le joueur 1 est l'hôte

  const deckType = lobbyData?.deckType || 'random'
  const cardsPerHand = lobbyData?.cardsPerHand || 8
  const anyPlayerReady = lobbyData?.readyj1 || lobbyData?.readyj2
  const userIsReady =
    (user.uid === player1?.id && lobbyData?.readyj1) ||
    (user.uid === player2?.id && lobbyData?.readyj2)

  // ================================================
  // FONCTIONS D’UPDATE
  // ================================================
  const handleDeckTypeChange = async (newDeckType) => {
    if (!isUserHost || anyPlayerReady) return // L’hôte seulement peut changer le type de deck si personne n’est prêt
    const lobbyRef = doc(db, 'lobbies', lobbyId)
    await updateDoc(lobbyRef, { deckType: newDeckType })
  }

  const handleCardsPerHandChange = async (value) => {
    if (!isUserHost || anyPlayerReady) return
    const lobbyRef = doc(db, 'lobbies', lobbyId)
    await updateDoc(lobbyRef, { cardsPerHand: value })
  }

  const toggleReady = async () => {
    // Dans le cas d’un deck construit, on force l’utilisateur à choisir un deck
    if (deckType === 'constructed' && !selectedDeck) {
      sendMessage('Veuillez choisir un deck avant de vous déclarer prêt.', 'warn')
      return
    }

    const lobbyRef = doc(db, 'lobbies', lobbyId)
    const updatePayload = {}

    if (user.uid === player1?.id) {
      updatePayload.readyj1 = lobbyData.readyj1
        ? null
        : deckType === 'constructed'
          ? selectedDeck
          : true
    } else if (user.uid === player2?.id) {
      updatePayload.readyj2 = lobbyData.readyj2
        ? null
        : deckType === 'constructed'
          ? selectedDeck
          : true
    }

    await updateDoc(lobbyRef, updatePayload)
    sendMessage(
      lobbyData.readyj1 || lobbyData.readyj2 ? "Vous n'êtes plus prêt." : 'Vous êtes prêt!',
      'success'
    )
  }

  // ================================================
  // AUTO-READY SI GAMEMODE != 'custom'
  // ================================================
  useEffect(() => {
    const autoReady = async () => {
      if (lobbyData && lobbyData.gamemode !== 'custom') {
        const lobbyRef = doc(db, 'lobbies', lobbyId)
        const updatePayload = {}

        if (user.uid === player1?.id && !lobbyData.readyj1) {
          updatePayload.readyj1 = deckFromState || true
        } else if (user.uid === player2?.id && !lobbyData.readyj2) {
          updatePayload.readyj2 = deckFromState || true
        }

        if (Object.keys(updatePayload).length > 0) {
          await updateDoc(lobbyRef, updatePayload)
        }
      }
    }
    autoReady()
  }, [lobbyData, user.uid, player1, player2])

  // ================================================
  // START GAME SI LES DEUX JOUEURS SONT PRÊTS
  // ================================================
  useEffect(() => {
    const startGame = async () => {
      const arenas = getArenaPattern()

      if (lobbyData && lobbyData.readyj1 && lobbyData.readyj2 && isUserHost && !lobbyData.gameRef) {
        let mapPattern
        if (selectedMaps.length === 0 || selectedMaps.length === arenas.length) {
          // Aucune arène sélectionnée ou toutes sélectionnées → aléatoire global
          mapPattern = getRandomPattern()
        } else if (selectedMaps.length === 1) {
          // Une seule arène → on l’utilise
          mapPattern = selectedMaps[0].pattern
        } else {
          // Plusieurs arènes → on en choisit une aléatoirement
          const randomIndex = Math.floor(Math.random() * selectedMaps.length)
          mapPattern = selectedMaps[randomIndex].pattern
        }

        const gameRef = await createGame(
          lobbyId,
          lobbyData.j1,
          lobbyData.j2,
          null,
          {
            cards: cardsPerHand,
            map: {
              cellToRemove: mapPattern[0],
              bases: mapPattern[1]
            }
          },
          lobbyData.gamemode,
          lobbyData.readyj1, // Deck du joueur 1
          lobbyData.readyj2, // Deck du joueur 2
          lobbyData.deckType ?? 'constructed'
        )
        // Mettre à jour le lobby avec la référence de la game créée
        const lobbyRef = doc(db, 'lobbies', lobbyId)
        await updateDoc(lobbyRef, { gameRef: gameRef.id })
      }
    }
    startGame()
  }, [lobbyData, isUserHost, selectedMaps])

  // ================================================
  // NAVIGUER VERS /game/ LORSQUE gameRef EST SET
  // ================================================
  useEffect(() => {
    if (lobbyData && lobbyData.gameRef) {
      const gameRef = doc(db, 'games', lobbyData.gameRef)
      updateDoc(gameRef, {
        disconnected: arrayRemove(user.uid)
      })
        .then(() => {
          navigate(`/game/${lobbyData.gameRef}`, { state: { spectator: isSpectator } })
        })
        .catch((error) => {
          console.error('Erreur lors de la mise à jour du document de jeu: ', error)
        })
    }
  }, [lobbyData])

  // ================================================
  // RENDER
  // ================================================
  if (!lobbyData) {
    return <div>Chargement du lobby...</div>
  }

  return (
    <div className="lobby">
      {lobbyData.gamemode === 'custom' && (
        <div className="lobby-controls">
          <h1>{lobbyData.name}</h1>
          {lobbyData.password && (
            <h2>
              <FaLock /> {lobbyData.password}
            </h2>
          )}

          <div className="lobby-settings">
            <h3>
              <IoMdSettings size={40} />
              Paramètres
            </h3>
            <hr />

            {/* Paramètres réservés à l’hôte */}
            {isUserHost && !isSpectator && (
              <>
                <div className={`lobby-settings-item ${anyPlayerReady && 'disabled'}`}>
                  <span>Type de deck :</span>
                  <select
                    onChange={(e) => handleDeckTypeChange(e.target.value)}
                    value={deckType}
                    disabled={anyPlayerReady}
                  >
                    <option value="random">Tirage aléatoire</option>
                    <option value="constructed">Deck construit</option>
                  </select>
                </div>

                {deckType === 'random' && (
                  <div className={`lobby-settings-item ${anyPlayerReady && 'disabled'}`}>
                    <span>Nombre de cartes en main : {cardsPerHand}</span>
                    <Slider
                      onChange={handleCardsPerHandChange}
                      min={3}
                      max={10}
                      value={cardsPerHand}
                      step={1}
                      styles={{
                        handle: { backgroundColor: 'white', borderColor: 'white' },
                        track: { backgroundColor: 'white', borderColor: 'white' },
                        rail: { backgroundColor: 'rgba(255,255,255, 0.5)' }
                      }}
                      disabled={anyPlayerReady}
                    />
                  </div>
                )}

                <div className={`lobby-settings-item ${anyPlayerReady && 'disabled'}`}>
                  <Button onClick={() => setMapChoice(true)} disabled={anyPlayerReady}>
                    Arène actuelle :{' '}
                    {selectedMaps.length === 0
                      ? 'Aléatoire'
                      : `${selectedMaps.length} arène(s) sélectionnée(s)`}
                  </Button>
                </div>
              </>
            )}

            {/* Sélection de deck pour tout le monde si c’est un deck construit */}
            {deckType === 'constructed' && !isSpectator && (
              <div className={`lobby-settings-item ${userIsReady && 'disabled'}`}>
                <span>Choisir un deck :</span>
                <select
                  onChange={(e) =>
                    setSelectedDeck(userInfo.decks.find((deck) => deck.id === e.target.value))
                  }
                  value={selectedDeck ? selectedDeck.id : ''}
                  disabled={userIsReady}
                >
                  <option value="">Aucun deck sélectionné</option>
                  {
                    // 1) On filtre les decks qui sont valides,
                    // 2) On en génère les <option>
                    userInfo.decks
                      .filter((deck) => IsDeckValid(deck))
                      .map((deck) => (
                        <option key={deck.id} value={deck.id}>
                          {deck.name}
                        </option>
                      ))
                  }
                </select>
                {(!userInfo.decks || userInfo.decks.length === 0) && (
                  <span className="alert">Créez un deck depuis votre profil !</span>
                )}
              </div>
            )}

            {!isSpectator && (
              <Button onClick={toggleReady} disabled={lobbyData.readyj1 && lobbyData.readyj2}>
                {lobbyData.readyj1 && lobbyData.readyj2
                  ? 'Les deux joueurs sont prêts'
                  : userIsReady
                    ? 'Annuler Prêt'
                    : 'Se déclarer prêt'}
              </Button>
            )}
          </div>

          <div className="lobby-controls-buttons">
            <Button
              onClick={() =>
                isSpectator
                  ? navigate('/lobbyList')
                  : leaveLobby(lobbyId, false, lobbyData.gamemode, false)
              }
            >
              {isSpectator ? 'Quitter le lobby' : 'Quitter'}
            </Button>
          </div>
        </div>
      )}

      <div className="lobby-players">
        <div className="lobby-players-item">
          {player1 ? (
            <div className="lobby-players-item-content">
              <ProfilePicture customUser={player1} size={300} />
              <span className="lobby-players-name">{player1.username}</span>
              <span className={`lobby-players-status ${lobbyData.readyj1 && 'ready'}`}>
                {lobbyData.readyj1 ? 'Prêt' : 'Non prêt'}
              </span>
            </div>
          ) : (
            <div className="lobby-players-item-content">
              <span className="lobby-players-name">En attente...</span>
            </div>
          )}
        </div>

        <span className="lobby-players-versus">CONTRE</span>

        <div className="lobby-players-item">
          {player2 ? (
            <div className="lobby-players-item-content">
              <ProfilePicture customUser={player2} size={300} />
              <span className="lobby-players-name">{player2.username}</span>
              <span className={`lobby-players-status ${lobbyData.readyj2 && 'ready'}`}>
                {lobbyData.readyj2 ? 'Prêt' : 'Non prêt'}
              </span>
            </div>
          ) : (
            <div className="lobby-players-item-content">
              <span className="lobby-players-name">En attente...</span>
            </div>
          )}
        </div>
      </div>

      {mapChoice && (
        <ClassicModal>
          <ArenaPicker selectedMap={selectedMaps} setSelectedMap={setSelectedMaps} />
          <Button onClick={() => setMapChoice(false)}>Retour</Button>
        </ClassicModal>
      )}
    </div>
  )
}

export default Lobby
