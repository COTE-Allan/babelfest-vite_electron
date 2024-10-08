import { useContext, useEffect, useState } from 'react'
import { GlobalContext } from '../providers/GlobalProvider'
import ProfilePicture from './profilePicture'
import '../../styles/esthetics/matchIntro.scss'
import { getBackgroundStyle } from '../others/toolBox'
import { AuthContext } from '../../AuthContext'
import useSound from 'use-sound'
import bang from '../../assets/sfx/bang.mp3'
import woosh from '../../assets/sfx/woosh.mp3'

export default function MatchIntro() {
  const { phase, turn, playerSelf, playerRival, playerID, firstToPlay } = useContext(GlobalContext)
  const [matchIntroFinish, setMatchIntroFinish] = useState(false)
  const [showFirstToPlay, setShowFirstToPlay] = useState(false)
  const player1 = playerID === 1 ? playerSelf : playerRival
  const player2 = playerID === 1 ? playerRival : playerSelf

  const { userSettings } = useContext(AuthContext)
  const [playBang] = useSound(bang, { volume: userSettings.sfxVolume })
  const [playWoosh] = useSound(woosh, { volume: userSettings.sfxVolume })
  
  
  useEffect(() => {
    if (matchIntroFinish || phase !== 1 || turn !== 1) return;
    const timerBang = setTimeout(() => {
      playBang();
    }, 700);
  
    const timerFirstToPlay = setTimeout(() => {
      setShowFirstToPlay(true);
        playWoosh();
      const timerMatchIntroFinish = setTimeout(() => {
        setMatchIntroFinish(true);
      }, 3500);
  
      return () => clearTimeout(timerMatchIntroFinish); // Nettoyage du second timeout
    }, 2500);
  
    return () => {
      clearTimeout(timerBang);
      clearTimeout(timerFirstToPlay); // Nettoyage des timeouts
    };
  }, [playBang]);
  
  
    
    if (matchIntroFinish || phase !== 1 || turn !== 1) return null
    
  return (
    <div className="matchIntro fade-in">
      <div
        className="matchIntro-player1"
        style={{ background: getBackgroundStyle(player1.primaryColor, 'to right'), width: showFirstToPlay && firstToPlay === 1 ? "100%" : showFirstToPlay ? "0%" : "50%" }}
      >
        <ProfilePicture size={250} customUser={player1} />
        <h2>{player1.username}</h2>
      </div>
      <div className="matchIntro-VS" style={{opacity: showFirstToPlay ? "0%" : "100%" }}>VS</div>
      <div
        className="matchIntro-player2"
        style={{ background: getBackgroundStyle(player2.primaryColor, 'to right'), width: showFirstToPlay && firstToPlay === 2 ? "100%" : showFirstToPlay ? "0%" : "50%" }}
      >
        <ProfilePicture size={250} customUser={player2} />
        <h2>{player2.username}</h2>
      </div>
      {showFirstToPlay &&
      <div className="matchIntro-starting">
        Premier joueur
      </div>
    }
    </div>
  )
}
