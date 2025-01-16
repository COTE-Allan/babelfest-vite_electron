import { auth, db } from '../../Firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut
} from 'firebase/auth'
import { doc, getDocs, setDoc } from 'firebase/firestore'

import '../../styles/pages/home.scss'
import { useState, useEffect, useRef, useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../items/Button'
import CardsBackground from '../esthetics/CardsBackground'
import { ServerContext } from '../../ServerContext'
import Logo from '../../assets/svg/babelfest.svg'
import { useSendMessage } from '../others/toolBox'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [errorEmail, setErrorEmail] = useState('')
  const [errorPassword, setErrorPassword] = useState('')
  const [errorConfirmPassword, setErrorConfirmPassword] = useState('')
  const [errorUsername, setErrorUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const navigate = useNavigate()
  const { serverStatus } = useContext(ServerContext)
  const sendMessage = useSendMessage()
  // Refs pour gérer le focus automatique
  const emailInputRef = useRef(null)
  const usernameInputRef = useRef(null)

  // Réinitialiser les erreurs et gérer le focus lors du changement de mode
  useEffect(() => {
    window.api.invoke('get-mail').then((savedEmail) => {
      console.log(savedEmail)
      setEmail(savedEmail)
    })

    setErrorEmail('')
    setErrorPassword('')
    setErrorConfirmPassword('')
    setErrorUsername('')

    // Focus sur le premier champ pertinent
    if (isRegisterMode && usernameInputRef.current) {
      usernameInputRef.current.focus()
    } else if (emailInputRef.current) {
      emailInputRef.current.focus()
    }
  }, [isRegisterMode])

  const validateForm = () => {
    let valid = true
    setErrorEmail('')
    setErrorPassword('')
    setErrorConfirmPassword('')
    setErrorUsername('')

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
    } else if (isRegisterMode && password.length < 6) {
      setErrorPassword('Le mot de passe doit comporter au moins 6 caractères.')
      valid = false
    }

    if (isRegisterMode && password !== confirmPassword) {
      setErrorConfirmPassword('Les mots de passe ne correspondent pas.')
      valid = false
    }

    if (isRegisterMode && !username) {
      setErrorUsername("Nom d'utilisateur requis.")
      valid = false
    }

    return valid
  }

  const handleKeyPress = (e) => {
    console.log(e.key)
    if (e.key === 'Enter') {
      e.preventDefault()
      if (isRegisterMode) {
        handleRegister()
      } else {
        handleLogin()
      }
    }
  }

  const handleFirebaseError = (errorCode) => {
    console.log(errorCode)
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Email ou mot de passe incorrect.'
      case 'auth/email-already-in-use':
        return "L'adresse email est déjà utilisée."
      case 'auth/invalid-email':
        return 'Adresse email invalide.'
      case 'auth/user-disabled':
        return 'Ce compte a été désactivé.'
      case 'auth/weak-password':
        return 'Le mot de passe est trop faible.'
      case 'auth/too-many-requests':
        return 'Veuillez vérifier votre email avant de vous connecter. Un nouvel email de vérification a été envoyé.'
      default:
        return 'Erreur lors de la connexion. Veuillez réessayer.'
    }
  }

  const handleLogin = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      if (serverStatus === 'offline') {
        toast.error('Les serveurs sont fermés pour le moment.')
        return
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (!user.emailVerified) {
        await sendEmailVerification(user)
        setErrorEmail(
          'Veuillez vérifier votre email avant de vous connecter. Un nouvel email de vérification a été envoyé.'
        )
        toast.error('Veuillez vérifier votre email avant de vous connecter.')
      } else {
        window.api.send('save-mail', email)
        toast.success('Vous êtes maintenant connecté, bonne visite !')
        setTimeout(() => {
          navigate('/')
        }, 500)
      }
    } catch (error) {
      const errorMessage = handleFirebaseError(error.code)
      setErrorEmail(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!validateForm()) return
    setLoading(true)
    try {
      // Créer un nouvel utilisateur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Enregistrer les informations de l'utilisateur dans Firestore
      const userRef = doc(db, 'users', user.uid)
      await setDoc(userRef, {
        username: username,
        id: user.uid,
        skin: {
          avatar: './skins/avatars/avatar_babelfest.png',
          primaryColor: { hex: '#40a8f5' },
          secondaryColor: { hex: '#e62e31' },
          banner: './skins/banners/banner_default.png',
          title: 'level'
        },
        stats: {
          gamesPlayed: 0,
          victories: 0,
          mmr: 500,
          winStreak: 0,
          longestWinStreak: 0,
          pr: 0,
          maxPr: 0,
          prSeasonId: null,
          honor: 0,
          honored: { quantity: 0, timestamp: 0 },
          level: 1,
          xp: 0,
          coins: 0
        },
        achievements: [],
        matchSummaries: [],
        flags: ['betaTest', 'stressRush']
      })

      await sendEmailVerification(user)
      await signOut(auth) // Déconnecter l'utilisateur immédiatement
      toast.success('Inscription réussie ! Veuillez vérifier votre email avant de vous connecter.')
      setIsRegisterMode(false) // Revenir au mode connexion
    } catch (error) {
      const errorMessage = handleFirebaseError(error.code)
      setErrorEmail(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email) {
      sendMessage(
        'Veuillez entrer votre adresse email pour réinitialiser votre mot de passe.',
        'error'
      )
      return
    }

    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success('Un email de réinitialisation du mot de passe a été envoyé.')
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
      {serverStatus === 'offline' ? (
        <div className="home-content">
          <img src={Logo} className="logo" alt="Babelfest Logo" width={400} />
          <h1>Les serveurs du jeu sont actuellements fermés.</h1>
          <h2>Revenez plus tard !</h2>
        </div>
      ) : (
        <div className="home-content">
          <img src={Logo} className="logo" alt="Babelfest Logo" width={400} />
          <h1>{isRegisterMode ? 'Inscription' : 'Connexion'}</h1>
          <div className="home-form" onKeyDown={handleKeyPress}>
            {isRegisterMode && (
              <div className="home-form-input">
                <input
                  className={errorUsername && 'placeholder-warning'}
                  type="text"
                  value={username}
                  maxLength={10} // Limite le nombre de caractères à 10
                  onChange={(e) => {
                    const value = e.target.value
                    if (value.length <= 10) {
                      setUsername(value)
                    }
                  }}
                  placeholder={errorUsername ? errorUsername : "Nom d'utilisateur"}
                  ref={usernameInputRef}
                />
              </div>
            )}
            <div className="home-form-input">
              <input
                className={errorEmail && 'placeholder-warning'}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={errorEmail ? errorEmail : 'Adresse email'}
                ref={emailInputRef}
              />
            </div>
            <div className="home-form-input">
              <input
                className={errorPassword && 'placeholder-warning'}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={errorPassword ? errorPassword : 'Mot de passe'}
              />
            </div>
            {isRegisterMode && (
              <div className="home-form-input">
                <input
                  className={errorConfirmPassword && 'placeholder-warning'}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={
                    errorConfirmPassword ? errorConfirmPassword : 'Confirmer le mot de passe'
                  }
                />
              </div>
            )}
            <Button
              className="home-button"
              type="submit"
              onClick={isRegisterMode ? handleRegister : handleLogin}
              disabled={loading}
            >
              {loading ? 'Envoi en cours...' : isRegisterMode ? 'Inscription' : 'Connexion'}
            </Button>
            {!isRegisterMode && (
              <Button
                className="forgot-password-button"
                onClick={handlePasswordReset}
                disabled={loading}
              >
                Mot de passe oublié ?
              </Button>
            )}
            <NavLink
              to="#"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="switch-mode-link"
            >
              {isRegisterMode
                ? 'Vous avez déjà un compte ? Connectez-vous ici !'
                : "Vous n'avez pas de compte ? Inscrivez-vous ici !"}
            </NavLink>
          </div>
        </div>
      )}
      {/* <CardsBackground animate={false} /> */}
    </div>
  )
}

export default Login
