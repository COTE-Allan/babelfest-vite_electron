import { useContext, useEffect, useState } from 'react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { generateLocalArena, getCardsByIds } from '../others/toolBox'
import Modal from '../items/ClassicModal'
import Hand from '../interface/inGame/Hand'
import tutorialSteps from '../../jsons/tutorial.json'
import '../../styles/pages/tutorial.scss'
import { MdNavigateNext } from 'react-icons/md'
import { IoIosFlash } from 'react-icons/io'
import IconButton from '../items/iconButton'
import { GiConfirmed, GiPriceTag } from 'react-icons/gi'
import { TiArrowBack } from 'react-icons/ti'
import { useNavigate } from 'react-router-dom'
import { BsQuestionLg } from 'react-icons/bs'
import { PiFlagCheckeredFill } from 'react-icons/pi'
import { AuthContext } from '../../AuthContext'

import useSound from 'use-sound'
import summonSfx from '../../assets/sfx/summon.mp3'
import turnSfx from '../../assets/sfx/notification_urturn.wav'
import endSfx from '../../assets/sfx/match_end.mp3'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'
import deathSfx from '../../assets/sfx/ingame_death.mp3'
import MusicPlayer from '../interface/musicPlayer'

export const Tutorial = () => {
  const { userSettings, giveAchievement } = useContext(AuthContext)
  const [user, setUser] = useState(null)
  const [rival, setRival] = useState(null)
  const [shop, setShop] = useState(null)
  const [costLeft, setCostLeft] = useState(4)
  const [phase, setPhase] = useState(0)
  const [pattern, setPattern] = useState(null)
  const [turn, setTurn] = useState(0)
  const [order, setOrder] = useState(1)
  const [diff, setDiff] = useState(0)
  const [win, setWin] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(null)
  const [step, setStep] = useState(0)
  const navigate = useNavigate()

  const [playSummon] = useSound(summonSfx, { volume: userSettings.sfxVolume })
  const [playTurn] = useSound(turnSfx, { volume: userSettings.sfxVolume })
  const [playDeath] = useSound(deathSfx, { volume: userSettings.sfxVolume })
  const [playHover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [playSelect] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const [playEnd] = useSound(endSfx, { volume: userSettings.sfxVolume })

  const phaseLabel = {
    0: "Échange avec l'autre joueur",
    1: 'Phase de préparation',
    2: 'Phase de déplacement',
    3: "Phase d'attaque",
    4: 'Phase de troc'
  }

  // Création du tuto
  useEffect(() => {
    // Création des users
    setUser({
      hex: '#40a8f5',
      hand: getCardsByIds([15, 25, 63, 48])
    })
    setRival({
      hex: '#e62e31'
    })
    setShop(getCardsByIds([42, 27, 38, 57, 89, 20, 13, 95, 57, 102]))

    // Création de l'arène
    const cellsToRemove = [31, 27, 28, 24, 0, 4, 3, 7]
    const bases = [2, 29]

    setPattern(generateLocalArena(cellsToRemove, bases))
  }, [])

  useEffect(() => {
    // Définition de l'étape tutoriel
    setTutorialStep(tutorialSteps[step])
  }, [step])

  function handleClick(element, id) {
    if (tutorialStep.clickOn.element === element) {
      playSelect()

      // Si l'élément cliqué est correct et l'ID correspond, on passe à l'étape suivante
      if ((id && tutorialStep.clickOn.id === id) || !id) {
        if (tutorialStep.removeCard) {
          handleRemoveCard()
        }

        if (tutorialStep.addCard) {
          handleAddCard()
        }

        if (tutorialStep.moveCard) {
          handleMoveCard()
        }

        if (tutorialStep.editCard) {
          handleEditCard() // Nouvelle fonction pour éditer la carte
        }

        if (tutorialStep.turn) setTurn(tutorialStep.turn)
        if (tutorialStep.phase) setPhase(tutorialStep.phase)
        if (tutorialStep.cost) setCostLeft(tutorialStep.cost)
        if (tutorialStep.order) setOrder(tutorialStep.order)
        if (tutorialStep.diff) setDiff(tutorialStep.diff)
        if (tutorialStep.win) setWin(true)

        if (tutorialStep.sound) {
          switch (tutorialStep.sound) {
            case 'summon':
              playSummon()
              break
            case 'turn':
              playTurn()
              break
            case 'death':
              playDeath()
              break
            case 'end':
              playEnd()
              break
            default:
              break
          }
        }
        setStep(step + 1)
      }
    }
  }

  useEffect(() => {
    if (win) {
      giveAchievement('HF_tutorial')
      setTimeout(() => {
        navigate('/home')
      }, 2000)
    }
  }, [win])

  function handleRemoveCard() {
    if (tutorialStep.removeCard.where === 'hand') {
      // Supprime une carte de la main
      setUser((prevUser) => ({
        ...prevUser,
        hand: prevUser.hand.filter((card) => !tutorialStep.removeCard.id.includes(card.id))
      }))
    }

    if (tutorialStep.removeCard.where === 'cell') {
      // Supprime une carte d'une cellule
      setPattern((prevPattern) =>
        prevPattern.map((cell) =>
          cell.id === tutorialStep.removeCard.id ? { ...cell, card: null, owner: null } : cell
        )
      )
    }
  }

  // Fonction pour gérer l'ajout d'une carte à la main ou dans une cellule
  function handleAddCard() {
    const cardToAdd = getCardsByIds([tutorialStep.addCard.id])[0] // Récupère la carte à ajouter

    if (!cardToAdd) return // Si la carte n'existe pas, on arrête ici

    if (tutorialStep.addCard.hidden) cardToAdd.recto = false

    if (tutorialStep.addCard.where === 'hand') {
      // Ajoute une carte à la main
      setUser((prevUser) => ({
        ...prevUser,
        hand: [...prevUser.hand, cardToAdd]
      }))
    }

    if (tutorialStep.addCard.where === 'cell') {
      // Ajoute une carte dans une cellule spécifique
      setPattern((prevPattern) =>
        prevPattern.map((cell) =>
          cell.id === tutorialStep.addCard.to
            ? { ...cell, card: cardToAdd, owner: tutorialStep.addCard.owner }
            : cell
        )
      )
    }
  }

  // Fonction pour éditer la carte d'une cellule
  function handleEditCard() {
    setPattern((prevPattern) => {
      return prevPattern.map((cell) => {
        // Vérifie si l'ID de la cellule correspond à celui spécifié dans l'étape du tutoriel
        if (cell.id === tutorialStep.editCard.id && cell.card) {
          // Modifie les propriétés de la carte (attaque, etc.) en fonction de ce qui est spécifié
          return {
            ...cell,
            card: {
              ...cell.card,
              ...tutorialStep.editCard // Remplace les propriétés de la carte par les nouvelles
            }
          }
        }
        return cell
      })
    })
  }

  // Fonction pour déplacer une carte d'une cellule à une autre
  function handleMoveCard() {
    setPattern((prevPattern) => {
      let cardToMove,
        owner = null

      // Retire la carte de la cellule source (from)
      const newPattern = prevPattern.map((cell) => {
        if (cell.id === tutorialStep.moveCard.from) {
          cardToMove = cell.card // Sauvegarde la carte à déplacer
          owner = cell.owner
          return { ...cell, card: null, owner: null } // Vide la cellule source
        }
        return cell
      })

      // Ajoute la carte à la cellule de destination (to) si elle existe
      if (cardToMove) {
        cardToMove.recto = true
        return newPattern.map((cell) =>
          cell.id === tutorialStep.moveCard.to ? { ...cell, card: cardToMove, owner: owner } : cell
        )
      }

      return newPattern
    })
  }

  if (!user || !rival || !pattern || !tutorialStep || !shop) return
  return (
    <div className="tutorial fade-in">
      {win && <div className="tutorial-win fade-in"></div>}

      <div
        className={`tutorial-modal ${tutorialStep.position} ${tutorialStep.clickOn.element === 'dialog' && 'clickable'}`}
        onClick={() => {
          handleClick('dialog')
        }}
        onMouseEnter={playHover}
      >
        <div className="tutorial-modal-avatar">
          <img src={tutorialStep.url} alt="avatar du tuto, pendant le tuto" />
        </div>
        <div className="tutorial-modal-content">
          <span className="speaker">Tuto</span>
          <p className="text">{tutorialStep.text}</p>
        </div>
        {(tutorialStep.clickOn.element === 'dialog' || tutorialStep.clickOn.element === 'end') && (
          <MdNavigateNext className="next" size={150} />
        )}
      </div>
      {tutorialStep.modal && <Modal className="fade-in"></Modal>}
      <div className="gameContainer">
        {/* Musique */}
        <div className={`musicPlayer-container`}>
          <MusicPlayer role="tutorial" />
        </div>
        {/* Tracker */}
        <div
          className="turnTracker"
          style={{ zIndex: tutorialStep.highlightedElements?.includes('tracker') ? 10 : 2 }}
        >
          <div className="turnTracker-content">
            <span className="turnTracker-activePlayer">
              {turn === 2 || phase === 0 ? 'À vous de jouer.' : 'Votre adversaire joue.'}
            </span>

            <span className="turnTracker-order">
              {order === 2 ? 'Vous jouez en premier.' : 'Vous jouez en second.'}
            </span>
          </div>
          <div
            style={{
              background: phase === 0 ? `transparent` : turn === 2 ? user.hex : rival.hex
            }}
            className="turnTracker-phases"
          >
            <span className="turnTracker-turns">TOUR {order} - </span>
            <span className="turnTracker-phases-label">{phaseLabel[phase]}</span>
          </div>
        </div>
        {/* Main */}
        <Hand style={{ zIndex: tutorialStep.highlightedElements?.includes('hand') ? 10 : 1 }}>
          {user.hand.map((card, index) => (
            <div
              key={index}
              className={`card ${tutorialStep.highlightedElements?.includes('hand-' + card.id) && 'important'} ${tutorialStep.selected?.includes('hand-' + card.id) && 'card-selected'}`}
              onClick={() => {
                handleClick('card', card.id)
              }}
              onMouseEnter={playHover}
            >
              <div className="img-container">
                {tutorialStep.selected?.includes('hand-' + card.id) && (
                  <div className="card-filter"></div>
                )}
                <div className={`card-cost`}>
                  <span className={`txt-rarity-${card.rarity}`}>{card.rarity}</span>
                </div>
                <img className="card-visual" src={card.url} alt={`card-${index}`} />
              </div>
            </div>
          ))}
        </Hand>
        {/* Arène */}
        <div
          className="arena-wrapper"
          style={{ zIndex: tutorialStep.highlightedElements?.includes('arena') ? 10 : 0 }}
        >
          <TransformWrapper
            minScale={0.5}
            maxScale={2.5}
            initialScale={0.6}
            centerOnInit={true}
            doubleClick={{ disabled: true }}
            velocityAnimation={{ disabled: false, sensitivity: 100 }}
          >
            <TransformComponent>
              <div className="arena">
                {pattern.map((cell, index) => {
                  if (!cell.exist) {
                    return (
                      <div
                        key={index}
                        className="cell cell-inexistant"
                        id={cell.id}
                        data-team={cell.side}
                      />
                    )
                  }

                  return (
                    <div
                      key={index}
                      className={`cell ${tutorialStep.highlightedElements?.includes('cell-' + cell.id) && 'important'} ${tutorialStep.selected?.includes('cell-' + cell.id) && 'selected'} ${tutorialStep.tired?.includes('cell-' + cell.id) && 'tired'}`}
                      id={cell.id}
                      data-team={cell.side}
                      style={{
                        backgroundColor:
                          cell.side && cell.base
                            ? cell.side === 2
                              ? user.hex
                              : rival.hex
                            : '#000',
                        '--rotation': `0deg`,
                        borderColor: cell.owner ? (cell.owner === 1 ? user.hex : rival.hex) : '#fff'
                      }}
                      onClick={() => {
                        handleClick('cell', cell.id)
                      }}
                      onMouseEnter={() => {
                        if (cell.card) playHover()
                      }}
                    >
                      {tutorialStep.confirm?.includes('cell-' + cell.id) && (
                        <div className="cell-confirmModal">
                          <GiConfirmed size={90} />
                        </div>
                      )}
                      {tutorialStep.green?.includes('cell-' + cell.id) && (
                        <div className="cell-placementTrigger" />
                      )}
                      {cell.card && cell.card.recto !== false && (
                        <div className="cell-card">
                          <div className="cell-card-stats">
                            {[cell.card.atk, cell.card.dep, cell.card.hp].map((stat, key) => {
                              let className = 'cell-card-stats-item'
                              if (key === 0 && stat > cell.card.baseatk) {
                                className += ' buff'
                              }

                              return (
                                <div key={key} className={className}>
                                  {stat}
                                </div>
                              )
                            })}
                          </div>

                          <img
                            className="cell-card-visual"
                            src={cell.card.url}
                            alt={`card-${cell.id}`}
                          />
                        </div>
                      )}
                      {cell.card && cell.card.recto === false && (
                        <BsQuestionLg size={90} className="hidden-icon" />
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="arena-borders">
                <div className={`arena-borders-container`}>
                  <div
                    className="arena-borders-item"
                    style={{
                      backgroundColor: turn === 1 || turn === 0 ? rival.hex : '#939393'
                    }}
                  ></div>
                  <div
                    className="arena-borders-item"
                    style={{
                      backgroundColor: turn === 2 || turn === 0 ? user.hex : '#939393'
                    }}
                  ></div>
                </div>
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
        {/* Menu haut */}
        <div className="ig-menu top" style={{ zIndex: 11 }}>
          <IconButton
            onClick={() => {
              navigate('/home')
            }}
          >
            <TiArrowBack size={45} />
            <span>Quitter</span>
          </IconButton>
        </div>
        {/* Menu bas */}
        <div
          className="ig-menu bottom"
          style={{ zIndex: tutorialStep.highlightedElements?.includes('bottom-menu') ? 10 : 0 }}
        >
          {(phase === 1 || phase === 2) && (
            <div className="costCounter">
              <div className="costCounter-infos">
                <IoIosFlash />
                <span>{costLeft}</span>
              </div>
              énergies
            </div>
          )}
          {phase === 4 && (
            <div
              className="costCounter"
              style={{
                color: diff >= 0 ? '#4ead35' : '#bb2424'
              }}
            >
              <div className="costCounter-infos">
                <GiPriceTag />
                <span>{diff}</span>
              </div>
              Différentiel
            </div>
          )}
          {phase !== null && (
            <IconButton
              className={`${tutorialStep.clickOn.element !== 'validate' && 'disabled'}`}
              onClick={() => {
                handleClick('validate')
              }}
            >
              {phase === 0 && (
                <>
                  <span>Échanger [ 1 ] cartes</span>
                  <GiConfirmed size={45} />
                </>
              )}
              {(phase === 1 || phase === 2 || phase === 3) && (
                <>
                  <span>Fin de phase</span>
                  <PiFlagCheckeredFill size={45} />
                </>
              )}
              {phase === 4 && (
                <>
                  <span>Valider l'échange</span>
                  <GiConfirmed size={45} />
                </>
              )}
            </IconButton>
          )}
        </div>
        {/* Shop */}
        {phase === 4 && (
          <div
            className={`window left`}
            style={{ zIndex: tutorialStep.highlightedElements?.includes('shop') ? 10 : 1 }}
          >
            <div className="shop-list">
              {shop.map((card) => (
                <div
                  key={card.name}
                  className={`shop-item ${tutorialStep.highlightedElements?.includes('shop-' + card.id) && 'important'} ${tutorialStep.selected?.includes('shop-' + card.id) && 'selected'}`}
                  onClick={() => handleClick('shop', card.id)}
                  onMouseEnter={playHover}
                >
                  <div className="img-container">
                    <div className={`card-cost`}>
                      <span className={`txt-rarity-${card.rarity}`}>{card.rarity}</span>
                    </div>
                    <img src={card.url} alt="shop card" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Filtre */}
      <div
        className="gameContainer-filter"
        style={{ background: `${turn === 2 || turn === 0 ? user.hex : rival.hex}` }}
      ></div>
    </div>
  )
}
