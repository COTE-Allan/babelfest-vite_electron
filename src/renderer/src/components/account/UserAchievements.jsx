import React, { useContext, useState, useEffect, useMemo } from 'react'
import { getSkinsWithLevel } from '../others/toolBox'
import '../../styles/account/userAchievements.scss'
import achievements from '../../jsons/achievements.json'
import { AuthContext } from '../../AuthContext'
import { FaEye, FaEyeSlash, FaLock, FaLockOpen, FaTrophy } from 'react-icons/fa'
import { useCheckAchievementValue } from '../controllers/AchievementsController'
import HudNavLink from '../items/hudNavLink'
import { FaArrowTrendUp } from 'react-icons/fa6'
import useSound from 'use-sound'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { getCurrentExpMax } from '../others/xpSystem'
import { GiAchievement } from 'react-icons/gi'
import RankedInfos from './RankedInfos'
import SkinItem from './SkinItem'

export default function UserAchievements({ userInfo }) {
  const { userSettings } = useContext(AuthContext)

  const skinsWithLevel = useMemo(() => getSkinsWithLevel(), [])
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const [showUnlocked, setShowUnlocked] = useState(false)
  const [page, setPage] = useState(1)
  const [achievementFilter, setAchievementFilter] = useState('all')

  // Calculate player's current XP percentage
  const xpMax = getCurrentExpMax(userInfo.level)
  const xpPercentage = (userInfo.xp / xpMax) * 100

  // Filter to find the first skin not unlocked yet (next reward to unlock)
  const nextUnlockableSkin = skinsWithLevel.find((skin) => userInfo.level + 1 === skin.level)

  // Filter skins based on whether or not to show unlocked skins
  const filteredSkinsWithLevel = showUnlocked
    ? skinsWithLevel
    : skinsWithLevel.filter((skin) => userInfo.level < skin.level)

  // Filter achievements based on user selection
  const filteredAchievements = achievements.filter((achievement) => {
    if (achievementFilter === 'all') return true
    if (achievementFilter === 'unlocked') return userInfo.achievements.includes(achievement.id)
    if (achievementFilter === 'locked') return !userInfo.achievements.includes(achievement.id)
  })

  // Calculate achievement and level completion percentage
  const calculateAchievementCompletion = () => {
    if (!userInfo.achievements || userInfo.achievements.length === 0) return 0
    const unlockedAchievements = achievements.filter((achievement) =>
      userInfo.achievements.includes(achievement.id)
    )
    return (unlockedAchievements.length / achievements.length) * 100
  }

  const calculateLevelCompletion = () => {
    const unlockedSkins = skinsWithLevel.filter((skin) => userInfo.level >= skin.level)
    return (unlockedSkins.length / skinsWithLevel.length) * 100
  }

  const achievementCompletion = calculateAchievementCompletion()
  const levelCompletion = calculateLevelCompletion()

  const toggleAchievementFilter = () => {
    select()
    setAchievementFilter((prev) => {
      if (prev === 'all') return 'unlocked'
      if (prev === 'unlocked') return 'locked'
      return 'all'
    })
  }

  return (
    <div className="achievements">
      <nav className="achievements-nav">
        <HudNavLink onClick={() => setPage(1)} selected={page === 1} permOpen>
          <FaArrowTrendUp size={45} />
          <span className="hidden-span">Niveaux</span>
        </HudNavLink>
        <HudNavLink onClick={() => setPage(2)} selected={page === 2} permOpen>
          <GiAchievement size={45} />
          <span className="hidden-span">Succès</span>
        </HudNavLink>
        <HudNavLink onClick={() => setPage(3)} selected={page === 3} permOpen>
          <FaTrophy size={45} />
          <span className="hidden-span">Classé</span>
        </HudNavLink>
      </nav>

      <TransitionGroup className="achievements-content">
        {page === 3 && (
          <CSSTransition key="ranked-page" timeout={300} classNames="fade">
            <div className="css-transition">
              <RankedInfos />
            </div>
          </CSSTransition>
        )}
        {page === 2 && (
          <CSSTransition key="achievements-page" timeout={300} classNames="fade">
            <div className="css-transition">
              <h2>
                Succès - {achievementCompletion.toFixed(0)}%
                <button
                  onClick={toggleAchievementFilter}
                  className="filter-button"
                  onMouseEnter={hover}
                >
                  {achievementFilter === 'all' && 'Tous les succès'}
                  {achievementFilter === 'unlocked' && 'Seulement débloqué'}
                  {achievementFilter === 'locked' && 'Seulement bloqué'}
                </button>
              </h2>
              <div className="achievements-list">
                {filteredAchievements.map((achievement) => (
                  <div
                    onMouseEnter={hover}
                    className={`achievements-list-item ${
                      userInfo.achievements?.includes(achievement.id) ? 'unlocked' : ''
                    }`}
                    key={achievement.id}
                  >
                    <div className="achievements-list-item-infos">
                      <h3>
                        {achievement.name}{' '}
                        {!userInfo.achievements?.includes(achievement.id) && <FaLock />}
                      </h3>
                      <span>{achievement.desc}</span>
                    </div>
                    <div className="achievements-list-item-reward">
                      <img
                        src={achievement.url}
                        alt={`image du succès : ${achievement.name}`}
                        draggable="false"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CSSTransition>
        )}
        {page === 1 && (
          <CSSTransition key="levels-page" timeout={300} classNames="fade">
            <div className="css-transition">
              <h2>
                Récompenses de niveaux - {levelCompletion.toFixed(0)}%
                <button
                  onMouseEnter={hover}
                  onClick={() => {
                    select()
                    setShowUnlocked(!showUnlocked)
                  }}
                >
                  {showUnlocked ? (
                    <div className="filterUnlocked">
                      <FaEye size={25} /> Cacher débloqués
                    </div>
                  ) : (
                    <div className="filterUnlocked">
                      <FaEyeSlash size={25} />
                      Afficher débloqués
                    </div>
                  )}
                </button>
              </h2>
              <div className="achievements-list">
                {filteredSkinsWithLevel.map((skin) => (
                  <SkinItem
                    key={skin.id || skin.name}
                    skin={skin}
                    userInfo={userInfo}
                    xpPercentage={
                      nextUnlockableSkin && skin.level === nextUnlockableSkin.level
                        ? xpPercentage
                        : 0
                    } // Apply XP progress only to the next unlockable skin
                  />
                ))}
              </div>
            </div>
          </CSSTransition>
        )}
      </TransitionGroup>
    </div>
  )
}
