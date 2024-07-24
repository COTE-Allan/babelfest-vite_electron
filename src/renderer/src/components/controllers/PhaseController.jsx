import { useContext } from 'react'
import { GlobalContext } from '../providers/GlobalProvider'
import { db } from '../../Firebase'
import { setDoc, doc, updateDoc, writeBatch } from 'firebase/firestore'
import { goingStandby } from '../others/standbySystem'
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
      maxSelectableCardInHand = 1
      maxSelectableCardInShop = 1
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
    host,
    turnOrder,
    rivalEndedAttack,
    setRivalEndedAttack,
    setGreenCells,
    setSelectedCards,
    setSelectedCells,
    setSelectedShopCard,
    firstToPlay,
    setPlacementCostLeft,
    setMovesLeft,
    pattern,
    playerID,
    phase,
    room,
    turn
  } = useContext(GlobalContext)
  const pushLogsIntoBatch = usePushLogsIntoBatch()

  function switchActivePlayer() {
    return host ? PLAYER_TWO : PLAYER_ONE
  }

  async function EndTurn(nextPhase = true) {
    const updates = {}
    const batch = writeBatch(db)

    if (myTurn) {
      updates.activePlayer = switchActivePlayer()
    }

    if (phase === ATTACK_PHASE) {
      if (nextPhase) {
        updates.phase =
          gameData.playerAttackEnded && gameData.playerAttackEnded !== null ? FINAL_PHASE : phase

        if (gameData.playerAttackEnded && gameData.playerAttackEnded !== null) {
          console.log("l'autre joueur à déjà terminé sa phase, on passe en phase 4")
          updates.playerAttackEnded = null
          updates.activePlayer = firstToPlay
          updates.standby = [firstToPlay === 1 ? 2 : 1, true]
        } else {
          console.log("l'autre joueur n'a pas terminé, il joue encore")
          endingAttackTurnFirst(room, turnOrder)
        }
      } else if (gameData.playerAttackEnded && gameData.playerAttackEnded !== null) {
        console.log("l'autre joueur à déjà terminé, je garde la main")
        updates.activePlayer = host ? PLAYER_ONE : PLAYER_TWO
      }
    } else if (turnOrder === PLAYER_TWO && nextPhase) {
      updates.phase = phase + 1
      updates.standby = [playerID, true]
    }

    if (phase === FINAL_PHASE && nextPhase) {
      if (turnOrder === PLAYER_TWO) {
        updates.FirstToPlay = firstToPlay === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE
        updates.activePlayer = updates.FirstToPlay
        updates.standby = [firstToPlay === PLAYER_ONE ? PLAYER_ONE : PLAYER_TWO, true]

        updates.phase = 1

        pattern.forEach((cell) => {
          if (!cell.card) return

          const arenaColRef = doc(db, `games/${room}/arena`, `cell-${cell.id}`)
          let shouldUpdate = false

          ;['atk', 'dep'].forEach((attr) => {
            if (cell.card[attr] !== cell.card[`base${attr}`]) {
              cell.card[attr] = cell.card[`base${attr}`]
              shouldUpdate = true
            }
          })
          ;['def', 'movedThisTurn', 'attackedThisTurn', 'affected'].forEach((prop) => {
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
            cell.card.freeze = cell.card.freeze - 1
            if (cell.card.freeze <= 0) {
              delete cell.card.freeze
            }
            shouldUpdate = true
          }

          if (shouldUpdate) {
            batch.update(arenaColRef, { card: cell.card })
          }
        })

        updates.turn = turn + 1
      }
    }

    if (phase == 1) setPlacementCostLeft(4)
    if (phase == 2) setMovesLeft(4)

    if (rivalEndedAttack) {
      setRivalEndedAttack(false)
    }

    await pushLogsIntoBatch(
      batch,
      {
        turn: updates.turn ? updates.turn : turn,
        phase: updates.phase ? updates.phase : phase
      },
      updates.activePlayer
    )

    batch.update(doc(db, 'games', room), updates)
    batch.commit()
    setGreenCells([])
    setSelectedCards([])
    setSelectedShopCard([])
    setSelectedCells([])
  }

  return EndTurn
}

function endingAttackTurnFirst(room, turnOrder) {
  updateDoc(doc(db, 'games', room), {
    playerAttackEnded: turnOrder
  })
}
