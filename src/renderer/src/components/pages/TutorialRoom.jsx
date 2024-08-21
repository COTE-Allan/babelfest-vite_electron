import React, { useContext, useState, useEffect } from 'react'
import { GiConfirmed, GiPriceTag } from 'react-icons/gi'
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
import ClassicModal from '../items/ClassicModal'
import useSound from 'use-sound'
import selectSfx from '../../assets/sfx/card_select.wav'
import hoverSfx from '../../assets/sfx/card_hover.wav'

import TutoNonchalent from '../../assets/img/Tuto_nonchalent.png'
import TutoHautain from '../../assets/img/Tuto_hautain.png'
import TutoPleure from '../../assets/img/Tuto_pleure.png'
import TutoRire from '../../assets/img/Tuto_rire.png'
import TutoSournois from '../../assets/img/Tuto_sournois.png'
import TutoStress from '../../assets/img/Tuto_stress.png'

import BabelfestBackground from '../../assets/img/fond_babelfest.png'

const TutorialText = ({ children, onClickNext, clickable, image }) => {
  const renderText = (text) => {
    return text.split('§').map((paragraph, index) => (
      <p key={index}>
        {paragraph.split('\n').map((line, lineIndex) => (
          <React.Fragment key={lineIndex}>
            {line.split(/(\*\*.*?\*\*)/g).map((part, i) => {
              const match = part.match(/^\*\*(\d)(.*?)\*\*$/)
              if (match) {
                const [_, digit, content] = match
                const className =
                  digit === '1'
                    ? 'red'
                    : digit === '2'
                      ? 'blue'
                      : digit === '3'
                        ? 'green'
                        : digit === '0'
                          ? 'white'
                          : digit === '4'
                            ? 'gold'
                            : digit === '5'
                              ? 'purple'
                              : ''
                return (
                  <strong key={i} className={className}>
                    {content}
                  </strong>
                )
              }
              return <React.Fragment key={i}>{part}</React.Fragment>
            })}
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
        <img src={image} className="tutorial-text-speaker-img" alt="Speaker" />
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
  const [selectedCellCard, setSelectedCellCard] = useState([])
  const [selectedShopCards, setSelectedShopCards] = useState([])
  const [selectedHandCards, setSelectedHandCards] = useState([])
  const [selectedTradeCard, setSelectedTradeCard] = useState(null)
  const [tutorialWin, setTutorialWin] = useState(false)
  const [handTradeCost, setHandTradeCost] = useState(0)
  const [shopTradeCost, setShopTradeCost] = useState(0)

  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })

  const stepsConfig = [
    {
      img: TutoHautain,
      text: `Tiens, tiens... Un nouvel adversaire. Tu cherchais un adversaire à ta... ah tu n’as jamais joué ?§
      Bon ok, on va y aller lentement dans ce cas, tu sais je suis un peu un expert à ce jeu.`,
      clickable: true,
      modal: true,
      action: () => setTutorialStep(2)
    },
    {
      img: TutoNonchalent,
      text: `Bien alors...§
      Chaque tour d’une partie de Babelfest est séparé en **04 phases**, avant de commencer, **0chaque joueur pioche 8 cartes du paquet commun** mais pour cette fois, on en piochera 4.§
      Le but du jeu est de **0détruire toutes les cartes adverses** ou de **0capturer la base adverse**, la **4case colorée** à l’opposé du terrain.`,
      clickable: true,
      modal: true,
      zindex: ['arena'],
      action: () => {
        setPattern(
          pattern.map((cell) => (cell.id === 14 ? { ...cell, card: rivalHand[0], owner: 2 } : cell))
        )
        setPhase(1)
        setTutorialStep(3)
      }
    },
    {
      img: TutoHautain,
      text: `La première phase d’un tour, c’est le **0placement**. Tu as **04 énergies** qui te servent à invoquer. Regarde tes cartes, le petit chiffre indique **0le coût d’invocation.**§
      Je commence par invoquer une première carte, Dai : Rockstar ! **0Cette carte coûte 2 énergies, il m’en reste donc 2.**§
      Vu que tu es un peu... débutant, laisse un pro comme moi t’expliquer : les chiffres que tu peux voir sur la carte sont, dans l’ordre : **1Attaque**, **3Déplacement** et **2Points de vie.**`,
      clickable: true,
      action: () => {
        setPattern(
          pattern.map((cell) => (cell.id === 2 ? { ...cell, card: rivalHand[1], owner: 2 } : cell))
        )
        setTutorialStep(4)
      }
    },
    {
      img: TutoSournois,
      text: `Je profite de mes énergies restantes pour invoquer une deuxième carte **0face verso**, sur ma base cette fois-ci.§
      Tu dois te dire que j’y vais trop fort avec toi... excuse-moi, c’est juste de la mémoire musculaire à force, tu sais.`,
      clickable: true,
      action: () => {
        setTurn(2)
        setTutorialStep(5)
      }
    },
    {
      img: TutoNonchalent,
      text: `Bien, mon tour est terminé, **0cette phase se termine quand je n'ai plus d'énergie ou que j'y mets fin manuellement**, évidemment, tu ne sais pas ce que j'ai fait.§
      C'est à toi d'invoquer, **0commence par choisir une carte de ta main.** Personnellement, je jouerais la carte que j'ai marquée en **2bleu.**`,
      clickable: false,
      modal: true,
      zindex: ['cards']
    },
    {
      img: TutoHautain,
      text: `Une fois ta carte choisie, place-la quelque part sur **0ta moitié de l'arène.** Encore une fois, je la placerais sur **2cette case bleue**, mais un débutant comme toi ne le fera sûrement pas.§
      **0Après l'invocation, tes énergies seront dépensées. S'il t'en reste, tu pourras réinvoquer.**`,
      clickable: false,
      modal: true,
      zindex: ['cards', 'arena']
    },
    {
      img: TutoRire,
      text: `La Compteuse à trois cordes... c'est... je vois. Enfin je veux dire... JE LE SAVAIS AHAHAH !§
      Hum, hum. Revenons au jeu, cette carte typique coûte une énergie, il t'en reste donc encore trois. **0Tu peux donc invoquer à nouveau**, mais bon, t'es trop bête pour faire ça.`,
      clickable: false
    },
    {
      img: TutoStress,
      text: `Attends, tu vas vraiment le faire ?§
      Mince, t'es plus malin que je pensais.`,
      clickable: false
    },
    {
      img: TutoHautain,
      text: `Phoebe, cette carte a une très bonne **3mobilité**. C'est... pas mal, pour un débutant.§
      Bon je crois que ça suffit les invocations ! On va dire que tu as fini ton tour hein.§
      Après avoir invoqué, on va jouer un tour de **3déplacement**. Tu peux déplacer tes cartes en dépensant de **3l'énergie de déplacement**. Comme pour l'invocation, tu as 4 énergies, **0traverser une case coûte une énergie.**
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
      },
      modal: true,
      zindex: ['menu']
    },
    {
      img: TutoRire,
      text: `Ahah ! Tu t'y attendais pas à celle-là, espèce de... Hum.§
      Comme tu peux voir, j'ai déplacé ma carte verso de deux cases, cela m'a coûté **3deux énergies**. **0En se déplaçant, la carte a été révélée.** C'était moi ! Tuto !§
      Il me reste encore deux énergies, mais je vais mettre fin manuellement à mon tour. À toi.`,
      clickable: true,
      action: () => {
        setTurn(2)
        setTutorialStep(11)
      }
    },
    {
      img: TutoHautain,
      text: `Tu devrais déplacer l'une de tes cartes. **0Chaque carte peut se déplacer une fois par tour,** la distance possible que cette carte peut traverser est basée sur **3ses points de déplacement**, le chiffre du milieu sur la carte.§
      Par contre si tu déplaces **2CETTE** carte, je suis mal. Heureusement que tu l'as pas vue.`,
      clickable: false
    },
    {
      img: TutoStress,
      text: `Attends... ! Non pas cette carte !§
      Euh... Quand tu... Quand tu as choisi ta carte, tu peux la déplacer suivant ses points de déplacement, donc là, 4 cases autour d'elle.§
      Bon, déplace-la où tu veux mais pas sur la case que je marque en bleu hein.`,
      clickable: false
    },
    {
      img: TutoPleure,
      text: `Non ! Espèce de sale... Bon, ok, ok.§
      Tu as dépensé **32 énergies** pour ce déplacement, il t'en reste encore 2, mais encore une fois, on va mettre fin à ton tour, pas besoin de déplacer ta deuxième carte hein.`,
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
      img: TutoNonchalent,
      text: `Bon, la phase suivante, c'est **1l'attaque**. **0Tu peux attaquer une fois avec chacune de tes cartes**. Chaque carte peut attaquer **0les 4 cartes adjacentes.**§
      Vu qu'on vient de démarrer **1la phase d'attaque**, **5l'effet** de Tuto s'active ! Il renforce tous ses alliés adjacents **1d'un point d'attaque** jusqu'à la fin du tour. Tuto c'est vraiment le meilleur.§
      Mon Dai aura donc 4 points d'attaque jusqu'à la fin du tour, pas de chance pour ta Compteuse à trois cordes.`,
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
      img: TutoRire,
      text: `BAM ! Et voilà ! **1Ta compteuse a subi 4 points de dégâts**, elle avait **24 points de vie**, je l'ai détruite. Maintenant que j'ai attaqué, c'est à ton tour d'attaquer...§
      S'il te plaît, ne fais pas ça ! N'attaque pas ma carte Tuto avec ta Phoebe, je t'en prie !!!`,
      clickable: false
    },
    {
      img: TutoPleure,
      text: `Arrête, ne fais pas ça !`,
      clickable: false
    },
    {
      img: TutoStress,
      text: `Non non non !
      T'es content maintenant ?! **0T'as attaqué donc c'est à mon tour d'attaquer de nouveau**, mais **0Dai ne peut pas attaquer deux fois**, je suis obligé de conclure mon tour...§
      De même, **0tu n'as aucune carte pouvant attaquer**, donc tu dois toi aussi mettre fin à ton tour.§
      ...Passons à la dernière phase, **4la phase de troc**.`,
      clickable: true,
      action: () => {
        setTurn(2)
        setTutorialStep(18)
      }
    },
    {
      img: TutoHautain,
      text: `Tu vois ça ? C'est la boutique, **4elle te permet d'échanger une carte de ta main avec la liste présente pour optimiser tes stratégies.**§
      **0Un échange doit toujours avantager la boutique.** Le **4différentiel d'échange**, basé sur le coût d'invocation des cartes échangés, **0doit être supérieur ou égal à 0.**§
      Le différentiel **3augmente** quand tu sélectionne une carte de ta main, il **1baisse** quand tu en choisie une de la boutique.
      Vas-y, tente le coup. Je devrais échanger en premier, mais je vais garder ma carte.`,
      clickable: false,
      modal: true,
      zindex: ['cards', 'shop', 'menu']
    },
    {
      img: TutoNonchalent,
      text: `Tu viens de terminer ta première manche de Babelfest. Maintenant **0la partie continue en répétant chaque phase** : **0invocation, **2déplacement**, **1attaque**, **4troc**.§
      **0Le premier joueur qui capture la **4base** adverse ou qui détruit les 8 cartes de l'adversaire gagne !**`,
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
      img: TutoHautain,
      text: `Comme j'ai commencé en premier au tour précédent, **0c'est à toi de commencer chaque phase de ce tour.**§
      Vas-y, invoque ta dernière carte inutile !`,
      clickable: false
    },
    {
      img: TutoSournois,
      text: `Tu protèges ta base...
      Il faut croire que ton jeu ne contient aucune carte inutile finalement.§
      Bon, c'est mon tour d'invoquer... Eh, je vais garder ma carte en main. Tu vas être très surpris au prochain tour.`,
      clickable: true,
      action: () => {
        setTurn(2)
        setPhase(2)
        setMovesCostLeft(4)
        setTutorialStep(22)
      }
    },
    {
      img: TutoHautain,
      text: `Allez, déplace tes misérables cartes de noob.§
      Attend... Phoebe, elle peut...§
      Oh non.`,
      clickable: false
    },
    {
      img: TutoStress,
      text: `Eh... l'ami.§
      T'es pas obligé de faire ça, tu sais.`,
      clickable: false
    },
    {
      img: TutoStress,
      text: `...`,
      clickable: true,
      action: () => {
        setTutorialStep(25)
      }
    },
    {
      img: TutoPleure,
      text: `C'EST PAS VRAI J'AI PERDU !!!§
      ...c'était juste la chance du débutant !`,
      clickable: true,
      action: () => {
        setTutorialStep(26)
      }
    },
    {
      img: TutoRire,
      text: `... AH AH AH ! Allez, gamin, t'es prêt, je t'ai parfaitement entraîné.§
      Va affronter le monde, je t'attendrai au sommet.`,
      clickable: true,
      action: () => {
        setTutorialWin(true)
      }
    }
  ]

  const handleCardClick = (index, card) => {
    select()
    if (tutorialStep === 5 && index === 0) {
      setTutorialStep(6)
    } else if (tutorialStep === 7 && index === 0) {
      setTutorialStep(8)
    }
    if (tutorialStep === 18) {
      handleHandItemClick(card)
    }
    if (tutorialStep === 20 && index === 0) {
      setSelectedCard(hand[0])
    }
  }

  const handleTextClick = () => {
    if (stepsConfig[tutorialStep - 1].clickable) {
      select()
      stepsConfig[tutorialStep - 1].action()
    }
  }

  const handleCellClick = (id) => {
    select()
    if (tutorialStep === 6 && id === 18) {
      if (selectedCell === id) {
        setPattern(
          pattern.map((cell) => (cell.id === 18 ? { ...cell, card: hand[0], owner: 1 } : cell))
        )
        setHand(hand.slice(1))
        setSelectedCell(null)
        setPlacementCostLeft(3)
        setTutorialStep(7)
        setSelectedCellCard([])
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
        setSelectedCellCard([])
      } else {
        setSelectedCell(id)
      }
    } else if (tutorialStep === 11 && id === 17) {
      setSelectedCellCard([id])
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
        setSelectedCellCard([])
        setTurn(1)
        setTutorialStep(13)
        setMovesCostLeft(2)
      } else if (selectedCell === 17) {
        setSelectedCell(id)
      } else {
        setSelectedCell(id)
      }
    } else if (tutorialStep === 15 && id === 9) {
      setSelectedCellCard([id])
      setTutorialStep(16)
    } else if (tutorialStep === 16 && id === 10) {
      if (selectedCell === id) {
        setPattern(
          pattern.map((cell) => (cell.id === 10 ? { ...cell, card: null, owner: 0 } : cell))
        )
        setSelectedCellCard([])
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
        setSelectedCellCard([])
        setPlacementCostLeft(4 - selectedCard.rarity)
      } else {
        setSelectedCell(id)
      }
    } else if (tutorialStep === 22 && id === 9) {
      setSelectedCellCard([id])
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
        setSelectedCellCard([])
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
      giveAchievement('HF_tutorial')

      setTimeout(() => {
        navigate('/home')
      }, 2000)
    }
  }, [tutorialWin])

  useEffect(() => {
    const totalCost = selectedShopCards.reduce((total, card) => total + card.rarity, 0)
    setShopTradeCost(totalCost)
  }, [selectedShopCards])

  useEffect(() => {
    const totalCost = selectedHandCards.reduce((total, card) => total + card.rarity, 0)
    setHandTradeCost(totalCost)
  }, [selectedHandCards])

  const handleShopItemClick = (card) => {
    select()
    if (selectedShopCards.some((selectedCard) => selectedCard.name === card.name)) {
      setSelectedShopCards(
        selectedShopCards.filter((selectedCard) => selectedCard.name !== card.name)
      )
    } else {
      setSelectedShopCards([...selectedShopCards, card])
    }
  }

  const handleHandItemClick = (card) => {
    select()
    if (selectedHandCards.some((selectedCard) => selectedCard.name === card.name)) {
      setSelectedHandCards(
        selectedHandCards.filter((selectedCard) => selectedCard.name !== card.name)
      )
    } else {
      setSelectedHandCards([...selectedHandCards, card])
    }
  }

  return (
    <>
      <div className="gameContainer">
        <Hand style={{ zIndex: stepsConfig[tutorialStep - 1]?.zindex?.includes('cards') ? 12 : 1 }}>
          {hand.map((card, index) => (
            <div
              key={index}
              className={`card ${placementCostLeft - card.rarity < 0 ? 'card-unusable' : ''} ${card.shiny ? card.shiny : ''} ${
                tutorialStep === 5 && index === 0 ? 'important' : ''
              } ${
                (tutorialStep === 6 ||
                  tutorialStep === 8 ||
                  selectedTradeCard ||
                  (selectedCard && selectedCard.name === card.name)) &&
                index === 0
                  ? 'card-selected'
                  : ''
              } ${(tutorialStep === 7 || tutorialStep === 20) && index === 0 ? 'important' : ''} ${
                tutorialStep === 18 &&
                selectedHandCards.some((selected) => selected.name === card.name)
                  ? 'card-selected'
                  : ''
              }`}
              onClick={() => handleCardClick(index, card)}
              onMouseEnter={() => {
                hover()
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
                {tutorialStep === 18 &&
                  selectedHandCards.some((selected) => selected.name === card.name) && (
                    <div className="card-filter"></div>
                  )}
              </div>
            </div>
          ))}
        </Hand>

        <div
          className="arena-wrapper"
          onContextMenu={(e) => e.preventDefault()}
          style={{ zIndex: stepsConfig[tutorialStep - 1]?.zindex?.includes('arena') ? 11 : 0 }}
        >
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
                        selectedCellCard.includes(cell.id) ? 'selected' : ''
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
                      onClick={() => {
                        if (isImportantCell(cell.id))
                          setSelectedCellCard([...selectedCellCard, cell.id])
                        handleCellClick(cell.id)
                      }}
                    >
                      {isImportantCell(cell.id) && (!cell.card || cell.owner !== 1) && (
                        <div className="cell-placementTrigger" />
                      )}
                      {selectedCell === cell.id && <GiConfirmed className="above" size={90} />}
                      {cell.card && cell.card.recto !== false && (
                        <div
                          className="cell-card"
                          onMouseEnter={() => {
                            hover()
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

        <div
          className="ig-menu bottom"
          style={{ zIndex: stepsConfig[tutorialStep - 1]?.zindex?.includes('menu') ? 11 : 0 }}
        >
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
            <>
              <IconButton
                style={{ zIndex: stepsConfig[tutorialStep - 1]?.zindex?.includes('shop') ? 12 : 1 }}
                className={
                  selectedShopCards.length > 0 &&
                  selectedHandCards.length > 0 &&
                  handTradeCost - shopTradeCost >= 0
                    ? ''
                    : 'disabled'
                }
                onClick={() => {
                  if (
                    selectedShopCards.length > 0 &&
                    selectedHandCards.length > 0 &&
                    handTradeCost - shopTradeCost >= 0
                  ) {
                    setHand([
                      ...hand.filter((card) => !selectedHandCards.includes(card)),
                      ...selectedShopCards
                    ])
                    setShopCard((prevShopCard) => {
                      return [
                        ...prevShopCard.filter(
                          (card) =>
                            !selectedShopCards.some(
                              (selectedCard) => selectedCard.name === card.name
                            )
                        ),
                        ...selectedHandCards
                      ]
                    })
                    setSelectedShopCards([])
                    setSelectedHandCards([])
                    setSelectedTradeCard(null)
                    setTutorialStep(19)
                  }
                }}
              >
                {selectedShopCards.length > 0 &&
                selectedHandCards.length > 0 &&
                handTradeCost - shopTradeCost >= 0 ? (
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
              <div
                className="costCounter"
                style={{ zIndex: stepsConfig[tutorialStep - 1]?.zindex?.includes('shop') ? 12 : 1 }}
              >
                <div
                  className="costCounter-infos"
                  style={{
                    color:
                      selectedShopCards.length === 0 && selectedHandCards.length === 0
                        ? '#ffffff'
                        : handTradeCost - shopTradeCost >= 0
                          ? '#4ead35'
                          : '#bb2424'
                  }}
                >
                  <GiPriceTag />
                  <span>{handTradeCost - shopTradeCost}</span>
                </div>
                différentiel
              </div>
            </>
          )}
        </div>
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
        <div
          className={`window left tutorial-shop ${tutorialStep === 18 ? '' : 'hidden'}`}
          style={{ zIndex: stepsConfig[tutorialStep - 1]?.zindex?.includes('shop') ? 12 : 1 }}
        >
          <div className="shop-list">
            {shopCard.map((card) => (
              <div
                key={card.name}
                className={`shop-item ${selectedShopCards.some((selectedCard) => selectedCard.name === card.name) ? 'selected' : ''}`}
                onClick={() => handleShopItemClick(card)}
                onMouseEnter={() => {
                  hover()
                  setDetailCard(card)
                }}
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
      <img className={`gameContainer-bg`} src={BabelfestBackground} alt={'background du menu'} />
      <TutorialText
        onClickNext={handleTextClick}
        clickable={stepsConfig[tutorialStep - 1].clickable}
        image={stepsConfig[tutorialStep - 1].img}
      >
        {stepsConfig[tutorialStep - 1].text}
      </TutorialText>
      {tutorialWin && <div className="tutorial-win fade-in"></div>}

      {stepsConfig[tutorialStep - 1].modal && <ClassicModal></ClassicModal>}

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
