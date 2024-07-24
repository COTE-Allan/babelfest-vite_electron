import { useEffect, useContext, useState } from 'react'
import { SpectatorContext } from '../providers/SpectatorProvider'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../Firebase'
import SpecPlayers from '../interface/Spectator/SpecPlayers'
import SpecMenus from '../interface/Spectator/SpecMenus'
import MusicPlayer from '../interface/musicPlayer'
import SpecLeftWindow from '../interface/Spectator/SpecLeftWindow'
import SpecRightWindow from '../interface/Spectator/SpecRightWindow'
import hoverSfx from '../../assets/sfx/card_hover.wav'
import Details from '../interface/inGame/Details'
import Hand from '../interface/inGame/Hand'
import useSound from 'use-sound'
import { AuthContext } from '../../AuthContext'
import SpecArena from '../interface/Spectator/SpecArena'
import SpecScenesMaker from '../interface/Spectator/SpecScenesMaker'
import SpecTurnTracker from '../interface/Spectator/SpecTurnTracker'
export default function SpectatorRoom() {
  const {
    room,
    phase,
    activePlayer,
    detailCard,
    musicPlayer,
    player1Color,
    player2Color,
    player1,
    player2,
    setDetailCard,
    setRightWindow,
    rightWindow,
    side,
    scenes
  } = useContext(SpectatorContext)
  const { userSettings } = useContext(AuthContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })

  useEffect(() => {
    // Si on est en phase 3 commencer à regarder si l'autre joueur termine sa phase
    if (phase === 3) {
      const gameDocRef = doc(db, 'games', room)
      const unsubscribe = onSnapshot(gameDocRef, (snapshot) => {
        const data = snapshot.data()

        if (data && data.playerAttackEnded && data.playerAttackEnded !== null) {
          setRivalEndedAttack(true)
          unsubscribe()
        }
      })

      // Se désabonner de l'écoute lors du nettoyage.
      return () => unsubscribe()
    }
  }, [phase])

  return (
    <>
      <div className={`gameContainer`}>
        {detailCard && <Details detailCard={detailCard} />}
        {scenes !== null && scenes.length !== 0 && <SpecScenesMaker key={scenes[0].id} />}
        <SpecLeftWindow />
        <SpecRightWindow />
        <SpecArena />
        <SpecMenus />
        <SpecTurnTracker />
        <Hand>
          {(side === 1 ? player1.hand : player2.hand)
            .sort((a, b) => a.rarity - b.rarity)
            .map((card, index) => {
              return (
                <div
                  className={`${card.shiny ? card.shiny : ''} card`}
                  onMouseEnter={() => {
                    hover()
                    setDetailCard(card)
                  }}
                  onMouseLeave={() => {
                    setDetailCard(null)
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    setRightWindow(rightWindow === 'details' ? null : 'details')
                  }}
                >
                  <div className="img-container">
                    <div className={`card-cost`}>
                      <span className={`txt-rarity-${card.rarity}`}>{card.rarity}</span>
                    </div>
                    <img className="card-visual" src={card.url} />
                  </div>
                </div>
              )
            })}
        </Hand>
        <SpecPlayers />
        <div className={`musicPlayer-container ${musicPlayer ? 'active' : ''}`}>
          <MusicPlayer role="ingame" />
        </div>
      </div>
      <div
        className="gameContainer-filter"
        style={{
          background: `${activePlayer === 1 ? player1Color : player2Color}`
        }}
      ></div>
      <img
        className={`gameContainer-bg`}
        src="https://source.unsplash.com/random/1920x1080/?sky"
        alt={'background du menu'}
      />
    </>
  )
}
