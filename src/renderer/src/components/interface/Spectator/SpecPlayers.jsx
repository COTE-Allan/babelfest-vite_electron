import { useContext, useMemo } from 'react'
import ProfilePicture from '../../esthetics/profilePicture'
import PlayerBanner from '../inGame/PlayerBanner'
import '../../../styles/interface/inGame/players.scss'
import { SpectatorContext } from '../../providers/SpectatorProvider'

function calculateCardsOnArena(pattern, playerId, isPlayer1) {
  return pattern.filter(({ card, owner }) => card !== null && owner === playerId).length
}

export default function Players() {
  const { player1, player2, pattern, player1Color, player2Color, side } =
    useContext(SpectatorContext)

  const player1CardsOnArena = useMemo(() => calculateCardsOnArena(pattern, 1, true), [pattern])
  const player2CardsOnArena = useMemo(() => calculateCardsOnArena(pattern, 2, false), [pattern])

  const player1CardsLeft = useMemo(
    () => player1.hand.length + player1CardsOnArena,
    [player1.hand.length, player1CardsOnArena]
  )
  const player2CardsLeft = useMemo(
    () => player2.hand.length + player2CardsOnArena,
    [player2.hand.length, player2CardsOnArena]
  )

  return (
    <>
      <div className={`playerBanner-container ${side === 1 ? 'self' : 'rival'}`}>
        <PlayerBanner
          side={`${side === 1 ? 'self' : 'rival'}`}
          user={player1}
          color={player1Color}
          cardsLeft={player1CardsLeft}
        />
      </div>
      <div className={`playerBanner-container ${side === 1 ? 'rival' : 'self'}`}>
        <PlayerBanner
          side={`${side === 1 ? 'rival' : 'self'}`}
          user={player2}
          color={player2Color}
          cardsLeft={player2CardsLeft}
        />
      </div>
    </>
  )
}
