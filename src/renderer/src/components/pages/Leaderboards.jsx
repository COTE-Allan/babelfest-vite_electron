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
import HudNavLink from '../items/hudNavLink'
import Logo from '../../assets/svg/babelfest.svg'
import { MdOutlineSportsScore } from 'react-icons/md'
import { FaStairs } from 'react-icons/fa6'
import { FaStar } from 'react-icons/fa'

const Leaderboards = () => {
  const { user, userInfo, userSettings } = useContext(AuthContext)
  const [leaderboardData, setLeaderboardData] = useState(null)
  const [myRank, setMyRank] = useState(null)
  const myId = user.uid

  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })

  const [selectedLeaderboard, setSelectedLeaderboard] = useState('MMR')

  const fetchLeaderboardData = async (leaderboard) => {
    setLeaderboardData(null) // Reset leaderboard data to null before fetching new data
    setMyRank(null) // Reset my rank to null

    let data = null
    let rank = null

    try {
      if (leaderboard === 'MMR') {
        data = await getTopUsersByMMR(30)
        rank = (await getPlayerRank(user.uid)).mmrRank
      } else if (leaderboard === 'Level') {
        data = await getTopUsersByLevel(30)
        rank = (await getPlayerRank(user.uid)).levelXpRank
      }

      // After fetching, update state
      setLeaderboardData(data)
      setMyRank(rank)
    } catch (error) {
      console.error('Error fetching leaderboard data:', error)
      // Handle any errors in fetching data (e.g., set an error state if needed)
    }
  }

  // Fetch the selected leaderboard data whenever it changes
  useEffect(() => {
    fetchLeaderboardData(selectedLeaderboard)
  }, [selectedLeaderboard, user.uid])

  return (
    <div className="leaderboard">
      <div className="leaderboard-wrapper">
        <div className="leaderboard-control">
          <img src={Logo} className="logo" alt="Babelfest Logo" />
          <HudNavLink
            permOpen
            onClick={() => {
              setLeaderboardData(null)
              setSelectedLeaderboard('MMR')
              select()
            }}
            className={selectedLeaderboard === 'MMR' ? 'selected' : ''}
          >
            <MdOutlineSportsScore size={45} />
            <span className="hidden-span">Par MMR</span>
          </HudNavLink>
          <HudNavLink
            permOpen
            onClick={() => {
              setLeaderboardData(null)
              setSelectedLeaderboard('Level')
              select()
            }}
            className={selectedLeaderboard === 'Level' ? 'selected' : ''}
          >
            <FaStar size={45} />
            <span className="hidden-span">Par niveau</span>
          </HudNavLink>
        </div>

        {/* Display LoadingLogo while data is being fetched */}
        <div className="leaderboard-content">
          {leaderboardData && myRank !== null ? (
            <>
              <div className="leaderboard-list">
                {leaderboardData.map((user) => (
                  <div
                    key={user.id}
                    className="leaderboard-list-item"
                    onMouseEnter={hover}
                    onClick={() => {
                      select()
                    }}
                  >
                    <span className={`rank ${getRankClass(user.rank)} leaderboard-rank`}>
                      {user.rank}
                    </span>
                    <LeaderboardPlayerBanner user={user} accessProfile />
                    <span className="value">
                      {selectedLeaderboard === 'MMR'
                        ? `MMR ${user.stats.mmr}`
                        : `Niveau ${user.level}`}
                    </span>
                  </div>
                ))}
              </div>
              <div className="leaderboard-self">
                <span className={`rank ${getRankClass(myRank)} leaderboard-rank`}>{myRank}</span>
                <LeaderboardPlayerBanner user={userInfo} />
                <span className="value">
                  {selectedLeaderboard === 'MMR'
                    ? `MMR ${userInfo.stats.mmr}`
                    : `Niveau ${userInfo.level}`}
                </span>
              </div>
            </>
          ) : (
            <LoadingLogo />
          )}
        </div>
      </div>
      <BackButton />
    </div>
  )
}

export default Leaderboards
