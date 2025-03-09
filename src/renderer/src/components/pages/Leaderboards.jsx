import { useContext, useEffect, useState } from 'react'
import {
  getPlayerRank,
  getRankClass,
  getTopUsersByLevel,
  getTopUsersByMMR,
  getTopUsersByPR // Importer la nouvelle fonction
} from '../others/toolBox'
import '../../styles/pages/leaderboards.scss'
import { AuthContext } from '../../AuthContext'
import LeaderboardPlayerBanner from '../items/LeaderboardPlayerBanner'
import LoadingLogo from '../items/LoadingLogo'
import useSound from 'use-sound'
import selectSfx from '../../assets/sfx/menu_select.wav'
import BackButton from '../items/BackButton'
import HudNavLink from '../items/hudNavLink'
import Logo from '../../assets/svg/babelfest.svg'
import { MdOutlineSportsScore } from 'react-icons/md'
import { FaStar, FaTrophy } from 'react-icons/fa'
import { getRankProgress } from '../others/xpSystem'

const Leaderboards = () => {
  const { user, userInfo, userSettings } = useContext(AuthContext)
  const [leaderboardData, setLeaderboardData] = useState(null)
  const [myRank, setMyRank] = useState(null)
  const myId = user.uid

  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })

  const [selectedLeaderboard, setSelectedLeaderboard] = useState('MMR')

  const fetchLeaderboardData = async (leaderboard) => {
    setLeaderboardData(null)
    setMyRank(null)
    let data = null

    try {
      const rankData = await getPlayerRank(user.uid)

      // Déterminer quelle liste de classement récupérer en fonction du leaderboard sélectionné
      if (leaderboard === 'MMR') {
        data = await getTopUsersByMMR(30)
        setMyRank(rankData.mmrRank)
      } else if (leaderboard === 'Level') {
        data = await getTopUsersByLevel(30)
        setMyRank(rankData.levelXpRank)
      } else if (leaderboard === 'PR') {
        data = await getTopUsersByPR(30)
        setMyRank(rankData.prRank)
      }

      // Mettre à jour l'état après la récupération
      setLeaderboardData(data)
    } catch (error) {
      console.error('Error fetching leaderboard data:', error)
      // Gérer les erreurs de récupération de données
    }
  }

  // Récupérer les données du classement sélectionné chaque fois qu'il change
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
          <HudNavLink
            permOpen
            onClick={() => {
              setLeaderboardData(null)
              setSelectedLeaderboard('PR')
              select()
            }}
            className={selectedLeaderboard === 'PR' ? 'selected' : ''}
          >
            <FaTrophy size={45} />
            <span className="hidden-span">Par PR</span>
          </HudNavLink>
        </div>

        {/* Afficher LoadingLogo pendant que les données sont en cours de récupération */}
        <div className="leaderboard-content">
          {leaderboardData ? (
            <>
              <div className="leaderboard-list">
                {leaderboardData.map((user) => (
                  <div
                    key={user.id}
                    className="leaderboard-list-item"
                    onClick={() => {
                      select()
                    }}
                  >
                    <span className={`rank ${getRankClass(user.rank)} leaderboard-rank`}>
                      {user.rank}
                    </span>
                    <div className="leaderboard-list-item-bannerWrapper">
                      <LeaderboardPlayerBanner user={user} accessProfile />
                    </div>
                    <div className="stats">
                      {selectedLeaderboard === 'PR' &&
                        (() => {
                          let rankInfos = getRankProgress(user.stats.pr)

                          return (
                            <span className={rankInfos.rankClass}>{rankInfos.currentRank}</span>
                          )
                        })()}

                      <span className="value">
                        {selectedLeaderboard === 'MMR' && `MMR ${user.stats.mmr}`}
                        {selectedLeaderboard === 'Level' && `Niveau ${user.stats.level}`}
                        {selectedLeaderboard === 'PR' && ` - PR ${user.stats.pr}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="leaderboard-self">
                <span className={`rank ${getRankClass(myRank)} leaderboard-rank`}>{myRank}</span>
                <div className="leaderboard-list-item-bannerWrapper">
                  <LeaderboardPlayerBanner user={userInfo} />
                </div>
                <div className="stats">
                  {selectedLeaderboard === 'PR' &&
                    (() => {
                      let rankInfos = getRankProgress(userInfo.stats.pr)

                      return <span className={rankInfos.rankClass}>{rankInfos.currentRank}</span>
                    })()}

                  <span className="value">
                    {selectedLeaderboard === 'MMR' && `MMR ${userInfo.stats.mmr}`}
                    {selectedLeaderboard === 'Level' && `Niveau ${userInfo.stats.level}`}
                    {selectedLeaderboard === 'PR' && ` - PR ${userInfo.stats.pr}`}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="leaderboard-loading">
              <LoadingLogo />
            </div>
          )}
        </div>
      </div>
      <BackButton />
    </div>
  )
}

export default Leaderboards
