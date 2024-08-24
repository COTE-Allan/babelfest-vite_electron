import ReactPlayer from 'react-player'
import musicPlaylist from '../../jsons/musicPlaylist.json'
import { shuffleArray } from '../others/toolBox'
import { useEffect, useState, useRef, useContext } from 'react'
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
import { GlobalContext } from '../providers/GlobalProvider'
import { AuthContext } from '../../AuthContext'

export default function MusicPlayer(props) {
  const player = useRef(null)
  const { userSettings } = useContext(AuthContext)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [volume, setVolume] = useState(userSettings.musicVolume)
  const [mute, setMute] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [playlist, setPlaylist] = useState(
    shuffleArray(musicPlaylist.filter((music) => music.role === props.role || music.role === 'any'))
  )
  const [isPlaying, setIsPlaying] = useState(userSettings.musicOnLaunch)

  useEffect(() => {
    setVolume(userSettings.musicVolume)
  }, [userSettings.musicVolume])


  const playNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1 >= playlist.length ? 0 : prevIndex + 1))
    if (!isPlaying) {
      togglePlay()
    }
  }

  const playPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 < 0 ? playlist.length - 1 : prevIndex - 1))
    if (!isPlaying) {
      togglePlay()
    }
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  useEffect(() => {
    let interval

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isPlaying])

  return (
    <div className={`musicPlayer`}>
      <div className={`musicPlayer-infos ${isPlaying && 'active'}`}>
        {isPlaying ? (
          <span>Vous écoutez : {playlist[currentIndex].name}</span>
        ) : (
          <span>Lecteur en pause</span>
        )}
      </div>

      <div className="musicPlayer-controller">
        <div className="musicPlayer-controller-buttons">
          <Button onClick={() => setMute(!mute)}>
            {mute ? (
              <IoVolumeMute size={30} color="white" />
            ) : (
              <IoVolumeHigh size={30} color="white" />
            )}
          </Button>
          <Button onClick={playPrevious}>
            <IoPlaySkipBack size={30} color="white" />
          </Button>
          <Button onClick={togglePlay}>
            {isPlaying ? <IoPause size={30} color="white" /> : <IoPlay size={30} color="white" />}
          </Button>
          <Button onClick={playNext}>
            <IoPlaySkipForward size={30} color="white" />
          </Button>
          <Button onClick={() => setRepeat(!repeat)}>
            {repeat ? (
              <MdRepeatOne size={30} color="white" />
            ) : (
              <MdRepeat size={30} color="white" />
            )}
          </Button>
        </div>
      </div>
      <ReactPlayer
        ref={player}
        volume={volume}
        key={currentIndex}
        muted={mute}
        url={playlist[currentIndex].url}
        playing={isPlaying}
        width={0}
        height={0}
        onEnded={() => {
          if (repeat) {
            player.current.seekTo(0)
          } else {
            playNext()
          }
        }}
      />
    </div>
  )
}
