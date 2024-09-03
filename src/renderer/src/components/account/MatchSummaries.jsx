import { useContext, useEffect, useState } from 'react'
import '../../styles/account/matchSummaries.scss'
import { format } from 'date-fns'
import { AuthContext } from '../../AuthContext'
import LeaderboardPlayerBanner from '../items/LeaderboardPlayerBanner'
import { useTransition } from '../../TransitionContext'

export default function MatchSummaries({ summaries = [] }) {
  const { user } = useContext(AuthContext)
  const { goForward } = useTransition()
  let modes = {
    custom: 'CUSTOM',
    quick: 'RAPIDE',
    ranked: 'CLASSÉ'
  }

  let result = {
    defeat: 'Défaite',
    victory: 'Victoire'
  }

  return (
    <div className="matchSummaries">
      {summaries
        .slice() // Copie l'array pour ne pas modifier l'original
        .reverse() // Inverse l'ordre des éléments
        .map((summary, index) => {
          let gameDetails = summary.gameDetails
          let player = summary.player
          let rival = summary.opponent
          return (
            <div
              key={index}
              className="matchSummaries-item"
              onClick={() => {
                goForward(`/account/${rival.id}`)
              }}
            >
              <div className="matchSummaries-item-date">
                Le {format(new Date(gameDetails.timestamp), 'dd/MM/yy à HH:mm')} |{' '}
                {gameDetails.turnCount} tours | XP +{player.xpGained}{' '}
                {gameDetails.mode === 'quick' && `| MMR +${player.mmrGained}`}
              </div>
              <div className="matchSummaries-item-user">
                <div className="matchSummaries-item-user-tags">
                  <span className={`mode tag ${gameDetails.mode}`}>{modes[gameDetails.mode]}</span>
                  <span className={`versus tag ${gameDetails.result}`}>
                    {result[gameDetails.result]}
                  </span>
                </div>
                <LeaderboardPlayerBanner user={rival} />
              </div>
            </div>
          )
        })}
    </div>
  )
}
