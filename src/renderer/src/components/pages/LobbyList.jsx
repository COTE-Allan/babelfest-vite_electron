import { useContext, useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../../Firebase'
import { useCreateLobby, useJoinLobby } from '../controllers/ManageLobbyAndGame'
import Button from '../items/Button'
import '../../styles/pages/lobbyList.scss'
import Modal from '../items/ClassicModal'
import { AuthContext } from '../../AuthContext'
import { FaLock, FaPlusCircle, FaUser } from 'react-icons/fa'
import { toast } from 'react-toastify'
import changelog from '../../jsons/changelog.json'
import { useSendMessage } from '../others/toolBox'
import BackButton from '../items/BackButton'

export default function LobbyList() {
  const verName = changelog.slice(-1)[0].title
  const { user, userInfo } = useContext(AuthContext)
  const [lobbies, setLobbies] = useState([])

  const [askNewLobby, setAskNewLobby] = useState(false)
  const [askPassword, setAskPassword] = useState(false)

  const [lobbyName, setLobbyName] = useState(null)
  const [lobbyPassword, setLobbyPassword] = useState(null)
  const [joinLobbyPassword, setJoinLobbyPassword] = useState(null)

  const joinLobby = useJoinLobby()
  const createLobby = useCreateLobby()
  const sendMessage = useSendMessage()

  const fetchLobbies = () => {
    const collectionRef = collection(db, 'lobbies')
    const q = query(collectionRef, where('gamemode', '==', 'custom'))

    onSnapshot(q, (snapshot) => {
      const lobbiesList = snapshot.docs.map((doc) => {
        const data = doc.data()
        const freeSpace = !data.j1 || !data.j2
        return {
          id: doc.id,
          ...data,
          freeSpace
        }
      })
      setLobbies(lobbiesList)
    })
  }

  const handleCreateLobby = () => {
    if (lobbyName !== null && !lobbies.find((lobby) => lobby.name === lobbyName)) {
      createLobby({
        name: lobbyName,
        password: lobbyPassword,
        version: verName,
        gamemode: 'custom',
        creator: userInfo.username
      })
    } else {
      sendMessage('Ce nom de salon est invalide ou déjà utilisé.')
    }
  }

  useEffect(() => {
    fetchLobbies()
  }, [])

  const handleJoinLobby = (lobbyID) => {
    const foundLobby = lobbies.find((lobby) => lobby.id === lobbyID)
    if (foundLobby.version !== verName) {
      sendMessage('Tu ne peux pas accéder à ce lobby car la version du jeu est différente.')
    } else {
      if (!foundLobby.gameRef && !foundLobby.j1.id !== user.uid && !foundLobby.j2) {
        joinLobby(lobbyID)
      } else {
        // rejoindre en spec LOCKED
        // if (foundLobby.gameRef) {
        //   joinGameAsSpectator(foundLobby.gameRef)
        // } else {
        //   sendMessage(
        //     'Attendez que cette partie commence pour la rejoindre en tant que spectateur.'
        //   )
        // }
      }
    }
  }

  return (
    <div className="lobbies">
      <BackButton />
      <div className="lobbies-wrapper">
        <Button
          className="lobbies-btn"
          onClick={() => {
            setAskNewLobby(true)
          }}
        >
          <FaPlusCircle size={25} />
          Créer un salon
        </Button>

        <div className="lobbies-content">
          <h2>Lobbies disponibles</h2>
          <ul className="lobbies-list">
            {lobbies.length > 0 ? (
              lobbies.map((lobby) => (
                <li
                  key={lobby.id}
                  onClick={() => {
                    if (lobby.password) {
                      setAskPassword({ password: lobby.password, id: lobby.id })
                    } else {
                      handleJoinLobby(lobby.id)
                    }
                  }}
                  className="lobbies-list-item"
                >
                  <span>
                    Lobby de {lobby.creator} - {lobby.name}
                  </span>
                  <span>
                    <FaUser />
                    {lobby.freeSpace ? '1/2' : '2/2'} {lobby.gameRef && ' - En jeu'}
                    {lobby.password && <FaLock />}
                    <span>- v{lobby.version}</span>
                  </span>
                </li>
              ))
            ) : (
              <p>Pas de lobbies disponibles...</p>
            )}
          </ul>
        </div>

        {askNewLobby && (
          <Modal>
            <div className="modal-container">
              <input
                onChange={(e) => setLobbyName(e.target.value)}
                type="text"
                placeholder="Nom du salon"
              />
              <input
                onChange={(e) => setLobbyPassword(e.target.value)}
                type="text"
                placeholder="Mot de passe (optionnel)"
              />
              <Button onClick={handleCreateLobby}>Créer le salon</Button>
              <Button
                onClick={() => {
                  setAskNewLobby(false)
                }}
              >
                Retour
              </Button>
            </div>
          </Modal>
        )}

        {askPassword && (
          <Modal>
            <div className="modal-container">
              <input
                onChange={(e) => setJoinLobbyPassword(e.target.value)}
                type="text"
                placeholder="Mot de passe"
              />
              <Button
                onClick={() => {
                  if (askPassword.password === joinLobbyPassword) {
                    handleJoinLobby(askPassword.id)
                  } else {
                    sendMessage('Le mot de passe est incorrect.')
                  }
                }}
              >
                Rejoindre la partie
              </Button>
              <Button
                onClick={() => {
                  setAskPassword(false)
                }}
              >
                Retour
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}
