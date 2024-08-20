import { auth, db } from '../../Firebase'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'

import '../../styles/pages/home.scss'
import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../items/Button'
import CardsBackground from '../esthetics/CardsBackground'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [errorEmail, setErrorEmail] = useState('')
  const [errorPassword, setErrorPassword] = useState('')
  const [errorConfirmPassword, setErrorConfirmPassword] = useState('')
  const [errorUsername, setErrorUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validateForm = () => {
    let valid = true
    setErrorEmail('')
    setErrorPassword('')
    setErrorConfirmPassword('')
    setErrorUsername('')

    if (!username) {
      setErrorUsername("Nom d'utilisateur requis.")
      valid = false
    }

    if (!email) {
      setErrorEmail('Adresse email requise.')
      valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorEmail('Adresse email invalide.')
      valid = false
    }

    if (!password) {
      setErrorPassword('Mot de passe requis.')
      valid = false
    } else if (password.length < 6) {
      setErrorPassword('Le mot de passe doit comporter au moins 6 caractères.')
      valid = false
    }

    if (password !== confirmPassword) {
      setErrorConfirmPassword('Les mots de passe ne correspondent pas.')
      valid = false
    }

    return valid
  }

  const handleFirebaseError = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return "L'adresse email est déjà utilisée."
      case 'auth/invalid-email':
      case 'auth/invalid-credential':
        return 'Adresse email invalide.'
      case 'auth/weak-password':
        return 'Le mot de passe est trop faible.'
      default:
        return "Erreur lors de l'inscription. Veuillez réessayer."
    }
  }

  const register = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      const userRef = doc(db, 'users', user.uid)
      await setDoc(userRef, {
        username: username,
        profilePic:
          'https://res.cloudinary.com/dxdtcakuv/image/upload/v1705073934/babelfest/skins/profilePics/avatarLogoBabel.webp',
        flags: ['betaTest'],
        primaryColor: '#40a8f5',
        secondaryColor: '#e62e31',
        banner:
          'https://res.cloudinary.com/dxdtcakuv/image/upload/w_315/v1708684919/babelfest/skins/banner/defaultBanner.webp',
        level: 1,
        xp: 0,
        title: 'level',
        settings: {
          bgOn: true,
          sfxVolume: 0.5,
          tutorial: true,
          musicPlayer: false
        },
        stats: {
          gamesPlayed: 0,
          victories: 0
        }
      })

      sendEmailVerification(user)
        .then(() => {
          toast.success('Vous avez reçu un mail de confirmation.')
        })
        .catch((error) => {
          toast.error("Erreur lors de l'envoi de l'email de vérification.")
        })

      navigate('/login')
    } catch (error) {
      const errorMessage = handleFirebaseError(error.code)
      setErrorEmail(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home fullscreen">
      <div className="home-content">
        <h1>Inscription</h1>
        <div className="home-form">
          <div className="home-form-input">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nom d'utilisateur"
            />
            {errorUsername && <div className="error-message">{errorUsername}</div>}
          </div>
          <div className="home-form-input">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Adresse email"
            />
            {errorEmail && <div className="error-message">{errorEmail}</div>}
          </div>
          <div className="home-form-input">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
            />
            {errorPassword && <div className="error-message">{errorPassword}</div>}
          </div>
          <div className="home-form-input">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmer le mot de passe"
            />
            {errorConfirmPassword && <div className="error-message">{errorConfirmPassword}</div>}
          </div>
          <Button className="home-button" onClick={register} disabled={loading}>
            {loading ? 'Inscription...' : 'Inscription'}
          </Button>
          <NavLink to={'/login'}>Retour à la connexion</NavLink>
        </div>
      </div>
      <CardsBackground animate={false} />
    </div>
  )
}

export default Register
