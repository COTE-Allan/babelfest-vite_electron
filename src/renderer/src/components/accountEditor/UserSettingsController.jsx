import { useContext, useState } from 'react'
import { AuthContext } from '../../AuthContext'

import Button from '../items/Button'

import { sendEmailVerification, updatePassword } from 'firebase/auth'
import { toast } from 'react-toastify'

export default function UserSettingsController() {
  const { user, updateUser, userInfo, changeEmail, verifMailSent, setVerifMailSent } =
    useContext(AuthContext)

  const [username, setUsername] = useState(null)
  const [email, setEmail] = useState(null)
  const [password, setPassword] = useState(null)
  const [confirmPassword, setConfirmPassword] = useState(null)

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
            toast.error(error)
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
        <div className="userSettings-input">
          <label htmlFor="usernameInput">Nom d'utilisateur</label>
          <input
            id="usernameInput"
            type="text"
            defaultValue={userInfo.username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="userSettings-input">
          <label htmlFor="usernameInput">Définir un mot de passe</label>
          <input
            id="usernameInput"
            type="password"
            placeholder="Nouveau mot de passe"
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            id="usernameInput"
            type="password"
            placeholder="Confirmer le mot de passe"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {user.emailVerified && ((password && confirmPassword) || username) && (
          <Button onClick={handleUpdateUser}>Sauvegarder</Button>
        )}
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
    </div>
  )
}
