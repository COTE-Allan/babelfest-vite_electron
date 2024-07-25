import { auth } from '../../Firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

import '../../styles/pages/home.scss'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../items/Button'
import CardsBackground from '../esthetics/CardsBackground'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const navigate = useNavigate()

  const [error, setError] = useState('')

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
      toast.success('Vous êtes maintenant connecté, bonne visite !')
    } catch (error) {
      setError(error.message)
      toast.error('Erreur : ' + error)
    }
  }

  return (
    <div className="home">
      <div className="home-content">
        <h1>Connexion</h1>
        <div className="home-form">
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
          <Button className="home-button" onClick={login}>
            Connexion
          </Button>
          <NavLink to={'/register'}>Vous n'avez pas de compte, inscrivez-vous !</NavLink>
        </div>
      </div>
      <CardsBackground animate={false} />
    </div>
  )
}

export default Login
