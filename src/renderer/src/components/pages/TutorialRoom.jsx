import React, { useContext, useState, useEffect } from 'react'
import { GiConfirmed } from 'react-icons/gi'
import Hand from '../interface/inGame/Hand'
import { TutorialContext } from '../providers/TutorialProvider'
import { AuthContext } from '../../AuthContext'
import '../../styles/interface/inGame/arena.scss'
import '../../styles/items/cell.scss'
import '../../styles/items/card.scss'
import '../../styles/interface/inGame/shop.scss'
import '../../styles/interface/inGame/inGameMenus.scss'
import '../../styles/pages/tutorialRoom.scss'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import Details from '../interface/inGame/Details'
import { IoIosFlash } from 'react-icons/io'
import { TiArrowBack } from 'react-icons/ti'
import { useNavigate } from 'react-router-dom'
import IconButton from '../items/iconButton'
import { PiFlagCheckeredFill } from 'react-icons/pi'
import { BsQuestionLg } from 'react-icons/bs'
import { getAchievementById } from '../controllers/AchievementsController'
import ReactPlayer from 'react-player'

const TutorialText = ({ children, onClickNext, clickable }) => {
  const renderText = (text) => {
    return text.split('\n\n').map((paragraph, index) => (
      <p key={index}>
        {paragraph.split('\n').map((line, lineIndex) => (
          <React.Fragment key={lineIndex}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </p>
    ))
  }

  return (
    <div
      className={`tutorial-text ${clickable ? 'clickable' : ''}`}
      onClick={clickable ? onClickNext : null}
    >
      <div className="tutorial-text-speaker">
        <img src="" className="tutorial-text-speaker-img" alt="Speaker" />
        <h1>Tuto</h1>
      </div>
      <hr />
      <div className="tutorial-text-content">{renderText(children)}</div>
      {clickable && <div className="tutorial-text-continue">Appuyez pour continuer...</div>}
    </div>
  )
}

export default function TutorialRoom() {
  const {
    hand,
    placementCostLeft,
    setPlacementCostLeft,
    rival,
    turn,
    pattern,
    setPattern,
    setHand,
    rivalHand,
    detailCard,
    setDetailCard,
    setTurn,
    phase,
    setPhase,
    movesCostLeft,
    setMovesCostLeft,
    shopCard,
    setShopCard
  } = useContext(TutorialContext)
  const { user, userInfo, giveAchievement, userSettings } = useContext(AuthContext)
  const navigate = useNavigate()

  const [tutorialStep, setTutorialStep] = useState(1)
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedCell, setSelectedCell] = useState(null)
  const [selectedCellCard, setSelectedCellCard] = useState(null)
  const [selectedShopCard, setSelectedShopCard] = useState(null)
  const [selectedTradeCard, setSelectedTradeCard] = useState(null)
  const [tutorialWin, setTutorialWin] = useState(false)

  const stepsConfig = [
    {
      text: 'Tiens, tiens... Un nouvel adversaire. Tu cherchais un adversaire à ta... ah tu n’as jamais joué ? Bon ok, on va y aller lentement dans ce cas, tu sais je suis un peu un expert à ce jeu.',
      clickable: true,
      action: () => setTutorialStep(2)
    },
    {
      text: `Babelfest c’est un jeu mystérieux, on y retrouve plein de gens étranges qui disent tous venir d’univers différents, moi je préfère cet endroit perso, mon monde d’origine... IL ÉTAIT TERRIFIANT.

En tout cas, ici les gens jouent aux cartes avec... eux-mêmes, cherche pas à comprendre. Chaque tour d’une partie de Babelfest est séparé en 4 phases, on devrait d’abord faire une session d’échange de cartes, mais pour cette fois, on va la passer.

Normalement, on doit jouer 8 cartes, mais pour cette fois on en piochera 3 chacun.

Le but du jeu est de détruire toutes les cartes adverses ou de capturer la base adverse, la case colorée à l’opposé du terrain.`,
      clickable: true,
      action: () => {
        setPattern(
          pattern.map((cell) => (cell.id === 14 ? { ...cell, card: rivalHand[0], owner: 2 } : cell))
        )
        setPhase(1)
        setTutorialStep(3)
      }
    },
    {
      text: `La première phase d’un tour c’est le placement, tu as 4 énergies, qui te servent à invoquer. Regarde tes cartes, le petit chiffre indique le coût d’invocation.

Je commence par invoquer une première carte, Dai : Rockstar ! Cette carte coûte 2 énergies, il m’en reste donc 2 autres.

Vu que tu es un peu un... débutant, laisse un pro comme moi t’expliquer, les chiffres que tu peux voir sur la carte sont dans l’ordre : Attaque, Déplacement et Points de vie.`,
      clickable: true,
      action: () => {
        setPattern(
          pattern.map((cell) => (cell.id === 2 ? { ...cell, card: rivalHand[1], owner: 2 } : cell))
        )
        setTutorialStep(4)
      }
    },
    {
      text: `Je profite de mes énergies restantes pour invoquer une deuxième carte face vecto, sur ma base cette fois-ci.

Tu dois te dire que j’y vais trop fort avec toi... excuse-moi, c’est juste de la mémoire musculaire à force tu sais.`,
      clickable: true,
      action: () => {
        setTurn(2)
        setTutorialStep(5)
      }
    },
    {
      text: `Bien, mon tour est terminé, cette phase se termine quand je n'ai plus d'énergie ou que j'y mets fin manuellement, évidemment, tu ne sais pas ce que j'ai fait.

C'est à toi d'invoquer, commence par choisir une carte de ta main, perso je jouerais la carte que j'ai marquée en bleu mais tu sais, t'es pas obligé.`,
      clickable: false
    },
    {
      text: `Une fois ta carte choisie, place-la quelque part sur ta moitié de l'arène. Encore une fois, je la placerais sur cette case bleue, mais un débutant comme toi ne le fera sûrement pas.

Après l'invocation, tes énergies seront dépensées, s'il t'en reste, tu pourras réinvoquer.`,
      clickable: false
    },
    {
      text: `La compteuse à trois cordes... c'est... je vois. Enfin je veux dire... JE LE SAVAIS AHAHAH !

Hum, hum. Revenons au jeu, cette carte typique coûte une énergie, il t'en reste donc encore trois. Tu peux donc invoquer à nouveau, mais bon, t'es trop bête pour faire ça.`,
      clickable: false
    },
    {
      text: `Attends, tu vas vraiment le faire ?

Mince, t'es plus malin que je pensais.`,
      clickable: false
    },
    {
      text: `Phoebe, cette carte a une très bonne mobilité. C'est... pas mal, pour un débutant.

Bon je crois que ça suffit les invocations ! On va dire que tu as fini ton tour hein.

Après avoir invoqué, on va jouer un tour de déplacement. Tu peux déplacer tes cartes en dépensant de l'énergie de déplacement, comme pour l'invocation, tu as quatre énergies, une case coûte une énergie.

Regarde, je te montre.`,
      clickable: true,
      action: () => {
        setPattern(
          pattern.map((cell) =>
            cell.id === 10
              ? { ...cell, card: { ...rivalHand[1], recto: true }, owner: 2 }
              : cell.id === 2
                ? { ...cell, card: null, owner: 0 }
                : cell
          )
        )
        setPhase(2)
        setTutorialStep(10)
      }
    },
    {
      text: `Ahah ! Tu t'y attendais pas à celle-là, espèce de... Hum.

Comme tu peux voir, j'ai déplacé ma carte verso de deux cases, cela m'a coûté deux énergies. En se déplaçant, la carte a été révélée. C'était moi ! Tuto !

Il me reste encore deux énergies, mais je vais mettre fin manuellement à mon tour. À toi.`,
      clickable: true,
      action: () => {
        setTurn(2)
        setTutorialStep(11)
      }
    },
    {
      text: `T'es pas obligé, mais tu devrais déplacer l'une de tes cartes, chaque carte peut se déplacer une fois par tour, la distance possible que cette carte peut traverser est basée sur ses points de déplacements, le chiffre du milieu sur la carte.

      Par contre si tu déplaces CETTE carte, je suis mal. Heureusement que tu l'as pas vue.`,
      clickable: false
    },
    {
      text: `Attends... ! Non pas cette carte !

Euh... Quand tu... Quand tu as choisi ta carte, tu peux la déplacer suivant ses points de déplacement, donc là, 4 cases autour d'elle.

Bon, déplace-la où tu veux mais pas sur la case que je marque en bleu hein.`,
      clickable: false
    },
    {
      text: `Non ! Espèce de sale.... Bon, ok, ok.

Tu as dépensé deux énergies pour ce déplacement, il t'en reste encore deux, mais encore une fois, on va mettre fin à ton tour, pas besoin de déplacer ta deuxième carte hein.`,
      clickable: true,
      action: () => {
        setPattern(
          pattern.map((cell) =>
            cell.id === 14
              ? { ...cell, card: { ...cell.card, atk: cell.card.atk + 1 }, owner: 2 }
              : cell
          )
        )
        setTurn(1)
        setTutorialStep(14)
        setPhase(3)
      }
    },
    {
      text: `Bon, la phase suivante, c'est l'attaque. Tu peux attaquer une fois avec chacune de tes cartes, chaque carte peut attaquer les 4 cartes adjacentes. Dai, avec son effet Archer, est une exception qui peut attaquer aussi en diagonale.

Vu qu'on vient de démarrer la phase d'attaque, l'effet de Tuto s'active ! Il renforce tous ses alliés adjacents d'un point d'attaque jusqu'à la fin du tour. Je suis fier de moi, Tuto c'est vraiment le meilleur.

Mon Dai aura donc 4 points d'attaque jusqu'à la fin du tour, pas de chance pour ta Compteuse à trois cordes.

Je choisis une carte qui attaque, puis sa cible, TA COMPTEUSE !`,
      clickable: true,
      action: () => {
        setPattern(
          pattern.map((cell) => (cell.id === 18 ? { ...cell, card: null, owner: 0 } : cell))
        )
        setTutorialStep(15)
        setTurn(2)
      }
    },
    {
      text: `BAM ! Et voilà ! Ta compteuse a subi 4 points de dégâts, elle avait 4 points de vie, je l'ai détruite. Maintenant que j'ai attaqué, c'est à ton tour d'attaquer...

S'il te plaît, ne fais pas ça ! N'attaque pas ma carte Tuto avec ta Phoebe, je t'en prie !!!`,
      clickable: false
    },
    {
      text: `Arrête, ne fais pas ça !`,
      clickable: false
    },
    {
      text: `Non non non !
    
    T'es content maintenant ?! T'as attaqué donc c'est à mon tour d'attaquer de nouveau, mais vu que Dai a déjà attaqué, il ne peut pas attaquer de nouveau, je suis obligé de conclure mon tour...
    
    De même, vu que Phoebe a déjà attaqué, tu n'as aucune carte pouvant attaquer, donc tu dois toi aussi mettre fin à ton tour.
    
    ...Passons à la dernière phase, la phase de troc.`,
      clickable: true,
      action: () => {
        setTurn(2)
        setTutorialStep(18)
      }
    },
    {
      text: `Tu vois ça ? C'est la boutique, elle te permet d'échanger une carte de ta main avec la liste présente pour optimiser tes stratégies.
      
      Pour échanger, tu peut choisir une carte de ta main, une de la boutique, et cliquer sur le bouton échanger.
      
      Vas-y, tente le coup. Je devrait échanger en premier mais je vais garder ma carte.`,
      clickable: false
    },
    {
      text: `Et voilà !
      
      Tu viens de terminer ta première manche de Babelfest. Maintenant la partie continue en répétant chaque phase, invocation, déplacement, attaque, troc.

      Le premier joueur qui capture la base adverse ou qui détruit les 8 cartes de l'adversaire gagne !`,
      clickable: true,
      action: () => {
        setPattern(
          pattern.map((cell) =>
            cell.id === 14 ? { ...cell, card: { ...cell.card, atk: 3 }, owner: 2 } : cell
          )
        )
        setPhase(1)
        setPlacementCostLeft(4)
        setMovesCostLeft(4)
        setTutorialStep(20)
      }
    },
    {
      text: `Comme j'ai commencé en premier au tour précédent, c'est à toi de commencer chaque phases de ce tour.
      
      Vas-y, invoque ta dernière carte inutile !`,
      clickable: false
    },
    {
      text: `Tu protège ta base...
      
      Il faut croire que le ton jeu ne contient aucune carte inutile finalement.
      
      Bon, mon tour d'invoquer... Eh. je vais garder ma carte en main. Tu va être très surpris au prochain tour.`,
      clickable: true,
      action: () => {
        setTurn(2)
        setPhase(2)
        setMovesCostLeft(4)
        setTutorialStep(22)
      }
    },
    {
      text: `Allez, déplace tes misérables cartes de noob.
      
      Attend... Phoebe, elle peut...
      
      Oh non.`,
      clickable: false
    },
    {
      text: `Eh... l'ami.
      
      T'es pas obligé de faire ça tu sais.`,
      clickable: false
    },
    {
      text: `...`,
      clickable: true,
      action: () => {
        setTutorialStep(25)
      }
    },
    {
      text: `C'EST PAS VRAI J'AI PERDU !!!

...c'était juste la chance du débutant !`,
      clickable: true,
      action: () => {
        setTutorialStep(26)
      }
    },
    {
      text: `... AH AH AH ! Allez, gamin, t'es prêt, je t'ai parfaitement entraîné.
      
      Va affronter le monde, je t'attendrait au sommet.`,
      clickable: true,
      action: () => {
        setTutorialWin(true)
      }
    }
  ]

  const handleCardClick = (index, card) => {
    if (tutorialStep === 5 && index === 0) {
      setTutorialStep(6)
    } else if (tutorialStep === 7 && index === 0) {
      setTutorialStep(8)
    }
    if (tutorialStep === 18) {
      setSelectedTradeCard(card)
    }
    if (tutorialStep === 20) {
      setSelectedCard(card)
    }
  }

  const handleTextClick = () => {
    if (stepsConfig[tutorialStep - 1].clickable) {
      stepsConfig[tutorialStep - 1].action()
    }
  }

  const handleCellClick = (id) => {
    if (tutorialStep === 6 && id === 18) {
      if (selectedCell === id) {
        setPattern(
          pattern.map((cell) => (cell.id === 18 ? { ...cell, card: hand[0], owner: 1 } : cell))
        )
        setHand(hand.slice(1))
        setSelectedCell(null)
        setPlacementCostLeft(3)
        setTutorialStep(7)
      } else {
        setSelectedCell(id)
      }
    } else if (tutorialStep === 8 && id === 17) {
      if (selectedCell === id) {
        setPattern(
          pattern.map((cell) => (cell.id === 17 ? { ...cell, card: hand[0], owner: 1 } : cell))
        )
        setHand(hand.slice(1))
        setSelectedCell(null)
        setTurn(1)
        setTutorialStep(9)
        setPlacementCostLeft(2)
      } else {
        setSelectedCell(id)
      }
    } else if (tutorialStep === 11 && id === 17) {
      setSelectedCellCard(id)
      setTutorialStep(12)
    } else if (tutorialStep === 12 && id === 9) {
      if (selectedCell === id) {
        const cardToMove = pattern.find((cell) => cell.id === 17).card
        setPattern(
          pattern.map((cell) =>
            cell.id === 9
              ? { ...cell, card: cardToMove, owner: 1 }
              : cell.id === 17
                ? { ...cell, card: null, owner: 0 }
                : cell
          )
        )
        setSelectedCell(null)
        setSelectedCellCard(null)
        setTurn(1)
        setTutorialStep(13)
        setMovesCostLeft(2)
      } else if (selectedCell === 17) {
        setSelectedCell(id)
      } else {
        setSelectedCell(id)
      }
    } else if (tutorialStep === 15 && id === 9) {
      setSelectedCellCard(id)
      setTutorialStep(16)
    } else if (tutorialStep === 16 && id === 10) {
      if (selectedCell === id) {
        setPattern(
          pattern.map((cell) => (cell.id === 10 ? { ...cell, card: null, owner: 0 } : cell))
        )
        setSelectedCellCard(null)
        setSelectedCell(null)
        setTutorialStep(17)
      } else {
        setSelectedCell(id)
      }
    } else if (tutorialStep === 20 && id === 29 && selectedCard) {
      if (selectedCell === id) {
        setPattern(
          pattern.map((cell) => (cell.id === 29 ? { ...cell, card: hand[0], owner: 1 } : cell))
        )
        setHand([])
        setTurn(1)
        setTutorialStep(21)
        setSelectedCard(null)
        setSelectedCell(null)
        setPlacementCostLeft(4 - selectedCard.rarity)
      } else {
        setSelectedCell(id)
      }
    } else if (tutorialStep === 22 && id === 9) {
      setSelectedCellCard(id)
      setTutorialStep(23)
    } else if (tutorialStep === 23 && id === 2) {
      if (selectedCell) {
        const cardToMove = pattern.find((cell) => cell.id === 9).card
        setPattern(
          pattern.map((cell) =>
            cell.id === 2
              ? { ...cell, card: cardToMove, owner: 1 }
              : cell.id === 9
                ? { ...cell, card: null, owner: 0 }
                : cell
          )
        )
        setTutorialStep(24)
        setMovesCostLeft(2)
        setSelectedCell(null)
        setSelectedCellCard(null)
      } else {
        setSelectedCell(id)
      }
    }
  }

  useEffect(() => {
    if (!stepsConfig[tutorialStep - 1].clickable && stepsConfig[tutorialStep - 1].action) {
      stepsConfig[tutorialStep - 1].action()
    }
  }, [tutorialStep])

  useEffect(() => {
    if (tutorialWin) {
      const achievement = getAchievementById('HF_tutorial')
      giveAchievement(achievement)

      setTimeout(() => {
        navigate('/home')
      }, 2000)
    }
  }, [tutorialWin])

  return (
    <>
      <div className="gameContainer">
        <Hand>
          {hand.map((card, index) => (
            <div
              key={index}
              className={`card ${placementCostLeft - card.rarity < 0 ? 'card-unusable' : ''} ${card.shiny ? card.shiny : ''} ${
                tutorialStep === 5 && index === 0 ? 'important' : ''
              } ${(tutorialStep === 6 || tutorialStep === 8 || selectedTradeCard || (selectedCard && selectedCard.name === card.name)) && index === 0 ? 'card-selected' : ''} ${
                (tutorialStep === 7 || tutorialStep === 20) && index === 0 ? 'important' : ''
              }`}
              onClick={() => handleCardClick(index, card)}
              onMouseEnter={() => {
                setDetailCard(card)
              }}
              onMouseLeave={() => {
                setDetailCard(null)
              }}
            >
              <div className="img-container">
                <div className={`card-cost`}>
                  <span className={`txt-rarity-${card.rarity}`}>{card.rarity}</span>
                </div>
                <img className="card-visual" src={card.url} alt={`card-${index}`} />
                {(tutorialStep === 6 ||
                  tutorialStep === 8 ||
                  selectedTradeCard ||
                  (selectedCard && selectedCard.name === card.name)) &&
                  index === 0 && <div className="card-filter"></div>}
              </div>
            </div>
          ))}
        </Hand>
        <div className="arena-wrapper" onContextMenu={(e) => e.preventDefault()}>
          <TransformWrapper
            minScale={0.5}
            maxScale={2.5}
            initialScale={0.65}
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

                  const isImportantCell = (cellId) => {
                    return (
                      (tutorialStep === 6 && cellId === 18) ||
                      (tutorialStep === 8 && cellId === 17) ||
                      (tutorialStep === 11 && cellId === 17) ||
                      (tutorialStep === 12 && cellId === 9) ||
                      (tutorialStep === 16 && cellId === 10) ||
                      (tutorialStep === 15 && cellId === 9) ||
                      (tutorialStep === 20 && cellId === 29 && selectedCard !== null) ||
                      (tutorialStep === 22 && cellId === 9) ||
                      (tutorialStep === 23 && cellId === 2)
                    )
                  }

                  return (
                    <div
                      key={index}
                      className={`cell ${isImportantCell(cell.id) ? 'important' : ''} ${
                        selectedCellCard === cell.id ? 'selected' : ''
                      } ${selectedCell === cell.id ? 'selected-noVibrate' : ''}`}
                      id={cell.id}
                      data-team={cell.side}
                      style={{
                        backgroundColor:
                          cell.side && cell.base
                            ? cell.side === 2
                              ? userInfo.primaryColor
                              : rival.primaryColor
                            : '#000',
                        '--rotation': `0deg`,
                        borderColor: cell.owner
                          ? cell.owner === 1
                            ? userInfo.primaryColor
                            : rival.primaryColor
                          : '#fff'
                      }}
                      onClick={() => handleCellClick(cell.id)}
                    >
                      {isImportantCell(cell.id) && <div className="cell-placementTrigger yellow" />}
                      {selectedCell === cell.id && <GiConfirmed className="above" size={90} />}
                      {cell.card && cell.card.recto !== false && (
                        <div
                          className="cell-card"
                          onMouseEnter={() => {
                            setDetailCard(cell.card)
                          }}
                          onMouseLeave={() => {
                            setDetailCard(null)
                          }}
                        >
                          <div className="cell-card-stats">
                            {[cell.card.atk, cell.card.dep, cell.card.hp].map((stat, key) => {
                              let className = 'cell-card-stats-item'
                              if (key === 0 && stat > cell.card.baseatk) {
                                // Vérifie si c'est le premier élément (atk) et s'il est supérieur à baseatk
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
                        <BsQuestionLg
                          onMouseEnter={() => setDetailCard('hidden')}
                          onMouseLeave={() => setDetailCard(null)}
                          size={90}
                          className="hidden-icon"
                        />
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
                      backgroundColor: turn === 1 ? rival.primaryColor : '#939393',
                      boxShadow: turn === 1 ? `0 -10px 70px ${rival.primaryColor}` : 'none'
                    }}
                  ></div>
                  <div
                    className="arena-borders-item"
                    style={{
                      backgroundColor: turn === 2 ? userInfo.primaryColor : '#939393',
                      boxShadow: turn === 2 ? `0 10px 70px ${userInfo.primaryColor}` : 'none'
                    }}
                  ></div>
                </div>
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
        {detailCard && <Details detailCard={detailCard} />}

        <div className="ig-menu bottom">
          {(phase === 1 || phase === 2) && (
            <div className="costCounter">
              <div className="costCounter-infos">
                <IoIosFlash />
                <span>{phase === 1 ? placementCostLeft : movesCostLeft}</span>
              </div>
              énergies
            </div>
          )}
          {tutorialStep === 18 && (
            <IconButton
              className={selectedShopCard && selectedTradeCard ? '' : 'disabled'}
              onClick={() => {
                if (selectedShopCard && selectedTradeCard) {
                  setHand([selectedShopCard])
                  setShopCard((prevShopCard) => {
                    return [
                      ...prevShopCard.filter((card) => card.name !== selectedShopCard.name),
                      selectedTradeCard
                    ]
                  })
                  setSelectedShopCard(null)
                  setSelectedTradeCard(null)
                  setTutorialStep(19)
                }
              }}
            >
              {selectedShopCard && selectedTradeCard ? (
                <>
                  <span>Valider l'échange</span>
                  <GiConfirmed size={45} />
                </>
              ) : (
                <>
                  <span>Fin de phase</span>
                  <PiFlagCheckeredFill size={45} />
                </>
              )}
            </IconButton>
          )}
        </div>
        <div className="ig-menu top">
          <IconButton
            onClick={() => {
              navigate('/home')
            }}
          >
            <TiArrowBack size={45} />
            <span>Quitter</span>
          </IconButton>
          {/* <IconButton
              onClick={() => {
                setLeftWindow(leftWindow === 'shop' ? null : 'shop')
                setMusicPlayer(false)
              }}
              active={leftWindow === 'shop'}
            >
              <GiPriceTag size={45} />
              <span>Boutique</span>
            </IconButton> */}
        </div>
        <div className={`window left tutorial-shop ${tutorialStep === 18 ? '' : 'hidden'}`}>
          <div className="shop-list">
            {shopCard.map((card) => (
              <div
                className={`shop-item ${selectedShopCard && selectedShopCard.name === card.name ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedShopCard(card)
                }}
                onMouseEnter={() => setDetailCard(card)}
                onMouseLeave={() => setDetailCard(null)}
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
      </div>
      <div
        className="gameContainer-filter"
        style={{ background: `${turn === 2 ? userInfo.primaryColor : rival.primaryColor}` }}
      ></div>
      <img
        className={`gameContainer-bg`}
        src="https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt={'background du menu'}
      />
      <TutorialText
        onClickNext={handleTextClick}
        clickable={stepsConfig[tutorialStep - 1].clickable}
      >
        {stepsConfig[tutorialStep - 1].text}
      </TutorialText>
      {tutorialWin && <div className="tutorial-win fade-in"></div>}
      <ReactPlayer
        volume={userSettings.musicVolume}
        url={'https://www.youtube.com/watch?v=Tb4herBVRGY'}
        playing={true}
        width={0}
        height={0}
        loop={true}
      />
    </>
  )
}
