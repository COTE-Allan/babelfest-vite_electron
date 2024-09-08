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
import Leaderboards from './components/pages/Leaderboards'
import ArenasList from './components/pages/ArenasList'
import TransitionWrapper from './TransitionWrapper'
import { TransitionProvider } from './TransitionContext'
import { MusicProvider } from './components/providers/MusicProvider'
import BackButton from './components/items/BackButton'
import MenuCard from './components/items/MenuCard'
import MenuCardCatalog from './assets/img/catalogMenuCard.jpg'
import MenuCardArena from './assets/img/arenasMenuCard.jpg'
import MenuCardEffects from './assets/img/effectsMenuCard.png'

import './styles/items/menuCard.scss'
import GamemodeSelect from './components/pages/GamemodeSelect'
import MatchmakingQueue from './components/pages/MatchmakingQueue'
import MatchmakingTracker from './components/interface/MatchmakingTracker'

// Composant Layout
const Layout = ({ children }) => {
  return (
    <MatchmakingProvider>
      {children}
      <UpdateNotifier />
      <MatchmakingTracker />
    </MatchmakingProvider>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <MusicProvider>
        <AppContent />
      </MusicProvider>
    </AuthProvider>
  )
}

const AppContent = () => {
  const { userSettings } = React.useContext(AuthContext)

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        limit={5}
        closeOnClick
        rtl={false}
        style={{right: 50}}
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
                      <div className="MenuCard-container-cards">
                        <div className="MenuCard-container-cards-list">
                          <MenuCard
                            name="Catalogue"
                            desc="Cherchez, filtrez et consultez les cartes"
                            where="/catalog"
                            bg={MenuCardCatalog}
                          />
                          <MenuCard
                            name="Effets"
                            desc="Consultez la liste des effets disponibles"
                            where="/effects"
                            bg={MenuCardEffects}
                          />
                          <MenuCard
                            name="Arènes"
                            desc="Affichez une liste de toutes les arènes jouables"
                            where="/arenasList"
                            bg={MenuCardArena}
                          />
                        </div>
                      </div>
                      <BackButton />
                    </div>
                  </TransitionWrapper>
                </Layout>
              }
            />
            <Route
              path="/gamemode"
              element={
                <Layout>
                  <TransitionWrapper>
                    <GamemodeSelect />
                  </TransitionWrapper>
                </Layout>
              }
            />
            <Route
              path="/matchmakingQueue/:gamemode"
              element={
                <Layout>
                  <TransitionWrapper>
                    <MatchmakingQueue />
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
              path="/account/:userId"
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
