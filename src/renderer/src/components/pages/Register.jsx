import { auth, db } from '../../Firebase'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'

import '../../styles/pages/home.scss'
import MenuFooter from '../interface/MenuFooter'
import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../items/Button'
import CardsBackground from '../esthetics/CardsBackground'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const navigate = useNavigate()

  const [error, setError] = useState('')

  const register = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      // Créer un document dans Firestore après l'inscription
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
      navigate('/login')
      sendEmailVerification(user)
        .then(() => {
          toast.success('Vous avez reçu un mail de confirmation.')
        })
        .catch((error) => {
          console.error("Erreur lors de l'envoi de l'email de vérification :", error)
        })
    } catch (error) {
      setError(error.message)
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
          </div>
          <div className="home-form-input">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Adresse email"
            />
          </div>
          <div className="home-form-input">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
            />
          </div>
          <Button className="home-button" onClick={register}>
            Inscription
          </Button>
          {error && <div>Error: {error}</div>}
          <NavLink to={'/login'}>Retour à la connexion</NavLink>
        </div>
      </div>
      <CardsBackground animate={false} />
    </div>
  )
}

export default Register
