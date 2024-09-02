import LeaderboardPlayerBanner from '../items/LeaderboardPlayerBanner'
import ExperienceBar from './ExperienceBar'
import '../../styles/interface/profileDisplayer.scss'
import BackButton from '../items/BackButton'
import StatsDisplayer from './StatsDisplayer'
import MatchSummaries from './MatchSummaries'
import HudNavLink from '../items/hudNavLink'
import { FaCog, FaTrophy, FaTshirt, FaUserAlt } from 'react-icons/fa'
import HonorButton from '../items/HonorButton'
import { useEffect, useState } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import UserAchievements from '../account/UserAchievements'
import UserSettings from '../account/UserSettingsController'
import { getPlayerRank } from '../others/toolBox'

export default function ProfileDisplayer({ userInfo, isMine }) {
  const [page, setPage] = useState(1)

  return (
    <div className="profileDisplayer">
      <BackButton />
      {userInfo && (
        <div className="profileDisplayer-wrapper">
          <div className="profileDisplayer-user">
            <div className="profileDisplayer-user-banner">
              <LeaderboardPlayerBanner user={userInfo} />
              <ExperienceBar customUserInfo={userInfo} />
            </div>
            {!isMine && (
              <div className="profileDisplayer-user-controller">
                <HonorButton targetUser={userInfo} targetUserId={userInfo.id} />
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
                  <h3>Historique</h3>
                  <hr />
                  <MatchSummaries summaries={userInfo.matchSummaries} />
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
                <></>
              </CSSTransition>
            )}
            {isMine && page === 4 && (
              <CSSTransition key="edit-profile" timeout={300} classNames="fade">
                <UserSettings />
              </CSSTransition>
            )}
          </TransitionGroup>
        </div>
      )}
    </div>
  )
}
