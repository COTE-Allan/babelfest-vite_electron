import { useMusic } from '../providers/MusicProvider'
import '../../styles/interface/musicPlayer.scss'
import 'rc-slider/assets/index.css'
import {
  IoPause,
  IoPlay,
  IoPlaySkipBack,
  IoPlaySkipForward,
  IoVolumeHigh,
  IoVolumeMute
} from 'react-icons/io5'
import { MdRepeat, MdRepeatOne } from 'react-icons/md'
import Button from '../items/Button'
import { useEffect } from 'react'
import { shuffleArray } from '../others/toolBox'
import musicPlaylist from '../../jsons/musicPlaylist.json'

export default function MusicPlayer({ role }) {
  const {
    playlist,
    currentIndex,
    volume,
    mute,
    repeat,
    isPlaying,
    setVolume,
    setMute,
    setRepeat,
    togglePlay,
    playNext,
    playPrevious,
    setPlaylist,
    setRole, // Utiliser setRole pour changer le rôle
    role: currentRole // Accéder au rôle actuel du provider
  } = useMusic()

  // Effect pour mettre à jour le rôle et la playlist en conséquence
  useEffect(() => {
    if (role !== currentRole) {
      setRole(role)
    }
  }, [role, currentRole, setRole])

  return (
    <div className={`musicPlayer`}>
      <div className={`musicPlayer-infos ${isPlaying && 'active'}`}>
        {isPlaying ? (
          <span>Vous écoutez : {playlist[currentIndex]?.name || 'Aucune musique'}</span>
        ) : (
          <span>Lecteur en pause</span>
        )}
      </div>

      <div className="musicPlayer-controller">
        <div className="musicPlayer-controller-buttons">
          <Button onClick={() => setMute(!mute)} nohover>
            {mute ? (
              <IoVolumeMute size={25} color="white" />
            ) : (
              <IoVolumeHigh size={25} color="white" />
            )}
          </Button>
          <Button onClick={playPrevious} nohover>
            <IoPlaySkipBack size={25} color="white" />
          </Button>
          <Button onClick={togglePlay} nohover>
            {isPlaying ? <IoPause size={25} color="white" /> : <IoPlay size={25} color="white" />}
          </Button>
          <Button onClick={playNext} nohover>
            <IoPlaySkipForward size={25} color="white" />
          </Button>
          <Button onClick={() => setRepeat(!repeat)} nohover>
            {repeat ? (
              <MdRepeatOne size={25} color="white" />
            ) : (
              <MdRepeat size={25} color="white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
