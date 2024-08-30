import { useContext, useEffect, useState } from 'react'
import {
  getPlayerRank,
  getRankClass,
  getTopUsersByLevel,
  getTopUsersByMMR
} from '../others/toolBox'
import '../../styles/pages/leaderboards.scss'
import { AuthContext } from '../../AuthContext'
import LeaderboardPlayerBanner from '../items/LeaderboardPlayerBanner'
import LoadingLogo from '../items/LoadingLogo'
import useSound from 'use-sound'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'
import BackButton from '../items/BackButton'

const Leaderboards = () => {
  const { user, userInfo, userSettings } = useContext(AuthContext)
  const [MMRUsers, setMMRUsers] = useState(null)
  const [LevelUsers, setLevelUsers] = useState(null)
  const [myRank, setMyRank] = useState(0)
  const myId = user.uid

  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })

  useEffect(() => {
    const fetchTopUsers = async () => {
      const MMRUsers = await getTopUsersByMMR(30)
      const LevelUsers = await getTopUsersByLevel(30)
      const myRank = await getPlayerRank(user.uid)
      setMMRUsers(MMRUsers)
      setLevelUsers(LevelUsers)
      setMyRank(myRank)
    }
    fetchTopUsers()
  }, [user.uid])

  return (
    <div className="leaderboard">
      <div className="leaderboard-control"></div>
      <div className="leaderboard-content">
        {MMRUsers ? (
          <>
            <h1>Matchmaking Rank (MMR)</h1>
            <div className="leaderboard-list">
              {MMRUsers.map((user) => (
                <div
                  key={user.id}
                  className="leaderboard-list-item"
                  onMouseEnter={hover}
                  onClick={() => {
                    select()
                    // Add any other click handling logic here
                  }}
                >
                  <span className={`rank ${getRankClass(user.rank)} leaderboard-rank`}>
                    {user.rank}
                  </span>
                  <LeaderboardPlayerBanner user={user} accessProfile={user.id !== myId} />
                  <span className="value">{user.stats.mmr}</span>
                </div>
              ))}
            </div>
            <div className="leaderboard-self">
              <span className={`rank ${getRankClass(myRank.mmrRank)} leaderboard-rank`}>
                {myRank.mmrRank}
              </span>
              <LeaderboardPlayerBanner user={userInfo} />
              <span className="value">{userInfo.stats.mmr}</span>
            </div>
          </>
        ) : (
          <LoadingLogo />
        )}
      </div>
      <div className="leaderboard-content">
        {LevelUsers ? (
          <>
            <h1>Niveau de joueur</h1>
            <div className="leaderboard-list">
              {LevelUsers.map((user) => (
                <div
                  key={user.id}
                  className="leaderboard-list-item"
                  onMouseEnter={hover}
                  onClick={() => {
                    select()
                    // Add any other click handling logic here
                  }}
                >
                  <span className={`rank ${getRankClass(user.rank)} leaderboard-rank`}>
                    {user.rank}
                  </span>
                  <LeaderboardPlayerBanner user={user} accessProfile={user.id !== myId} />
                  <span className="value">{user.level}</span>
                </div>
              ))}
            </div>
            <div className="leaderboard-self">
              <span className={`rank ${getRankClass(myRank.levelXpRank)} leaderboard-rank`}>
                {myRank.levelXpRank}
              </span>
              <LeaderboardPlayerBanner user={userInfo} />
              <span className="value">{userInfo.level}</span>
            </div>
          </>
        ) : (
          <LoadingLogo />
        )}
      </div>

      <BackButton />
    </div>
  )
}

export default Leaderboards
