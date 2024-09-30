import { useContext, useEffect, useState } from 'react'
import '../../styles/account/matchSummaries.scss'
import { format } from 'date-fns'
import { AuthContext } from '../../AuthContext'
import LeaderboardPlayerBanner from '../items/LeaderboardPlayerBanner'
import { useTransition } from '../../TransitionContext'
import useSound from 'use-sound'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'

export default function MatchSummaries({ summaries = [] }) {
  const { userSettings } = useContext(AuthContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
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
        .slice()
        .reverse()
        .map((summary, index) => {
          let gameDetails = summary.gameDetails
          let player = summary.player
          let rival = summary.opponent
          return (
            <div
              onMouseEnter={hover}
              key={index}
              className="matchSummaries-item"
              onClick={() => {
                select()
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
