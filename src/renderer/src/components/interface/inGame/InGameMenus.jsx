import IconButton from '../../items/iconButton'
import '../../../styles/interface/inGame/inGameMenus.scss'
import { useContext } from 'react'
import { GlobalContext } from '../../providers/GlobalProvider'

import { PiFlagCheckeredFill } from 'react-icons/pi'
import { RiSearchEyeLine } from 'react-icons/ri'
import { GiConfirmed, GiPriceTag } from 'react-icons/gi'
import { IoIosFlash, IoMdHelp, IoMdSettings, IoMdMusicalNote } from 'react-icons/io'
import { GoLog } from 'react-icons/go'

import { useTradeCard } from '../../effects/editCards'
import { useEndTurn } from '../../controllers/PhaseController'
import RedrawButton from './RedrawButton'
import { AuthContext } from '../../../AuthContext'
import { TiArrowBack } from 'react-icons/ti'
import { useNavigate } from 'react-router-dom'
import { FaEye } from 'react-icons/fa'

export default function InGameMenus() {
  const {
    myTurn,
    phase,
    selectedCards,
    setRightWindow,
    rightWindow,
    selectedShopCards,
    setLeftWindow,
    leftWindow,
    placementCostLeft,
    movesLeft,
    musicPlayer,
    setMusicPlayer,
    handCardsCredits,
    shopCardsCredits,
    isSpectator,
    spectatorCount,
    deckType,
    turn
  } = useContext(GlobalContext)
  const { userSettings } = useContext(AuthContext)
  const navigate = useNavigate()
  const tradeCard = useTradeCard()
  const EndTurn = useEndTurn()

  const isExchangeValid = handCardsCredits >= shopCardsCredits

  const differentialColor = isExchangeValid
    ? selectedShopCards.length !== 0 && selectedCards.length !== 0
      ? '#4ead35'
      : '#ffffff'
    : '#bb2424'

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

        {phase === 4 && myTurn && !isSpectator && (
          <IconButton
            onClick={() => {
              if (isExchangeValid && selectedShopCards.length !== 0 && selectedCards.length !== 0) {
                tradeCard('Shop&Player').then(() => EndTurn(true))
              } else {
                if (!isExchangeValid) return
                EndTurn(true)
              }
            }}
            className={`${!isExchangeValid ? 'disabled' : 'alert'}`}
          >
            {selectedShopCards.length !== 0 && selectedCards.length !== 0 && isExchangeValid ? (
              <>
                <span>Valider l'échange</span>
                <GiConfirmed size={45} />
              </>
            ) : (
              <>
                <span>{!isExchangeValid ? 'Échange invalide' : 'Fin de phase'}</span>
                <PiFlagCheckeredFill size={45} />
              </>
            )}
          </IconButton>
        )}
        {phase === 1 && deckType !== 'constructed' && turn === 1 && <RedrawButton />}
        {phase !== 4 && myTurn && !isSpectator && (
          <IconButton
            onClick={() => {
              if (myTurn) EndTurn(true)
            }}
            className={`alwaysOpen ${!myTurn && 'disabled'}`}
          >
            <span>Fin de phase</span>
            <PiFlagCheckeredFill size={45} />
          </IconButton>
        )}
        {(phase === 1 || phase === 2) && myTurn && !isSpectator && (
          <div className="costCounter">
            <div className="costCounter-infos">
              <IoIosFlash />
              <span>{phase === 1 ? placementCostLeft : movesLeft}</span>
            </div>
            énergies
          </div>
        )}
        {phase === 4 && myTurn && !isSpectator && (
          <div className="costCounter">
            <div className="costCounter-infos" style={{ color: differentialColor }}>
              <GiPriceTag />
              <span>{handCardsCredits - shopCardsCredits}</span>
            </div>
            différentiel
          </div>
        )}
      </div>
      <div className="ig-menu top">
        {isSpectator && (
          <IconButton
            onClick={() => {
              navigate('/lobbyList')
            }}
          >
            <TiArrowBack size={45} />
            <span>Quitter</span>
          </IconButton>
        )}
        <IconButton
          onClick={() => {
            setLeftWindow(leftWindow === 'settings' ? null : 'settings')
            setMusicPlayer(false)
          }}
          active={leftWindow === 'settings'}
        >
          <IoMdSettings size={45} />
          <span>Paramètres</span>
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
        {userSettings && userSettings.tutorial && !isSpectator && (
          <IconButton
            onClick={() => {
              setLeftWindow(leftWindow === 'help' ? null : 'help')
              setMusicPlayer(false)
            }}
            active={leftWindow === 'help'}
          >
            <IoMdHelp size={45} />
            <span>Aide</span>
          </IconButton>
        )}
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
        {spectatorCount > 0 && (
          <div className="costCounter spectatorCount">
            <FaEye size={30} />
            {spectatorCount}
          </div>
        )}
      </div>
    </>
  )
}
