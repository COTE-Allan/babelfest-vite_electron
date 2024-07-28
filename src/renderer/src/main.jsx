import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { MemoryRouter, Routes, Route } from 'react-router-dom' // Utilisation de MemoryRouter
import './styles/index.scss'
import Home from './components/pages/Home'
import Library from './components/pages/Library'
import { GlobalProvider } from './components/providers/GlobalProvider'
import { SpectatorProvider } from './components/providers/SpectatorProvider'
import MenuHeader from './components/interface/MenuHeader'
import Login from './components/pages/Login'
import { AuthContext, AuthProvider } from './AuthContext'
import Account from './components/pages/Account'
import Register from './components/pages/Register'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './styles/toast.scss'
import CardsBackground from './components/esthetics/CardsBackground'
import Settings from './components/pages/Settings'
import Effects from './components/pages/Effects'
import Lobby from './components/pages/Lobby'
import LobbyList from './components/pages/LobbyList'
import Loading from './components/pages/Loading'
import { MatchmakingProvider } from './components/providers/MatchmakingProvider'
import UpdateNotifier from './UpdateNotifier'
import { TutorialProvider } from './components/providers/TutorialProvider'

// Composant Layout
const Layout = ({ children }) => {
  const { userSettings } = React.useContext(AuthContext)
  return (
    <MatchmakingProvider>
      <MenuHeader />
      {children}
      <UpdateNotifier />
      <CardsBackground animate={userSettings.bgOn} />
    </MatchmakingProvider>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Loading />} />
          <Route
            path="/home"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/library"
            element={
              <Layout>
                <Library />
              </Layout>
            }
          />
          <Route
            path="/effects"
            element={
              <Layout>
                <Effects />
              </Layout>
            }
          />
          <Route path="/game/:room" element={<GlobalProvider />} />
          <Route path="/gameSpectator/:room" element={<SpectatorProvider />} />
          <Route path="/tutorial" element={<TutorialProvider />} />
          <Route
            path="/lobbyList"
            element={
              <Layout>
                <LobbyList />
              </Layout>
            }
          />
          <Route path="/lobby/:lobbyId" element={<Lobby />} />
          <Route
            path="/login"
            element={
              <>
                <Login />
                <UpdateNotifier />
              </>
            }
          />
          <Route
            path="/register"
            element={
              <>
                <Register />
                <UpdateNotifier />
              </>
            }
          />
          <Route
            path="/account"
            element={
              <Layout>
                <Account />
              </Layout>
            }
          />
          <Route
            path="/settings"
            element={
              <Layout>
                <Settings />
              </Layout>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
