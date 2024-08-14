import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, onSnapshot, getDoc, arrayRemove, updateDoc } from 'firebase/firestore'
import { db } from '../../Firebase'
import '../../styles/pages/lobby.scss'
import ProfilePicture from '../esthetics/profilePicture'
import CardsBackground from '../esthetics/CardsBackground'
import { AuthContext } from '../../AuthContext'
import Button from '../items/Button'
import { FaLock } from 'react-icons/fa'
import { useCreateGame, useLeaveLobby } from '../controllers/ManageLobbyAndGame'
import MusicPlayer from '../interface/musicPlayer'
import Slider from 'rc-slider'
import ClassicModal from '../items/ClassicModal'
import { getArenaPattern, getRandomPattern } from '../others/toolBox'
import { IoMdSettings } from 'react-icons/io'
import { IoGameControllerSharp } from 'react-icons/io5'
import { toast } from 'react-toastify'
import ArenaPicker from '../others/ArenaPicker'

const Lobby = () => {
  const { lobbyId } = useParams()
  const [lobbyData, setLobbyData] = useState(null)
  const [player1, setPlayer1] = useState(null)
  const [player2, setPlayer2] = useState(null)
  const [ready, setReady] = useState(false)
  const [isUserHost, setIsUserHost] = useState(true)

  const [mapChoice, setMapChoice] = useState(false)

  const [selectedMap, setSelectedMap] = useState(null)
  const [cardsPerHand, setCardsPerHand] = useState(8)

  const { userSettings, user } = useContext(AuthContext)
  const leaveLobby = useLeaveLobby()
  const createGame = useCreateGame()
  const navigate = useNavigate()

  useEffect(() => {
    if (!lobbyId) return

    const lobbyRef = doc(db, 'lobbies', lobbyId)
    const unsubscribe = onSnapshot(lobbyRef, (doc) => {
      if (doc.exists()) {
        setLobbyData(doc.data())
      } else {
        console.log("Le document du lobby n'existe pas !")
        setLobbyData(null)
        navigate('/lobbyList')
      }
    })

    return () => unsubscribe()
  }, [lobbyId])

  useEffect(() => {
    // Fonction pour récupérer les informations du joueur
    const fetchPlayerInfo = async (playerRef) => {
      if (!playerRef) return null
      const playerSnapshot = await getDoc(playerRef)
      if (playerSnapshot.exists()) {
        return playerSnapshot.data()
      } else {
        console.log("Le document du joueur n'existe pas !")
        return null
      }
    }

    if (lobbyData) {
      // Récupère les informations de j1
      fetchPlayerInfo(lobbyData.j1).then(setPlayer1)
      // Récupère les informations de j2
      fetchPlayerInfo(lobbyData.j2).then(setPlayer2)

      if (lobbyData.gameRef) {
        const gameRef = doc(db, 'games', lobbyData.gameRef)
        updateDoc(gameRef, {
          disconnected: arrayRemove(user.uid)
        })
          .then(() => {
            setTimeout(
              () => {
                navigate(`/game/${lobbyData.gameRef}`)
              },
              lobbyData.gamemode === 'custom' ? 100 : 4000
            )
          })
          .catch((error) => {
            console.error('Erreur lors de la mise à jour du document de jeu: ', error)
          })
      }
      setIsUserHost(user && user.uid === lobbyData.j1?.id ? true : false)
    }
  }, [lobbyData])

  useEffect(() => {
    let timeoutId
    if ((!player1 || !player2) && lobbyData && lobbyData.gamemode !== 'custom') {
      timeoutId = setTimeout(() => {
        if (!player1 || !player2) {
          setTimerExpired(true)
          toast.error('Une erreur est survenue')
          navigate('/home')
        }
      }, 15000)
    }

    return () => clearTimeout(timeoutId)
  }, [player1, player2, navigate, lobbyData])

  useEffect(() => {
    if (player1 && player2) {
      setReady(true)
    } else {
      setReady(false)
    }
  }, [player1, player2])

  useEffect(() => {
    if (ready && lobbyData.gamemode !== 'custom' && !lobbyData.gameRef && isUserHost) {
      let map = !selectedMap ? getRandomPattern() : selectedMap.pattern
      createGame(
        lobbyId,
        lobbyData.j1,
        lobbyData.j2,
        null,
        {
          cards: cardsPerHand,
          map: {
            cellToRemove: map[0],
            bases: map[1]
          }
        },
        lobbyData.gamemode
      )
    }
  }, [ready])

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

          {isUserHost && (
            <div className="lobby-settings">
              <h3>
                {' '}
                <IoMdSettings size={40} />
                Paramètres
              </h3>
              <hr />
              <div className="lobby-settings-item">
                <span>Nombres de cartes en main : {cardsPerHand}</span>
                <Slider
                  onChange={(nextValues) => {
                    setCardsPerHand(nextValues)
                  }}
                  min={3}
                  max={10}
                  defaultValue={8}
                  step={1}
                  styles={{
                    handle: { backgroundColor: 'white', borderColor: 'white' },
                    track: { backgroundColor: 'white', borderColor: 'white' },
                    rail: { backgroundColor: 'rgba(255,255,255, 0.5' }
                  }}
                />
              </div>
              <div className="lobby-settings-item">
                <Button
                  onClick={() => {
                    setMapChoice(true)
                  }}
                >
                  Arène actuelle : {!selectedMap ? 'Aléatoire' : selectedMap.pattern[2]}
                </Button>
                {/* <Button onClick={() => {}}>Modifier le deck</Button> */}
              </div>
            </div>
          )}
          <div className="lobby-controls-buttons">
            <h3>
              <IoGameControllerSharp /> Contrôle
            </h3>
            <hr />
            {isUserHost && (
              <Button
                className={`${!ready && 'disabled'}`}
                onClick={() => {
                  if (ready) {
                    let map = !selectedMap ? getRandomPattern() : selectedMap.pattern
                    createGame(
                      lobbyId,
                      lobbyData.j1,
                      lobbyData.j2,
                      null,
                      {
                        cards: cardsPerHand,
                        map: {
                          cellToRemove: map[0],
                          bases: map[1]
                        }
                      },
                      'custom'
                    )
                  }
                }}
              >
                Commencer la partie
              </Button>
            )}
            <Button
              onClick={() => {
                leaveLobby(lobbyId)
              }}
            >
              Quitter le lobby
            </Button>
          </div>
          <MusicPlayer role="menu" />
        </div>
      )}
      <div className="lobby-players">
        <div className="lobby-players-item">
          {player1 ? (
            <div className="lobby-players-item-content">
              <ProfilePicture customUser={player1} size={300} />
              <span className="lobby-players-name">{player1.username}</span>
            </div>
          ) : (
            <span className="loader"></span>
          )}
        </div>

        <span className="lobby-players-versus">CONTRE</span>

        <div className="lobby-players-item">
          {player2 ? (
            <div className="lobby-players-item-content">
              <ProfilePicture customUser={player2} size={300} />
              <span className="lobby-players-name">{player2.username}</span>
            </div>
          ) : (
            <div className="lobby-players-item-content">
              <span className="loader"></span>
              <span className="lobby-players-name">En attente...</span>
            </div>
          )}
        </div>
      </div>

      {mapChoice && (
        <ClassicModal>
          <ArenaPicker selectedMap={selectedMap} setSelectedMap={setSelectedMap} />
          <Button
            onClick={() => {
              setMapChoice(false)
            }}
          >
            Retour
          </Button>
        </ClassicModal>
      )}

      <CardsBackground animate={userSettings.bgOn} />
    </div>
  )
}

export default Lobby
