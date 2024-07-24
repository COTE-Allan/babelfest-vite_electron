import IconButton from '../../items/iconButton'
import '../../../styles/interface/inGame/inGameMenus.scss'
import { useContext } from 'react'

import { RiSearchEyeLine } from 'react-icons/ri'
import { GiPriceTag } from 'react-icons/gi'
import { IoMdMusicalNote } from 'react-icons/io'
import { TiArrowBack } from 'react-icons/ti'
import { GoLog } from 'react-icons/go'

import { AuthContext } from '../../../AuthContext'
import { SpectatorContext } from '../../providers/SpectatorProvider'
import { TbSwitchHorizontal } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'

export default function SpecMenus() {
  const {
    setRightWindow,
    rightWindow,
    setLeftWindow,
    leftWindow,
    musicPlayer,
    setMusicPlayer,
    side,
    setSide
  } = useContext(SpectatorContext)
  const { userSettings } = useContext(AuthContext)
  const navigate = useNavigate()

  return (
    <>
      <div className="ig-menu bottom">
        <IconButton
          onClick={() => setRightWindow(rightWindow === 'details' ? null : 'details')}
          active={rightWindow === 'details'}
        >
          <span>Mode détail</span>
          <RiSearchEyeLine size={45} />
        </IconButton>
        <IconButton
          onClick={() => setRightWindow(rightWindow === 'logs' ? null : 'logs')}
          active={rightWindow === 'logs'}
        >
          <span>Historique</span>
          <GoLog size={45} />
        </IconButton>
      </div>
      <div className="ig-menu top">
        <IconButton
          onClick={() => {
            navigate('/lobbyList')
          }}
        >
          <TiArrowBack size={45} />
          <span>Quitter</span>
        </IconButton>
        <IconButton
          onClick={() => {
            setLeftWindow(leftWindow === 'shop' ? null : 'shop')
            setMusicPlayer(false)
          }}
          active={leftWindow === 'shop'}
        >
          <GiPriceTag size={45} />
          <span>Boutique</span>
        </IconButton>
        <IconButton
          onClick={() => {
            setLeftWindow(null)
            setMusicPlayer(!musicPlayer)
          }}
          active={musicPlayer}
        >
          <IoMdMusicalNote size={45} />
          <span>Musique</span>
        </IconButton>
        <IconButton
          onClick={() => {
            setSide(side === 1 ? 2 : 1)
          }}
        >
          <TbSwitchHorizontal size={45} />
          <span>Changer de joueur</span>
        </IconButton>
      </div>
    </>
  )
}
