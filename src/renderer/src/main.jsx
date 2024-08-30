import React from 'react'
import ReactDOM from 'react-dom/client'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import './styles/index.scss'
import Home from './components/pages/Home'
import Library from './components/pages/Library'
import { GlobalProvider } from './components/providers/GlobalProvider'
import Login from './components/pages/Login'
import { AuthContext, AuthProvider } from './AuthContext'
import Account from './components/pages/Account'
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
import UserProfile from './components/pages/UserProfile'
import Leaderboards from './components/pages/Leaderboards'
import ArenasList from './components/pages/ArenasList'
import TransitionWrapper from './TransitionWrapper'
import { TransitionProvider } from './TransitionContext'
import MusicPlayer from './components/interface/musicPlayer'
import { MusicProvider } from './components/providers/MusicProvider'
import BackButton from './components/items/BackButton'
import MenuCard from './components/items/MenuCard'
import MenuCardCatalog from './assets/img/catalogMenuCard.jpg'
import MenuCardArena from './assets/img/arenasMenuCard.jpg'

import './styles/items/menuCard.scss'

// Composant Layout
const Layout = ({ children }) => {
  return (
    <MatchmakingProvider>
      <MusicProvider>
        {children}
        <UpdateNotifier />
      </MusicProvider>
    </MatchmakingProvider>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

const AppContent = () => {
  const { userSettings } = React.useContext(AuthContext)

  return (
    <>
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
        <TransitionProvider>
          <CardsBackground animate={userSettings?.bgOn} />
          <Routes>
            <Route path="/" element={<Loading />} />
            <Route
              path="/home"
              element={
                <Layout>
                  <TransitionWrapper>
                    <Home />
                  </TransitionWrapper>
                </Layout>
              }
            />
            <Route
              path="/compendium"
              element={
                <Layout>
                  <TransitionWrapper>
                    <div className="MenuCard-container">
                      <MenuCard
                        name="Catalogue"
                        desc="Consultez les cartes présente dans le jeu."
                        where="/catalog"
                        bg={MenuCardCatalog}
                      />
                      <MenuCard
                        name="Effets"
                        desc="Consultez la liste des effets disponibles."
                        where="/effects"
                      />
                      <MenuCard
                        name="Arènes"
                        desc="Consultez la liste des arènes jouables."
                        where="/arenasList"
                        bg={MenuCardArena}
                      />
                      <BackButton />
                    </div>
                  </TransitionWrapper>
                </Layout>
              }
            />
            <Route
              path="/catalog"
              element={
                <Layout>
                  <TransitionWrapper>
                    <Library />
                  </TransitionWrapper>
                </Layout>
              }
            />
            <Route
              path="/effects"
              element={
                <Layout>
                  <TransitionWrapper>
                    <Effects />
                  </TransitionWrapper>
                </Layout>
              }
            />
            <Route path="/game/:room" element={<GlobalProvider />} />
            <Route path="/tutorial" element={<TutorialProvider />} />
            <Route
              path="/lobbyList"
              element={
                <Layout>
                  <TransitionWrapper>
                    <LobbyList />
                  </TransitionWrapper>
                </Layout>
              }
            />
            <Route path="/lobby/:lobbyId" element={<Lobby />} />
            <Route
              path="/userProfile/:userId"
              element={
                <Layout>
                  <TransitionWrapper>
                    <UserProfile />
                  </TransitionWrapper>
                </Layout>
              }
            />
            <Route
              path="/arenasList"
              element={
                <Layout>
                  <TransitionWrapper>
                    <ArenasList />
                  </TransitionWrapper>
                </Layout>
              }
            />
            <Route
              path="/leaderboards"
              element={
                <Layout>
                  <TransitionWrapper>
                    <Leaderboards />

                  </TransitionWrapper>
                </Layout>
              }
            />
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
              path="/account/"
              element={
                <Layout>
                  <TransitionWrapper>
                    <Account />
                  </TransitionWrapper>
                </Layout>
              }
            />
            <Route
              path="/settings"
              element={
                <Layout>
                  <TransitionWrapper>
                    <Settings />
                  </TransitionWrapper>
                </Layout>
              }
            />
          </Routes>
        </TransitionProvider>
      </MemoryRouter>
    </>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
