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

  // playerSelf.handle card selection changes
  useEffect(() => {
    if (selectedCards.length !== 0 || selectedCells.length !== 0) {
      proposeMove(phase)
    } else {
      setGreenCells([])
    }
  }, [selectedCards, selectedCells, phase])

  useEffect(() => {
    if (!host || phase === 0) return
    //  vérifier si un joueur peut gagner
    // Victory by capturing bases
    let bases = pattern.filter((cell) => cell.base)
    bases.forEach((base) => {
      if (base.card !== null && base.owner !== base.side) {
        defineWinner(room, base.owner)
        return
      }
    })

    // Victory by depleting cards
    const J1cardsOnTheArena = pattern.filter((cell) => cell.card !== null && cell.owner == 1).length
    const J2cardsOnTheArena = pattern.filter((cell) => cell.card !== null && cell.owner == 2).length

    if (playerSelf.hand.length == 0 || playerRival.hand.length == 0) {
      if (J1cardsOnTheArena == 0) {
        defineWinner(room, 2)
      } else if (J2cardsOnTheArena == 0) {
        defineWinner(room, 1)
      }
    }
  }, [pattern, playerSelf.hand])

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
    if (phaseEffects == phase && phase != 0) {
      tryEffect(phase, undefined, undefined, undefined, true)
    }
  }, [phaseEffects])

  useEffect(() => {
    if (processDeath === null) {
      trySpawn()
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
      console.log(specialAction)
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
