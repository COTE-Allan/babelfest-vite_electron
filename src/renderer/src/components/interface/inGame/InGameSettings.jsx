import '../../../styles/interface/inGame/shop.scss'
import { useContext } from 'react'
import { GlobalContext } from '../../providers/GlobalProvider'
import Button from '../../items/Button'
import MusicPlayer from '../musicPlayer'
import { defineWinner } from '../../others/toolBox'

export default function InGameSettings() {
  const { gameData, room, playerID } = useContext(GlobalContext)

  // Abandonner le match
  function giveUp() {
    defineWinner(room, playerID === 1 ? 2 : 1)
  }

  return (
    <div className="ig-settings">
      <span>Code la partie : {room}</span>
      <Button onClick={giveUp}>Concéder le match</Button>
    </div>
  )
}
