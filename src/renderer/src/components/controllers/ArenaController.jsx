import { useContext, useEffect, useRef, useState } from 'react'
import { GlobalContext } from '../providers/GlobalProvider'
import {
  useTryAttack,
  useGetAdjacentsCells,
  useMoveCardOnArena,
  usePlacementHalfMap,
  usePlaceCardOnArea,
  useTrySpawn
} from './ActionsController'
import { useTryEffect } from './EffectsController'
import { defineWinner } from '../others/toolBox'
import { useEndTurn } from './PhaseController'
import useSound from 'use-sound'

import { AuthContext } from '../../AuthContext'

export function ArenaController() {
  const {
    selectedCards,
    selectedCells,
    host,
    movesLeft,
    playerSelf,
    playerRival,
    phase,
    room,
    pattern,
    setGreenCells,
    myTurn,
    firstToPlay,
    phaseEffects,
    placementCostLeft,
    setPhaseEffects,
    standby,
    playerID,
    setLeftWindow,
    setMusicPlayer,
    processDeath
  } = useContext(GlobalContext)

  const placementHalfMap = usePlacementHalfMap()
  const getAdjacentCells = useGetAdjacentsCells()
  const tryEffect = useTryEffect()
  const trySpawn = useTrySpawn()
  const EndTurn = useEndTurn()

  // playerSelf.handle card selection changes
  useEffect(() => {
    if (selectedCards.length !== 0 || selectedCells.length !== 0) {
      proposeMove(phase)
    } else {
      setGreenCells([])
    }
  }, [selectedCards, selectedCells, phase])

  useEffect(() => {
    if (!host) return

    // Fonction pour gérer la victoire avec délai et autres actions avant de définir le gagnant
    const handleVictory = (winner) => {
      defineWinner(room, winner) // Appeler defineWinner après 1 seconde
    }

    // Vérifier si un joueur peut gagner par capture de base
    let bases = pattern.filter((cell) => cell.base)
    for (let base of bases) {
      if (base.card !== null && base.owner !== base.side) {
        handleVictory(base.owner) // Gagnant par capture de base
        return
      }
    }

    // Vérifier si un joueur peut gagner par épuisement de cartes
    const J1cardsOnTheArena = pattern.filter(
      (cell) => cell.card !== null && cell.owner === 1
    ).length
    const J2cardsOnTheArena = pattern.filter(
      (cell) => cell.card !== null && cell.owner === 2
    ).length

    if (playerSelf.hand.length === 0 && J1cardsOnTheArena === 0) {
      handleVictory(2) // J1 a perdu
    } else if (playerRival.hand.length === 0 && J2cardsOnTheArena === 0) {
      handleVictory(1) // J2 a perdu
    }
  }, [pattern, playerSelf.hand, playerRival.hand, room, host, phase])

  useEffect(() => {
    if (phase === 4) {
      setLeftWindow('shop')
      setMusicPlayer(false)
    }
    if (
      !phaseEffects &&
      phase != 0 &&
      standby[0] !== playerID &&
      standby !== false &&
      standby[1] !== false &&
      phase !== phaseEffects
    ) {
      setPhaseEffects(phase)
    }
  }, [phase, standby])

  useEffect(() => {
    if (phaseEffects === phase && phase !== 0) {
      ;(async () => {
        await tryEffect(phase, undefined, undefined, undefined, true)
        if (
          playerSelf.hand.length === 0 &&
          (phase === 1 || phase === 4) &&
          myTurn &&
          playerID === firstToPlay
        ) {
          EndTurn(true)
          console.log('mettre fin à son tour en premier joueur')
        }
      })()
    }
  }, [phaseEffects])

  useEffect(() => {
    if (
      !phaseEffects &&
      myTurn &&
      playerID !== firstToPlay &&
      playerSelf.hand.length === 0 &&
      (phase === 1 || phase === 4)
    ) {
      ;(async () => {
        EndTurn(true)
        console.log('mettre fin à son tour en deuxième joueur')
      })()
    }
  }, [myTurn, phaseEffects])

  useEffect(() => {
    if (!processDeath) {
      console.log('trySpawn special')
      ;(async () => {
        await trySpawn()
      })()
    }
  }, [pattern, processDeath])

  // Propose action or movement based on the current game phase
  function proposeMove(phase) {
    switch (phase) {
      case 1:
        if (selectedCards.length !== 0) {
          placementHalfMap()
        }
        break
      case 2:
        if (selectedCells[0]?.card) {
          const distanceMaxCarte = selectedCells[0].card.dep
          const distanceMaxRestanteJoueur = movesLeft
          // Calcul de maxDistance en fonction des variables ci-dessus
          const maxDistance = Math.min(distanceMaxCarte, distanceMaxRestanteJoueur)
          // Commencer l'exploration depuis la position du pion sélectionné
          getAdjacentCells(selectedCells[0].id, maxDistance, false, setGreenCells, pattern, false)
        }
        break
      case 3:
        if (selectedCells[0]?.card) {
          let diag = selectedCells[0]?.card.reach ? true : false
          getAdjacentCells(selectedCells[0].id, 1, true, setGreenCells, pattern, diag)
        }
        break
      default:
        break
    }
  }
}

export const useHandleClickOnArena = () => {
  const { setAskForRectoVerso, pattern, selectedCells, selectedCards, askForCell, askForTarget } =
    useContext(GlobalContext)
  const moveCardOnArena = useMoveCardOnArena()
  const tryAttack = useTryAttack()

  function handleAskForRectoVerso(cellID) {
    setAskForRectoVerso(cellID)
  }

  const phaseActions = {
    1: handleAskForRectoVerso,
    2: moveCardOnArena,
    3: tryAttack
  }

  return (cellID, type, specialAction = null, switchAlly = false) => {
    if (specialAction) {
      specialAction()
    } else {
      const action = phaseActions[type]
      if (action && type === 3) {
        action(selectedCells[0].id, cellID)
      } else if (action && type === 2) {
        action(cellID, selectedCells[0], switchAlly ? switchAlly : false)
      } else if (action) {
        action(cellID)
      }
    }
  }
}
