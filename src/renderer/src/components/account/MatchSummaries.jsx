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
  console.log(summaries)
  const modes = {
    custom: 'CUSTOM',
    quick: 'RAPIDE',
    ranked: 'CLASSÉ'
  }

  const result = {
    defeat: 'Défaite',
    victory: 'Victoire'
  }

  return (
    <div className="matchSummaries">
      {summaries
        .slice()
        .reverse()
        .map((summary, index) => {
          const gameDetails = summary.gameDetails
          const player = summary.player
          const rival = summary.opponent
          const tours = gameDetails.turnCount !== 1 ? 'tours' : 'tour'

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
                {gameDetails.turnCount} {tours} | XP +{player.xpGained}{' '}
                {gameDetails.mode !== 'custom' && `| MMR ${player.mmrGained}`}
                {gameDetails.mode === 'ranked' && ` | PR ${player.prGained}`}
              </div>
              <div className="matchSummaries-item-user">
                <div className="matchSummaries-item-user-tags">
                  <span className={`mode tag ${gameDetails.mode}`}>{modes[gameDetails.mode]}</span>
                  <span className={`versus tag ${gameDetails.result}`}>
                    {result[gameDetails.result]}
                  </span>
                </div>
                VS {rival.name ?? 'Joueur introuvable'}
              </div>
            </div>
          )
        })}
    </div>
  )
}
