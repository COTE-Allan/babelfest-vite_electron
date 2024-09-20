import React, { createContext, useState, useRef, useContext, useEffect } from 'react'
import ReactPlayer from 'react-player'
import musicPlaylist from '../../jsons/musicPlaylist.json'
import { shuffleArray } from '../others/toolBox'
import { AuthContext } from '../../AuthContext'

const MusicContext = createContext()

export const MusicProvider = ({ children }) => {
  const player = useRef(null)
  const { userSettings } = useContext(AuthContext)

  const [role, setRole] = useState('menu') // Par défaut, le rôle est 'menu'
  const [playlist, setPlaylist] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [volume, setVolume] = useState(userSettings.musicVolume)
  const [mute, setMute] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // Mettre à jour la playlist lorsque le rôle change
    setPlaylist(
      shuffleArray(musicPlaylist.filter((music) => music.role === role || music.role === 'any'))
    )
  }, [role])

  useEffect(() => {
    setVolume(userSettings.musicVolume)
  }, [userSettings.musicVolume])

  useEffect(() => {
    if (userSettings.musicOnLaunch) {
      setIsPlaying(true) // Démarrer la musique si le réglage est activé
    } else {
      setIsPlaying(false) // Mettre en pause si le réglage est désactivé
    }
  }, [userSettings.musicOnLaunch])

  const playNext = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + 1 >= playlist.length ? 0 : prevIndex + 1
      return newIndex
    })
  }

  const handleEnded = () => {
    if (repeat) {
      player.current.seekTo(0)
    } else if (playlist.length === 1) {
      // Si la playlist ne contient qu'une seule musique, recommencer la même musique
      player.current.seekTo(0)
      setIsPlaying(true)
    } else if (currentIndex === playlist.length - 1) {
      // Si c'est la dernière musique et qu'il y en a plusieurs, revenir au début de la playlist
      setCurrentIndex(0)
      setIsPlaying(true)
    } else {
      // Sinon, jouer la prochaine musique
      playNext()
    }
  }

  const playPrevious = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex - 1 < 0 ? playlist.length - 1 : prevIndex - 1
      return newIndex
    })
  }

  const togglePlay = () => {
    setIsPlaying((prev) => !prev)
  }

  useEffect(() => {
    player.current.seekTo(0)
  }, [currentIndex])

  return (
    <MusicContext.Provider
      value={{
        player,
        role, // Fournir le rôle dans le contexte
        setRole, // Fournir la fonction pour changer le rôle
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
        handleEnded,
        setPlaylist
      }}
    >
      <ReactPlayer
        ref={player}
        volume={volume}
        muted={mute}
        url={playlist[currentIndex]?.url}
        playing={isPlaying}
        width={0}
        height={0}
        onEnded={handleEnded}
      />
      {children}
    </MusicContext.Provider>
  )
}

export const useMusic = () => useContext(MusicContext)
