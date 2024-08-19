import { useEffect, useState } from 'react'
import '../../styles/interface/matchSummaries.scss'
import ProfilePicture from '../esthetics/profilePicture'
import PlayerBanner from './inGame/PlayerBanner'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

export default function MatchSummaries({ summaries = [] }) {
  const navigate = useNavigate()
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
      {summaries.map((summary) => {
        let gameDetails = summary.gameDetails
        let player = summary.player
        let rival = summary.opponent
        return (
          <div
            className="matchSummaries-item"
            onClick={() => {
              navigate(`/userProfile/${rival.id}`)
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
              <PlayerBanner user={rival} color={rival.primaryColor} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
