import { useEffect, useState } from 'react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { generateLocalArena, getCardsByIds } from '../others/toolBox'
import Modal from '../items/ClassicModal'
import Hand from '../interface/inGame/Hand'
import tutorialSteps from '../../jsons/tutorial.json'
import '../../styles/pages/tutorial.scss'
import { MdNavigateNext } from 'react-icons/md'
import { IoIosFlash } from 'react-icons/io'
import IconButton from '../items/iconButton'
import { GiConfirmed } from 'react-icons/gi'
import { TiArrowBack } from 'react-icons/ti'
import { useNavigate } from 'react-router-dom'
import { BsQuestionLg } from 'react-icons/bs'

export const Tutorial = () => {
  const [user, setUser] = useState(null)
  const [rival, setRival] = useState(null)
  const [costLeft, setCostLeft] = useState(4)
  const [phase, setPhase] = useState(0)
  const [pattern, setPattern] = useState(null)
  const [turn, setTurn] = useState(0)
  const [tutorialStep, setTutorialStep] = useState(null)
  const [step, setStep] = useState(0)
  const navigate = useNavigate()

  // Création du tuto
  useEffect(() => {
    // Création des users
    const ids = [15, 25, 63, 48]
    setUser({
      hex: '#40a8f5',
      hand: getCardsByIds(ids)
    })
    setRival({
      hex: '#e62e31'
    })

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
      if (tutorialStep.removeCard) {
        handleRemoveCard()
      }

      if (tutorialStep.addCard) {
        handleAddCard()
      }

      if (tutorialStep.moveCard) {
        handleMoveCard()
      }

      if (tutorialStep.turn) setTurn(tutorialStep.turn)
      if (tutorialStep.phase) setPhase(tutorialStep.phase)
      if (tutorialStep.cost) setCostLeft(tutorialStep.cost)

      // Si l'élément cliqué est correct et l'ID correspond, on passe à l'étape suivante
      if ((id && tutorialStep.clickOn.id === id) || !id) {
        setStep(step + 1)
      }
    }
  }

  // Fonction pour gérer la suppression d'une carte de la main ou d'une cellule
  function handleRemoveCard() {
    if (tutorialStep.removeCard.where === 'hand') {
      // Supprime une carte de la main
      setUser((prevUser) => ({
        ...prevUser,
        hand: prevUser.hand.filter((card) => card.id !== tutorialStep.removeCard.id)
      }))
    }

    if (tutorialStep.removeCard.where === 'cell') {
      // Supprime une carte d'une cellule
      setPattern((prevPattern) =>
        prevPattern.map((cell) =>
          cell.id === tutorialStep.removeCard.cellID ? { ...cell, card: null } : cell
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

  if (!user || !rival || !pattern || !tutorialStep) return
  return (
    <div className="tutorial fade-in">
      <div
        className={`tutorial-modal ${tutorialStep.position} ${tutorialStep.clickOn.element === 'dialog' && 'clickable'}`}
        onClick={() => {
          handleClick('dialog')
        }}
      >
        <div className="tutorial-modal-avatar">
          <img src={tutorialStep.url} alt="avatar du tuto, pendant le tuto" />
        </div>
        <div className="tutorial-modal-content">
          <span className="speaker">Tuto</span>
          <p className="text">{tutorialStep.text}</p>
        </div>
        {tutorialStep.clickOn.element === 'dialog' && (
          <MdNavigateNext className="next" size={150} />
        )}
      </div>
      {tutorialStep.modal && <Modal></Modal>}
      <div className="gameContainer">
        {/* Main */}
        <Hand style={{ zIndex: tutorialStep.highlightedElements?.includes('hand') ? 10 : 1 }}>
          {user.hand.map((card, index) => (
            <div
              key={index}
              className={`card ${tutorialStep.highlightedElements?.includes('hand-' + card.id) && 'important'} ${tutorialStep.selected?.includes('hand-' + card.id) && 'card-selected'}`}
              onClick={() => {
                handleClick('card', card.id)
              }}
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
                      className={`cell ${tutorialStep.highlightedElements?.includes('cell-' + cell.id) && 'important'} ${tutorialStep.selected?.includes('cell-' + cell.id) && 'selected'}`}
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
                    >
                      {tutorialStep.selected?.includes('cell-' + cell.id) && (
                        <div className="cell-placementTrigger" />
                      )}
                      {cell.card && cell.card.recto !== false && (
                        <div
                          className="cell-card"
                          onMouseEnter={() => {
                            hover()
                          }}
                        >
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
          {phase === 0 && (
            <IconButton
              onClick={() => {
                handleClick('validate')
              }}
            >
              <span>Échanger [ 1 ] cartes</span>
              <GiConfirmed size={45} />
            </IconButton>
          )}
        </div>
      </div>
      {/* Filtre */}
      <div
        className="gameContainer-filter"
        style={{ background: `${turn === 2 || turn === 0 ? user.hex : rival.hex}` }}
      ></div>
    </div>
  )
}
