import { useContext } from 'react'
import { GlobalContext } from '../providers/GlobalProvider'
import { db } from '../../Firebase'
import { setDoc, doc, updateDoc, writeBatch } from 'firebase/firestore'
import { usePushLogsIntoBatch } from './LogsController'
// Gérer toute les règles de controle autorisé pendant une phase précise
// maxSelectableCardInHand : Nombre de carte selectionnable pendant la phase
export function DefinePhaseRule(phase, cardPerHand) {
  let maxSelectableCardInHand = 0
  let maxSelectableCardInArena = 0
  let maxSelectableCardInShop = 0
  let rules = []
  switch (phase) {
    case 0:
      maxSelectableCardInHand = Math.round(cardPerHand * 0.4)
      break
    case 1:
      maxSelectableCardInHand = 1
      break
    case 2:
      maxSelectableCardInArena = 1
      break
    case 3:
      maxSelectableCardInArena = 1
      break
    case 4:
      maxSelectableCardInHand = 20
      maxSelectableCardInShop = 20
      break
  }
  rules.push(maxSelectableCardInHand, maxSelectableCardInArena, maxSelectableCardInShop)
  return rules
}

export function SendCardsToPlayer(selectedCards, room, host) {
  const docName = host ? 'forJ2' : 'forJ1'
  setDoc(doc(db, `games/${room}/tradePhase`, docName), {
    cards: selectedCards
  })
}

const PLAYER_ONE = 1
const PLAYER_TWO = 2
const ATTACK_PHASE = 3
const FINAL_PHASE = 4

export const useEndTurn = () => {
  const {
    gameData,
    myTurn,
    setRivalEndedAttack,
    setGreenCells,
    setSelectedCards,
    setSelectedCells,
    setSelectedShopCards,
    setConfirmModal,
    firstToPlay,
    setPlacementCostLeft,
    setMovesLeft,
    pattern,
    playerID,
    phase,
    room,
    turn,
    playerRival
  } = useContext(GlobalContext)
  const pushLogsIntoBatch = usePushLogsIntoBatch()

  const playerRivalID = playerID === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE

  const isFirstToPlay = playerID === firstToPlay

  function switchActivePlayer() {
    return playerID === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE
  }

  async function EndTurn(nextPhase = true) {
    const updates = {}
    const batch = writeBatch(db)

    console.log('EndTurn called, nextPhase:', nextPhase)

    if (phase === 1) {
      if (isFirstToPlay) {
        // PlayerID == firstToPlay
        if (playerRival.hand.length === 0) {
          // Opponent's hand is empty
          console.log('Opponent hand is empty, moving to phase 2 without changing activePlayer')
          updates.phase = 2
          // Do not change activePlayer
        } else {
          // Opponent's hand is not empty
          console.log('Switching activePlayer in phase 1')
          updates.activePlayer = switchActivePlayer()
        }
      } else {
        // PlayerID != firstToPlay
        console.log('Moving to phase 2 and switching activePlayer')
        updates.phase = 2
        updates.activePlayer = switchActivePlayer()
      }
    } else if (phase === 2) {
      if (isFirstToPlay) {
        // PlayerID == firstToPlay
        console.log('Switching activePlayer in phase 2')
        updates.activePlayer = switchActivePlayer()
      } else {
        // PlayerID != firstToPlay
        console.log('Switching activePlayer and moving to phase 3')
        updates.activePlayer = switchActivePlayer()
        updates.phase = ATTACK_PHASE // Phase 3
      }
    } else if (phase === ATTACK_PHASE) {
      // Phase 3: Integrate all functionalities as before
      console.log('Handling attack phase logic')
      if (nextPhase) {
        updates.phase = gameData.playerAttackEnded ? FINAL_PHASE : phase

        if (gameData.playerAttackEnded) {
          console.log(
            'The other player has already ended their attack phase, moving to final phase'
          )
          updates.playerAttackEnded = null
          updates.activePlayer = firstToPlay
          updates.standby = [playerRivalID, true]
        } else {
          console.log("The other player hasn't ended attack phase yet")
          endingAttackTurnFirst(room, playerID)
          updates.activePlayer = switchActivePlayer()
        }
      } else if (gameData.playerAttackEnded) {
        console.log('The other player has already ended, keeping activePlayer as current player')
        updates.activePlayer = playerID
      } else updates.activePlayer = switchActivePlayer()
    } else if (phase === FINAL_PHASE) {
      if (isFirstToPlay) {
        // PlayerID == firstToPlay
        if (playerRival.hand.length === 0) {
          // Opponent's hand is empty
          console.log(
            'Opponent hand is empty, incrementing turn, moving to phase 1, switching firstToPlay and activePlayer'
          )
          updates.turn = turn + 1
          updates.phase = 1
          updates.FirstToPlay = playerRivalID
          updates.activePlayer = switchActivePlayer()

          // Reset cards in the arena
          resetArenaCards(batch, pattern, room)
        } else {
          // Opponent's hand is not empty
          console.log('Switching activePlayer in final phase')
          updates.activePlayer = switchActivePlayer()
        }
      } else {
        // PlayerID != firstToPlay
        console.log(
          'Incrementing turn, moving to phase 1, switching firstToPlay, keeping activePlayer as is'
        )
        updates.turn = turn + 1
        updates.phase = 1
        updates.FirstToPlay = playerID

        // Reset cards in the arena
        resetArenaCards(batch, pattern, room)
      }
    }

    // Set default per-phase variables
    if (updates.phase === 1) {
      setPlacementCostLeft(4)
    }
    if (updates.phase === 2) {
      setMovesLeft(4)
    }

    if (setRivalEndedAttack) {
      setRivalEndedAttack(false)
    }

    // Log the changes
    await pushLogsIntoBatch(
      batch,
      {
        turn: updates.turn ? updates.turn : turn,
        phase: updates.phase ? updates.phase : phase
      },
      updates.activePlayer !== undefined ? updates.activePlayer : gameData.activePlayer
    )

    // Update the game data
    batch.update(doc(db, 'games', room), updates)
    await batch.commit()

    setGreenCells([])
    setSelectedCards([])
    setSelectedShopCards([])
    setSelectedCells([])
    setConfirmModal(null)
  }

  return EndTurn
}

function endingAttackTurnFirst(room, playerID) {
  updateDoc(doc(db, 'games', room), {
    playerAttackEnded: playerID
  })
}

function resetArenaCards(batch, pattern, room) {
  pattern.forEach((cell) => {
    if (!cell.card) return

    const arenaColRef = doc(batch._firestore, `games/${room}/arena`, `cell-${cell.id}`)
    let shouldUpdate = false

    ;['atk', 'dep', 'attackCount'].forEach((attr) => {
      if (cell.card[attr] !== cell.card[`base${attr}`]) {
        cell.card[attr] = cell.card[`base${attr}`]
        shouldUpdate = true
      }
    })
    ;['def', 'movedThisTurn', 'attackedThisTurn', 'affected', 'broken'].forEach((prop) => {
      if (cell.card[prop] != null) {
        delete cell.card[prop]
        shouldUpdate = true
      }
    })
    if (cell.card.effects) {
      cell.card.effects.forEach((effect) => {
        if (effect.usedThisTurn) {
          delete effect.usedThisTurn
        }
      })
      shouldUpdate = true
    }

    if (cell.card.freeze) {
      cell.card.freeze -= 1
      if (cell.card.freeze <= 0) {
        delete cell.card.freeze
      }
      shouldUpdate = true
    }

    if (shouldUpdate) {
      batch.update(arenaColRef, { card: cell.card })
    }
  })
}
