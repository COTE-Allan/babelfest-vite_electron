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

  function createNote() {
    const note = document.createElement('div')
    note.className = 'note'
    note.innerHTML = '&#9835;' // Symbole de note de musique
    note.style.left = Math.random() * 100 + '%' // Position horizontale aléatoire dans le conteneur
    note.style.animationDuration = Math.random() * 2 + 1 + 's' // Durée d'animation aléatoire entre 1 et 3 secondes

    document.getElementById('particles').appendChild(note)

    // Supprime la note après la fin de son animation pour éviter l'encombrement du DOM
    setTimeout(
      () => {
        note.remove()
      },
      parseFloat(note.style.animationDuration) * 1000
    )
  }

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
    if (isPlaying) {
      interval = setInterval(createNote, 600)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isPlaying])

  return (
    <div className={`musicPlayer`}>
      {props.noParticle ? <></> : <div id="particles"></div>}
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
