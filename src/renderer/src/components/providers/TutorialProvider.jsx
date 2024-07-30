import { createContext, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AuthContext } from '../../AuthContext'
import { db } from '../../Firebase'
import { doc, onSnapshot, query, collection, orderBy } from 'firebase/firestore'
import Room from '../pages/Room'
import { DefinePhaseRule } from '../controllers/PhaseController'
import { useTradeCard } from '../effects/editCards'
import LogoAnimate from '../../assets/svg/logo_babelfest_animated.svg'
import TutorialRoom from '../pages/TutorialRoom'

export const TutorialContext = createContext(null)
export const TutorialProvider = () => {
  // const { room } = useParams()
  const { user, userInfo } = useContext(AuthContext)
  // // Données Globales
  // const [gameData, setGameData] = useState(null)
  const [rival, setRival] = useState({
    primaryColor: '#E59B13'
  })
  const [hand, setHand] = useState([
    {
      name: 'Compteuse à trois cordes',
      title: 'Épopée du guerrier et Fable du mage',
      atk: 1,
      dep: 2,
      hp: 4,
      baseatk: 1,
      basedep: 2,
      basehp: 4,
      url: './cards/origine/babelfest_origine4.png',
      rarity: 1,
      collection: 'Origine',
      year: 2023,
      author: 'Bobbyjack',
      effects: [
        {
          when: ['attack'],
          type: 'swapStats'
        }
      ]
    },
    {
      name: 'Phoebe',
      title: 'Acrobate',
      atk: 2,
      dep: 4,
      hp: 2,
      baseatk: 2,
      basedep: 4,
      basehp: 2,
      url: './cards/origine/babelfest_origine25.png',
      rarity: 1,
      collection: 'Origine',
      year: 2023,
      author: 'Nymphyart'
    },
    {
      name: 'Le démon des jeux-vidéo',
      title: 'Sous pression',
      atk: 4,
      dep: 1,
      hp: 1,
      baseatk: 4,
      basedep: 1,
      basehp: 1,
      url: './cards/origine/babelfest_origine26.png',
      rarity: 2,
      collection: 'Origine',
      year: 2023,
      author: 'Child',
      effects: [
        {
          when: ['spawn'],
          type: 'freeze',
          value: 2,
          amount: 1,
          target: 'rival',
          spawnUsed: false,
          choice: 'target'
        }
      ]
    }
  ])
  const [rivalHand, setRivalHand] = useState([
    {
      name: 'Dai',
      title: "Rockstar dans l'âme",
      atk: 3,
      dep: 1,
      hp: 2,
      baseatk: 3,
      basedep: 1,
      basehp: 2,
      url: './cards/origine/babelfest_origine34.png',
      rarity: 2,
      collection: 'Origine',
      year: 2023,
      author: 'Lyzeur',
      reach: 1,
      effects: [
        {
          type: 'moreReach'
        }
      ]
    },
    {
      name: 'Tuto',
      title: 'Soutien psychologique',
      atk: 1,
      dep: 3,
      hp: 1,
      baseatk: 1,
      basedep: 3,
      basehp: 1,
      ghost: true,
      recto: false,
      url: './cards/origine/babelfest_origine3.png',
      rarity: 1,
      collection: 'Origine',
      year: 2023,
      author: 'Kiba',
      effects: [
        {
          when: [3],
          type: 'atkBuff',
          value: 1,
          target: 'ally'
        },
        {
          type: 'ghost'
        }
      ]
    }
  ])
  const [placementCostLeft, setPlacementCostLeft] = useState(4)
  const [movesCostLeft, setMovesCostLeft] = useState(4)
  const [turn, setTurn] = useState(1)
  const [detailCard, setDetailCard] = useState(null)
  const [phase, setPhase] = useState(0)
  const [shopCard, setShopCard] = useState([
    {
      name: 'Gladys Goldtrog',
      title: 'Maîtresse suprême de la magie',
      atk: 3,
      dep: 2,
      hp: 3,
      baseatk: 3,
      basedep: 2,
      basehp: 3,
      url: './cards/renfort/babelfest_renfort4.png',
      rarity: 1,
      collection: 'Renfort',
      year: 2024,
      author: 'Tortiliowius',
      effects: [
        {
          when: [2],
          type: 'depBuff',
          value: 1,
          target: 'ally'
        }
      ]
    },
    {
      name: 'Zéro',
      title: 'Unique gantelé de la foudre',
      atk: 4,
      dep: 4,
      hp: 3,
      baseatk: 4,
      basedep: 4,
      basehp: 3,
      url: './cards/mecanica/babelfest_mecanica6.png',
      rarity: 2,
      collection: 'Mécanica',
      year: 2024,
      author: 'Stain',
      effects: [
        {
          when: ['cardDeath'],
          byme: true,
          type: 'flame',
          alreadyUsed: false
        }
      ]
    },
    {
      name: 'Agent Cobalt',
      title: "Soldat cyborg d'Atomos",
      atk: 3,
      dep: 3,
      hp: 5,
      baseatk: 3,
      basedep: 3,
      basehp: 5,
      url: './cards/mecanica/babelfest_mecanica7.png',
      rarity: 2,
      collection: 'Mécanica',
      year: 2024,
      author: 'Erzack',
      deathCounter: 3,
      effects: [
        {
          when: [1],
          type: 'deathCounter'
        },
        {
          when: ['spawn'],
          type: 'processorRival',
          target: 'rival',
          value: 1,
          spawnUsed: false
        }
      ]
    },
    {
      name: 'Bebot',
      title: 'Musicien Mécanique',
      atk: 2,
      dep: 2,
      hp: 4,
      baseatk: 2,
      basedep: 2,
      basehp: 4,
      url: './cards/mecanica/babelfest_mecanica8.png',
      rarity: 2,
      collection: 'Mécanica',
      year: 2024,
      author: 'ZeCailloux',
      effects: [
        {
          when: ['spawn'],
          type: 'grapple',
          target: 'any',
          spawnUsed: false,
          choice: 'target'
        }
      ]
    },
    {
      name: 'Kitsubot F-450',
      title: 'Désoudeur espiègle',
      atk: 3,
      dep: 4,
      hp: 5,
      baseatk: 3,
      basedep: 4,
      basehp: 5,
      url: './cards/mecanica/babelfest_mecanica9.png',
      rarity: 3,
      collection: 'Mécanica',
      year: 2024,
      author: 'Helyaus',
      shiny: 'metal',
      attackCount: 2,
      baseAttackCount: 2,
      effects: [
        {
          when: ['cardDeath'],
          byme: true,
          type: 'flame',
          alreadyUsed: false
        },
        {
          type: 'doubleSword'
        }
      ]
    },
    {
      name: 'Clémerde',
      title: 'Artiste en herbe',
      atk: 2,
      dep: 4,
      hp: 3,
      baseatk: 2,
      basedep: 4,
      basehp: 3,
      url: './cards/babelfish/babelfest_babelfish1.png',
      rarity: 4,
      shiny: 'gold',
      collection: 'Babelfish',
      year: 2024,
      author: 'Cielesis',
      effects: [
        {
          when: ['spawn'],
          type: 'metamorphSummon',
          target: 'any',
          spawnUsed: false,
          choice: 'target',
          amount: 1,
          cards: [{ name: 'Création', title: "Chef d'oeuvre de Clémerde" }]
        }
      ]
    }
  ])

  function generateLocalArena(cellsToRemove, bases) {
    const amount = 32

    const getCoordinates = (index) => {
      const rowLetters = ['A', 'B', 'C', 'D']
      const rows = rowLetters.length
      const col = Math.floor(index / rows) + 1
      const row = rowLetters[index % rows]
      return `${row}${col}`
    }

    return Array.from({ length: amount }).map((_, index) => {
      const side = index < amount / 2 ? 1 : 2
      return {
        id: index,
        coordinate: getCoordinates(index),
        exist: !cellsToRemove.includes(index),
        side: side,
        card: null,
        base: index === bases[0] || index === bases[1],
        owner: null
      }
    })
  }

  const cellsToRemove = [31, 27, 28, 24, 0, 4, 3, 7]
  const bases = [2, 29]

  const [pattern, setPattern] = useState(generateLocalArena(cellsToRemove, bases))

  let propsList = {
    placementCostLeft,
    hand,
    rival,
    rivalHand,
    turn,
    pattern,
    detailCard,
    phase,
    movesCostLeft,
    setPlacementCostLeft,
    setPhase,
    setPattern,
    setHand,
    setRivalHand,
    setDetailCard,
    setTurn,
    setMovesCostLeft,
    shopCard,
    setShopCard
  }
  return (
    <TutorialContext.Provider value={propsList}>
      <TutorialRoom />
    </TutorialContext.Provider>
  )
}
