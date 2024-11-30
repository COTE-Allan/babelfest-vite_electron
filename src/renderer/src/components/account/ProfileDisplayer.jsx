import LeaderboardPlayerBanner from '../items/LeaderboardPlayerBanner'
import ExperienceBar from '../interface/ExperienceBar'
import '../../styles/account/profileDisplayer.scss'
import BackButton from '../items/BackButton'
import StatsDisplayer from './StatsDisplayer'
import MatchSummaries from './MatchSummaries'
import HudNavLink from '../items/hudNavLink'
import { FaCog, FaSave, FaTrophy, FaTshirt, FaUserAlt } from 'react-icons/fa'
import HonorButton from '../items/HonorButton'
import { useContext, useState } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import UserAchievements from './UserAchievements'
import UserSettings from './UserSettings'
import UserCustomisation from './UserCustomisation'
import { ImCross } from 'react-icons/im'
import { AuthContext } from '../../AuthContext'
import { update } from 'lodash'
import { useSendMessage } from '../others/toolBox'
import LoadingLogo from '../items/LoadingLogo'
import { PiCards } from 'react-icons/pi'
import { TbCardsFilled } from 'react-icons/tb'
import DeckBuilder from './DeckBuilder'

export default function ProfileDisplayer({ userInfo, isMine, setUser, defaultPage }) {
  const [page, setPage] = useState(defaultPage)
  const [customizedUserInfo, setCustomizedUserInfo] = useState(null)
  const { updateUser } = useContext(AuthContext)
  const sendMessage = useSendMessage()

  const handleUpdateUser = async () => {
    await updateUser(customizedUserInfo)
    setUser(customizedUserInfo)
    setCustomizedUserInfo(null)
  }

  return (
    <div className="profileDisplayer">
      <BackButton />
      <div className="profileDisplayer-wrapper">
        {userInfo ? (
          <>
            <div className="profileDisplayer-user">
              <div className="profileDisplayer-user-banner">
                <LeaderboardPlayerBanner user={customizedUserInfo ?? userInfo} />
                <ExperienceBar customUserInfo={userInfo} />
              </div>
              {!isMine && (
                <div className="profileDisplayer-user-controller">
                  <HonorButton targetUser={userInfo} targetUserId={userInfo.id} />
                </div>
              )}
              {customizedUserInfo && (
                <div className="profileDisplayer-user-controller">
                  <HudNavLink permOpen onClick={handleUpdateUser} className="fade-in save">
                    <span className="hidden-span">Valider le skin</span>
                    <FaSave size={30} />
                  </HudNavLink>
                  <HudNavLink
                    permOpen
                    onClick={() => setCustomizedUserInfo(null)}
                    className="fade-in unsave"
                  >
                    <span className="hidden-span">Annuler le skin</span>
                    <ImCross size={30} />
                  </HudNavLink>
                </div>
              )}
            </div>
            <hr />
            <div className="profileDisplayer-controller">
              <HudNavLink selected={page === 1} permOpen onClick={() => setPage(1)}>
                <FaUserAlt size={45} />
                <span className="hidden-span">Statistiques</span>
              </HudNavLink>
              <HudNavLink selected={page === 2} permOpen onClick={() => setPage(2)}>
                <FaTrophy size={45} />
                <span className="hidden-span">Progression</span>
              </HudNavLink>
              {isMine && (
                <>
                  <HudNavLink selected={page === 6} permOpen onClick={() => setPage(6)}>
                    <TbCardsFilled size={45} />
                    <span className="hidden-span">Mes decks</span>
                  </HudNavLink>
                  <HudNavLink selected={page === 3} permOpen onClick={() => setPage(3)}>
                    <FaTshirt size={45} />
                    <span className="hidden-span">Customisation</span>
                  </HudNavLink>
                  <HudNavLink selected={page === 4} permOpen onClick={() => setPage(4)}>
                    <FaCog size={45} />
                    <span className="hidden-span">Modifier Profil</span>
                  </HudNavLink>
                </>
              )}
            </div>
            <hr />
            <TransitionGroup className="profileDisplayer-content">
              {page === 1 && (
                <CSSTransition key="stats" timeout={300} classNames="fade">
                  <div className="statsDisplayer-wrapper">
                    <StatsDisplayer user={userInfo} stats={userInfo.stats} />
                    {userInfo.matchSummaries?.length !== 0 && (
                      <>
                        <h3>Historique</h3>
                        <hr />
                        <MatchSummaries summaries={userInfo.matchSummaries} />
                      </>
                    )}
                  </div>
                </CSSTransition>
              )}
              {page === 2 && (
                <CSSTransition key="progression" timeout={300} classNames="fade">
                  <UserAchievements userInfo={userInfo} />
                </CSSTransition>
              )}
              {isMine && page === 3 && (
                <CSSTransition key="customisation" timeout={300} classNames="fade">
                  <UserCustomisation
                    user={userInfo}
                    customizedUserInfo={customizedUserInfo}
                    setCustomizedUserInfo={setCustomizedUserInfo}
                  />
                </CSSTransition>
              )}
              {isMine && page === 4 && (
                <CSSTransition key="edit-profile" timeout={300} classNames="fade">
                  <UserSettings />
                </CSSTransition>
              )}
              {isMine && page === 6 && (
                <CSSTransition key="edit-profile" timeout={300} classNames="fade">
                  <DeckBuilder />
                </CSSTransition>
              )}
            </TransitionGroup>
          </>
        ) : (
          <div className="profileDisplayer-loading">
            <LoadingLogo />
          </div>
        )}
      </div>
    </div>
  )
}
