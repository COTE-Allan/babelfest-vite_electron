import React, { useContext, useState, useEffect } from 'react'
import { getSkinsWithLevel } from '../others/toolBox'
import '../../styles/accountEditor/achievements.scss'
import achievements from '../../jsons/achievements.json'
import { AuthContext } from '../../AuthContext'
import { FaEye, FaEyeSlash, FaLock, FaLockOpen } from 'react-icons/fa'
import ProgressBar from '@ramonak/react-progress-bar'
import { useCheckAchievementValue } from '../controllers/AchievementsController'

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
    id: null,
    name: 'Bienvenue sur Babelfest',
    desc: 'Terminez le tutoriel.',
    objective: { value: 1 },
  })
  const [showUnlocked, setShowUnlocked] = useState(false)
  const [filteredSkinsWithLevel, setFilteredSkinsWithLevel] = useState([])
  const checkAchievementValue = useCheckAchievementValue()

  useEffect(() => {
    if (showUnlocked) {
      setFilteredSkinsWithLevel(skinsWithLevel)
    } else {
      setFilteredSkinsWithLevel(skinsWithLevel.filter((skin) => userInfo.level < skin.level))
    }
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
  const achievementValue = achievementInfos.id
    ? checkAchievementValue(achievementInfos.id)
    : 0

  return (
    <div className="achievements-container">
      <h2>Succès - {achievementCompletion.toFixed(0)}%</h2>
      <div className="achievements-infos">
        <h3>{achievementInfos.name}</h3>
        <span>{achievementInfos.desc}</span>
        <div className="achievements-infos-progress">
{`${achievementValue}/${achievementInfos.objective?.value ? achievementInfos.objective.value : 1}`}
        <ProgressBar
          transitionDuration="0s"
          height="17px"
          padding={2}
          completed={achievementValue}
          bgColor={userInfo.primaryColor}
          labelColor="#fff"
          maxCompleted={achievementInfos.objective?.value ? achievementInfos.objective?.value : 1}
          className="progress"
          customLabel={`${achievementValue}/${achievementInfos.objective?.value ? achievementInfos.objective?.value : 1}`}
          />
          </div>
      </div>
      <div className="achievements-list">
        {achievements.map((achievement) => (
          <div
            onMouseEnter={() => {
              setAchievementInfos({
                id: achievement.id,
                name: userInfo.achievements?.includes(achievement.id)
                  ? achievement.name
                  : achievement.name + ' (Non atteint)',
                desc: achievement.desc,
                objective: achievement.objective
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
