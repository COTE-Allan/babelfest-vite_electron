import React, { useContext, useState, useEffect } from 'react'
import { getSkinsWithLevel } from '../others/toolBox'
import '../../styles/accountEditor/achievements.scss'
import achievements from '../../jsons/achievements.json'
import { AuthContext } from '../../AuthContext'
import ScrollContainer from 'react-indiana-drag-scroll'
import { FaEye, FaEyeSlash, FaLock, FaLockOpen } from 'react-icons/fa'

// Composant pour chaque skin
function SkinItem({ skin }) {
  const { userInfo } = useContext(AuthContext)
  const { level, url, hex, name } = skin
  const lock = userInfo.level >= level ? <FaLockOpen /> : <FaLock />

  let content
  if (url) {
    content = <img src={url} alt={`Skin ${name}`} draggable="false" />
  } else if (hex) {
    content = (
      <div
        className={`color ${skin.classes ? skin.classes : ''}`}
        style={{ backgroundColor: hex }}
      />
    )
  } else {
    content = <span className="title">{name}</span>
  }

  return (
    <div
      className={`achievements-levels-item ${userInfo.level >= level && 'unlocked'}`}
      key={skin.id || skin.name}
    >
      <span className="level">{level}</span>
      <hr />
      {content}
      {skin.type !== 'Titre' && <span className="name">{name}</span>}
      <span className="type">
        {skin.type} {lock}
      </span>
    </div>
  )
}

export default function UserAchievements() {
  const skinsWithLevel = getSkinsWithLevel()
  const { userInfo } = useContext(AuthContext)
  const [achievementInfos, setAchievementInfos] = useState({
    name: 'Bienvenue sur Babelfest',
    desc: 'Terminez le tutoriel.'
  })
  const [showUnlocked, setShowUnlocked] = useState(false)
  const [filteredSkinsWithLevel, setFilteredSkinsWithLevel] = useState([])

  useEffect(() => {
    console.log(skinsWithLevel)
    if (showUnlocked) {
      setFilteredSkinsWithLevel(skinsWithLevel)
    } else {
      setFilteredSkinsWithLevel(skinsWithLevel.filter((skin) => userInfo.level < skin.level))
    }
  }, [showUnlocked])

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

  return (
    <div className="achievements-container">
      <h2>Succès - {achievementCompletion.toFixed(0)}%</h2>
      <div className="achievements-infos">
        <h3>{achievementInfos.name}</h3>
        <span>{achievementInfos.desc}</span>
      </div>
      <div className="achievements-list">
        {achievements.map((achievement) => (
          <div
            onMouseEnter={() => {
              setAchievementInfos({
                name: userInfo.achievements?.includes(achievement.id)
                  ? achievement.name
                  : achievement.name + ' (Non atteint)',
                desc: achievement.desc
              })
            }}
            className={`achievements-list-item ${
              userInfo.achievements?.includes(achievement.id) ? 'unlocked' : ''
            }`}
            key={achievement.id}
          >
            <img
              src={achievement.url}
              alt={`image du succès : ${achievement.name}`}
              draggable="false"
            />
          </div>
        ))}
      </div>
      <h2>
        Récompenses de niveaux - {levelCompletion.toFixed(0)}%{' '}
        <button onClick={() => setShowUnlocked((prev) => !prev)}>
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

      <div className="achievements-levels-wrapper">
        <div className="achievements-levels">
          {filteredSkinsWithLevel.map((skin) => (
            <SkinItem key={skin.id || skin.name} skin={skin} />
          ))}
        </div>
      </div>
    </div>
  )
}
