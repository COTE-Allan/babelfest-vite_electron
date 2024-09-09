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

function SkinItem({ skin, userInfo }) {
  const { level, url, hex, gradient, name, classe } = skin
  const lock = userInfo.level >= level ? <FaLockOpen /> : <FaLock />
  let content

  if (url) {
    content = <img src={url} alt={`Skin ${name}`} draggable="false" />
  } else if (hex) {
    content = (
      <div
        className={`color ${skin.classes ? skin.classes : ''}`}
        style={{
          background: gradient ? `linear-gradient(to bottom, ${hex}, ${gradient})` : hex
        }}
      />
    )
  } else if (classe) {
    content = (
      <span className={`title prestige skin-title`}>
        <div className={classe}>{userInfo.username}</div>
      </span>
    )
  } else {
    content = <span className="skin-title">{name}</span>
  }

  return (
    <div
      className={`achievements-levels-item ${userInfo.level >= level && 'unlocked'}`}
      key={skin.id || skin.name}
    >
      <span className="level">{level}</span>
      <hr />
      {content}
      {skin.type !== 'Titre' && skin.type !== 'Prestige' && (
        <span className="skin-name">{name}</span>
      )}
      <span className="type">
        {skin.type} {lock}
      </span>
    </div>
  )
}

export default function UserAchievements({ userInfo }) {
  const { userSettings } = useContext(AuthContext)

  const skinsWithLevel = useMemo(() => getSkinsWithLevel(), [])

  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const [achievementInfos, setAchievementInfos] = useState({
    id: null,
    name: 'Bienvenue sur Babelfest',
    desc: 'Terminez le tutoriel.',
    objective: { value: 1 }
  })
  const [showUnlocked, setShowUnlocked] = useState(false)
  const [page, setPage] = useState(1)
  const [filteredSkinsWithLevel, setFilteredSkinsWithLevel] = useState([])
  const [achievementFilter, setAchievementFilter] = useState('all')
  const checkAchievementValue = useCheckAchievementValue()

  const toggleAchievementFilter = () => {
    select()
    setAchievementFilter((prev) => {
      if (prev === 'all') return 'unlocked'
      if (prev === 'unlocked') return 'locked'
      return 'all'
    })
  }

  useEffect(() => {
    const filteredSkins = showUnlocked
      ? skinsWithLevel
      : skinsWithLevel.filter((skin) => userInfo.level < skin.level)

    setFilteredSkinsWithLevel(filteredSkins)
  }, [showUnlocked, skinsWithLevel, userInfo.level])

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

  const filteredAchievements = achievements.filter((achievement) => {
    if (achievementFilter === 'all') return true
    if (achievementFilter === 'unlocked') return userInfo.achievements.includes(achievement.id)
    if (achievementFilter === 'locked') return !userInfo.achievements.includes(achievement.id)
  })

  return (
    <div className="achievements">
      <nav className="achievements-nav">
        <HudNavLink onClick={() => setPage(1)} selected={page === 1} permOpen>
          <FaTrophy size={45} />
          <span className="hidden-span">Succès</span>
        </HudNavLink>
        <HudNavLink onClick={() => setPage(2)} selected={page === 2} permOpen>
          <FaArrowTrendUp size={45} />
          <span className="hidden-span">Niveaux</span>
        </HudNavLink>
      </nav>
      <TransitionGroup className="achievements-content">
        {page === 1 && (
          <CSSTransition key="ach-1" timeout={300} classNames="fade">
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
                      <span>
                        {achievement.desc} <br />
                      </span>
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
        {page === 2 && (
          <CSSTransition key="ach-2" timeout={300} classNames="fade">
            <div className="css-transition">
              <h2>
                Récompenses de niveaux - {levelCompletion.toFixed(0)}%{' '}
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
                {filteredSkinsWithLevel.map((skin) => {
                  console.log(skin)
                  return <SkinItem key={skin.id || skin.name} skin={skin} userInfo={userInfo} />
                })}
              </div>
            </div>
          </CSSTransition>
        )}
      </TransitionGroup>
    </div>
  )
}