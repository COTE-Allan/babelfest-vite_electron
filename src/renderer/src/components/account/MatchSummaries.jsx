import { useContext, useEffect, useState } from 'react'
import '../../styles/account/matchSummaries.scss'
import { format } from 'date-fns'
import { AuthContext } from '../../AuthContext'
import LeaderboardPlayerBanner from '../items/LeaderboardPlayerBanner'
import { useTransition } from '../../TransitionContext'
import useSound from 'use-sound'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'
import { db } from '../../Firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

export default function MatchSummaries({ summaries = [] }) {
  const { userSettings } = useContext(AuthContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const { goForward } = useTransition()
  const [playersData, setPlayersData] = useState({})

  const modes = {
    custom: 'CUSTOM',
    quick: 'RAPIDE',
    ranked: 'CLASSÉ'
  }

  const result = {
    defeat: 'Défaite',
    victory: 'Victoire'
  }

  useEffect(() => {
    const fetchMissingPlayers = async () => {
      // Gather unique player IDs from summaries
      const uniquePlayerIds = [
        ...new Set(summaries.map((summary) => summary.opponent.id).filter((id) => !playersData[id]))
      ]

      if (uniquePlayerIds.length > 0) {
        // Query Firestore to fetch all missing player data in a single batch
        const playersQuery = query(
          collection(db, 'users'),
          where('__name__', 'in', uniquePlayerIds)
        )
        const querySnapshot = await getDocs(playersQuery)

        // Process and cache player data
        const newPlayerData = {}
        querySnapshot.forEach((doc) => {
          newPlayerData[doc.id] = doc.data()
        })

        setPlayersData((prev) => ({ ...prev, ...newPlayerData }))
      }
    }

    fetchMissingPlayers()
  }, [summaries, playersData])

  return (
    <div className="matchSummaries">
      {summaries
        .slice()
        .reverse()
        .map((summary, index) => {
          const gameDetails = summary.gameDetails
          const player = summary.player
          const rival = playersData[summary.opponent.id] // Retrieve fetched player data

          return (
            <div
              onMouseEnter={hover}
              key={index}
              className="matchSummaries-item"
              onClick={() => {
                select()
                goForward(`/account/${summary.opponent.id}`)
              }}
            >
              <div className="matchSummaries-item-date">
                Le {format(new Date(gameDetails.timestamp), 'dd/MM/yy à HH:mm')} |{' '}
                {gameDetails.turnCount} tours | XP +{player.xpGained}{' '}
                {gameDetails.mode === 'quick' && `| MMR ${player.mmrGained}`}
              </div>
              <div className="matchSummaries-item-user">
                <div className="matchSummaries-item-user-tags">
                  <span className={`mode tag ${gameDetails.mode}`}>{modes[gameDetails.mode]}</span>
                  <span className={`versus tag ${gameDetails.result}`}>
                    {result[gameDetails.result]}
                  </span>
                </div>
                {rival ? <LeaderboardPlayerBanner user={rival} /> : <div>Loading...</div>}
              </div>
            </div>
          )
        })}
    </div>
  )
}
