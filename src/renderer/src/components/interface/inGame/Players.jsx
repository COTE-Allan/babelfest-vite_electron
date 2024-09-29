import { useContext, useMemo } from 'react'
import { GlobalContext } from '../../providers/GlobalProvider'
import '../../../styles/interface/inGame/players.scss'
import LeaderboardPlayerBanner from '../../items/LeaderboardPlayerBanner'

function calculateCardsOnArena(pattern, playerId, isSelf) {
  return pattern.filter(
    ({ card, owner }) => card !== null && (isSelf ? owner === playerId : owner !== playerId)
  ).length
}

export default function Players() {
  const { playerSelf, playerRival, pattern, playerID, myColor, rivalColor } =
    useContext(GlobalContext)

  const selfCardsOnArena = useMemo(
    () => calculateCardsOnArena(pattern, playerID, true),
    [pattern, playerID]
  )
  const rivalCardsOnArena = useMemo(
    () => calculateCardsOnArena(pattern, playerID, false),
    [pattern, playerID]
  )

  const selfCardsLeft = useMemo(
    () => playerSelf.hand.length + selfCardsOnArena,
    [playerSelf.hand.length, selfCardsOnArena]
  )
  const rivalCardsLeft = useMemo(
    () => playerRival.hand.length + rivalCardsOnArena,
    [playerRival.hand.length, rivalCardsOnArena]
  )

  return (
    <>
      <div className="playerBanner-container self">
        <LeaderboardPlayerBanner user={playerSelf} cards={selfCardsLeft} />
      </div>
      <div className="playerBanner-container rival">
        <LeaderboardPlayerBanner user={playerRival} cards={rivalCardsLeft} reverse />
      </div>
    </>
  )
}
