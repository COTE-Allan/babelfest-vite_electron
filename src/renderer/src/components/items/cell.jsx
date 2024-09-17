import '../../styles/items/cell.scss'
import { GiConfirmed } from 'react-icons/gi'
import { AiFillEyeInvisible } from 'react-icons/ai'
import { useEffect, useMemo, useContext } from 'react'
import { GlobalContext } from '../providers/GlobalProvider'
import { BsQuestionLg } from 'react-icons/bs'
import { useHandleClickOnArena } from '../controllers/ArenaController'
import { AuthContext } from '../../AuthContext'
import useSound from 'use-sound'
import selectSfx from '../../assets/sfx/card_select.wav'
import hoverSfx from '../../assets/sfx/card_hover.wav'
import { getBackgroundStyle, useSendMessage } from '../others/toolBox'

export default function Cell({ active, confirmModal, cell }) {
  const { userSettings } = useContext(AuthContext)
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })

  const {
    gameData,
    setDetailCard,
    setAdvancedDetailCard,
    setSelectedCells,
    selectedCells,
    myTurn,
    host,
    phase,
    phaseRules,
    greenCells,
    setConfirmModal,
    showArenaInModal,
    askForTarget,
    myColor,
    rivalColor,
    rightWindow,
    setRightWindow,
    playerID
  } = useContext(GlobalContext)
  const id = cell.id
  const team = cell.side
  const base = cell.base
  const card = cell.card
  const owner = cell.owner
  const player = host ? 1 : 2
  let stats, basestats
  if (card != null) {
    stats = [card.atk, card.dep, card.hp]
    basestats = [card.baseatk, card.basedep, card.basehp]
  }
  const checkIfMyCard = useMemo(
    () => (host && owner === 1) || (!host && owner === 2),
    [host, owner]
  )
  const isSelected = useMemo(() => selectedCells.some((e) => e.id === id), [selectedCells, id])
  const isBase = useMemo(() => base, [cell.base])
  const canBeSelected = useMemo(
    () => myTurn && cell.card && checkIfMyCard,
    [myTurn, cell.card, checkIfMyCard]
  )
  const handleClickOnArena = useHandleClickOnArena()
  const sendMessage = useSendMessage()

  useEffect(() => {
    if (!showArenaInModal) {
      setConfirmModal(null)
    }
  }, [isSelected])

  function demandConfirm() {
    if (!showArenaInModal) {
      setConfirmModal(cell.id)
    }
  }
  const selectCell = () => {
    if (card) {
      select()
    }

    if (card && phase === 3 && card.diving) {
      sendMessage('Vous ne pouvez pas choisir cette carte.', 'warn')
    }

    if (
      (card?.attackedThisTurn && phase == 3) ||
      (card?.movedThisTurn && phase == 2) ||
      greenCells.some((gCell) => gCell.id === cell.id) ||
      !canBeSelected ||
      (phase == 2 && card.freeze) ||
      phaseRules[1] == 0 ||
      (phase == 3 && card.diving) ||
      askForTarget
    )
      return

    let updatedCells = isSelected
      ? selectedCells.filter((item) => item.id !== id)
      : selectedCells.length < phaseRules[1]
        ? [...selectedCells, cell]
        : [...selectedCells.slice(1), cell]
    setSelectedCells(updatedCells)
  }

  const cellClasses = useMemo(() => {
    let tiredClass = ''
    if (phase === 2 && card?.movedThisTurn) {
      tiredClass = 'tired'
    } else if (phase === 3 && card?.attackedThisTurn) {
      tiredClass = 'tired'
    }

    return `cell ${isSelected || confirmModal ? 'selected' : ''}
      ${!host && 'reversed'}
      ${card && card.isRecto && card.fortress ? 'shield' : ''} 
      ${card && card.freeze ? 'freeze' : ''}
      ${cell.burn ? 'burn' : ''}
      ${tiredClass}
      ${card && card.isRecto && card.diving ? 'diving' : ''}
      `
  }, [card, owner, isSelected, isBase, team, player, phase, confirmModal])

  const bgColor = useMemo(() => {
    if (isBase) {
      return (team === 1 && host) || (team === 2 && !host) ? myColor.hex : rivalColor.hex
    } else {
      return '#000'
    }
  }, [isBase, team, host, myColor, rivalColor, card, owner])

  const borderColor = useMemo(() => {
    if (!card || !owner) {
      return 'transparent' // Bordure transparente si card ou owner est null
    }
    if (owner) {
      return (owner === 1 && host) || (owner === 2 && !host)
        ? getBackgroundStyle(myColor)
        : getBackgroundStyle(rivalColor)
    } else {
      return '#fff'
    }
  }, [cell, host, owner, myColor, rivalColor, card])

  if (!cell.exist) {
    return <div className="cell cell-inexistant" id={id} data-team={team} />
  }

  return (
    <div
      className={cellClasses}
      id={id}
      data-team={team}
      onClick={selectCell}
      style={{
        background: bgColor,
        '--rotation': `${host ? '0deg' : '180deg'}`,
        border: 'double 5px transparent',
        backgroundImage:
          !card || !owner
            ? 'none'
            : `linear-gradient(${card.isRecto ? 'white, white' : 'black, black'}), ${borderColor}`,
        backgroundOrigin: 'border-box',
        backgroundClip: 'content-box, border-box'
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        if (card && !card.isRecto && player !== owner) return
        setAdvancedDetailCard(card)
        setRightWindow('details')
      }}
      onMouseEnter={() => {
        if (card) hover()
      }}
    >
      {active && (
        <>
          <div className="cell-placementTrigger" onClick={() => demandConfirm()} />
          {confirmModal && (
            <div
              className="cell-confirmModal"
              onClick={() => {
                handleClickOnArena(
                  id,
                  phase,
                  askForTarget ? () => askForTarget.resolve([cell]) : null,
                  cell.owner === playerID ? cell : false
                )
              }}
            >
              <GiConfirmed size={90} />
            </div>
          )}
        </>
      )}
      {card && (
        <div
          className={card.shiny ? 'cell-card ' + card.shiny : 'cell-card'}
          onMouseEnter={() => {
            if (!card.isRecto && player !== owner) {
              setDetailCard('hidden')
            } else {
              setDetailCard(card)
            }
          }}
          onMouseLeave={() => {
            setDetailCard(null)
          }}
        >
          {card.isRecto ? (
            <>
              {card.deathCounter && card.deathCounter !== 0 && (
                <div className="cell-card-counter">{card.deathCounter}</div>
              )}
              {card.timerSummon && <div className="cell-card-counter">{card.timerSummon}</div>}
              {typeof card.def === 'number' && card.def !== 0 && (
                <div className={`cell-card-def ${card.broken ? 'disabled' : ''}`}>{card.def}</div>
              )}

              <div className="img-container">
                {card.freeze && (
                  <img
                    src="https://res.cloudinary.com/dxdtcakuv/image/upload/w_auto/v1702647583/babelfest/icons/freeze.webp"
                    alt="Icone Congelé"
                    className="freeze-icon"
                  />
                )}
                <img src={card.url} className="cell-card-visual" alt="Card" />
              </div>
              <div className="cell-card-stats">
                {stats.map((stat, key) => {
                  const baseStat = basestats[key]
                  let className = 'cell-card-stats-item'
                  if (stat < baseStat) {
                    className += ' nerf'
                  } else if (stat > baseStat) {
                    className += ' buff'
                  }

                  return (
                    <div key={key} className={className}>
                      {stat}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              {player === owner || card.revealed ? (
                <>
                  <img src={card.url} className="cell-card-visual hidden" alt="Card" />
                  <AiFillEyeInvisible size={90} className="hidden-icon" />
                  <div className="cell-card-stats">
                    {stats.map((stat, key) => (
                      <div key={key} className="cell-card-stats-item">
                        {stat}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <BsQuestionLg size={90} className="hidden-icon" />
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
