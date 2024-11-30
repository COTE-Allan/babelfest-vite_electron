import { useContext, useState } from 'react'
import { AuthContext } from '../../AuthContext'
import { signOut, deleteUser } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { doc, deleteDoc } from 'firebase/firestore'
import { ref, set, remove } from 'firebase/database'
import { toast } from 'react-toastify'
import { auth, db, realtimeDb } from '../../Firebase'

import Button from '../items/Button'
import Modal from '../items/ClassicModal'
import '../../styles/account/userSettings.scss'

export default function UserSettings() {
  const { user, updateUser, userInfo, changeEmail, verifMailSent, setVerifMailSent } =
    useContext(AuthContext)

  const [username, setUsername] = useState(null)
  const [email, setEmail] = useState(null)
  const [password, setPassword] = useState(null)
  const [confirmPassword, setConfirmPassword] = useState(null)
  const [loading, setLoading] = useState(false)
  const [askForLogout, setAskForLogout] = useState(false)
  const [askForDelete, setAskForDelete] = useState(false)
  const [askForDeleteStep2, setAskForDeleteStep2] = useState(false)
  const [askForDeleteStep3, setAskForDeleteStep3] = useState(false)
  const navigate = useNavigate()

  const updateOnlineStatus = async (userId) => {
    const statusRef = ref(realtimeDb, '/status/' + userId)
    await set(statusRef, { state: 'offline', last_changed: Date.now() })
  }

  const handleUpdateUser = async () => {
    let updates = {}

    if (username) updates.username = username
    if (Object.keys(updates).length !== 0) updateUser(updates)

    if (email) {
      changeEmail(email).then(() => {
        handleResendMail()
      })
    }

    if (password) {
      if (password === confirmPassword) {
        updatePassword(user, password)
          .then(() => {
            toast.success('Mot de passe mis à jour avec succès.')
          })
          .catch((error) => {
            toast.error(error.message)
          })
      } else {
        toast.error('Les mots de passe ne sont pas identiques.')
      }
    }

    cancelUpdate()
  }

  const handleResendMail = () => {
    sendEmailVerification(user)
      .then(() => {
        toast.success('Vous avez reçu un mail de confirmation.')
      })
      .catch((error) => {
        console.error("Erreur lors de l'envoi de l'email de vérification :", error)
      })
  }

  const handleLogout = async () => {
    try {
      await updateOnlineStatus(user.uid)
      await signOut(auth)
      navigate('/login')
      toast.success('Vous êtes maintenant déconnecté.')
    } catch (error) {
      toast.error('Erreur lors de la déconnexion : ' + error.message)
    }
  }

  const handleDeleteAccount = async () => {
    setLoading(true)
    try {
      await updateOnlineStatus(user.uid)

      const userDocRef = doc(db, 'users', user.uid)
      await deleteDoc(userDocRef)

      const statusRef = ref(realtimeDb, '/status/' + user.uid)
      await remove(statusRef)

      await deleteUser(user)
      toast.success('Votre compte a été supprimé avec succès.')
      navigate('/login')
    } catch (error) {
      toast.error('Erreur lors de la suppression du compte : ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const cancelUpdate = () => {
    setEmail(null)
    setUsername(null)
    setPassword(null)
    setConfirmPassword(null)
  }

  return (
    <div className="userSettings">
      <div className="userSettings-list">
        <h1>Modifier mon compte</h1>
        <hr />
        <div className="userSettings-input">
          <label htmlFor="usernameInput">Nom d'utilisateur</label>
          <input
            id="usernameInput"
            type="text"
            defaultValue={userInfo.username}
            maxLength={10} // Limite le nombre de caractères à 10
            onChange={(e) => {
              const value = e.target.value
              if (value.length <= 10) {
                setUsername(value)
              }
            }}
          />
        </div>
        <div className="userSettings-input">
          <label htmlFor="passwordInput">Définir un mot de passe</label>
          <input
            id="passwordInput"
            type="password"
            placeholder="Nouveau mot de passe"
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            id="confirmPasswordInput"
            type="password"
            placeholder="Confirmer le mot de passe"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {user.emailVerified && ((password && confirmPassword) || username) && (
          <Button onClick={handleUpdateUser}>Sauvegarder</Button>
        )}
      </div>
      <div className="userSettings-list">
        <h1>Contrôle du compte</h1>
        <hr />
        <Button className="account-profile-logout" onClick={() => setAskForLogout(true)}>
          Déconnexion
        </Button>
        <Button
          className="account-profile-delete warning"
          onClick={() => setAskForDelete(true)}
          disabled={loading}
        >
          Supprimer le compte
        </Button>
      </div>

      {!user.emailVerified && !verifMailSent && (
        <>
          <span className="alert">Vérifiez votre compte pour modifier ces données.</span>
          <Button
            onClick={() => {
              setVerifMailSent(true)
              handleResendMail()
            }}
          >
            Renvoyer un mail de confirmation
          </Button>
        </>
      )}

      {/* Modal de confirmation pour la déconnexion */}
      {askForLogout && (
        <Modal>
          <div className="modal-container">
            <span>Voulez-vous vraiment quitter Babelfest ?</span>
            <Button onClick={handleLogout}>Confirmer</Button>
            <Button onClick={() => setAskForLogout(false)}>Retour</Button>
          </div>
        </Modal>
      )}

      {/* Modal de confirmation pour la suppression de compte (Étape 1) */}
      {askForDelete && (
        <Modal>
          <div className="modal-container">
            <span>
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
            </span>
            <Button
              onClick={() => {
                setAskForDelete(false)
                setAskForDeleteStep2(true)
              }}
              disabled={loading}
              className="warning"
            >
              Oui, je suis sûr
            </Button>
            <Button onClick={() => setAskForDelete(false)}>Retour</Button>
          </div>
        </Modal>
      )}

      {/* Modal de confirmation pour la suppression de compte (Étape 2) */}
      {askForDeleteStep2 && (
        <Modal>
          <div className="modal-container">
            <span>C'est vraiment irréversible. Voulez-vous toujours continuer ?</span>
            <Button
              onClick={() => {
                setAskForDeleteStep2(false)
                setAskForDeleteStep3(true)
              }}
              disabled={loading}
              className="warning"
            >
              Oui, je veux continuer
            </Button>
            <Button onClick={() => setAskForDeleteStep2(false)}>Retour</Button>
          </div>
        </Modal>
      )}

      {/* Modal de confirmation pour la suppression de compte (Étape 3) */}
      {askForDeleteStep3 && (
        <Modal>
          <div className="modal-container">
            <span>Dernière chance. Êtes-vous absolument sûr ?</span>
            <Button onClick={handleDeleteAccount} disabled={loading} className="warning">
              Oui, supprimer définitivement
            </Button>
            <Button onClick={() => setAskForDeleteStep3(false)}>Retour</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
