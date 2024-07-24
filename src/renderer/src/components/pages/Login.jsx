import { auth } from '../../Firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

import '../../styles/pages/home.scss'
import MenuFooter from '../interface/MenuFooter'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../items/Button'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const navigate = useNavigate()

  const [error, setError] = useState('')

  const login = async () => {
    navigate('/')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Vous êtes maintenant connecté, bonne visite !')
    } catch (error) {
      setError(error.message)
      toast.error('Erreur : ' + error)
    }
  }

  return (
    <div className="home">
      <div className="home-content">
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
          <NavLink to={'/register'}>Vous n'avez pas de compte ? Inscrivez-vous !</NavLink>
        </div>
      </div>
      <MenuFooter />
    </div>
  )
}

export default Login
