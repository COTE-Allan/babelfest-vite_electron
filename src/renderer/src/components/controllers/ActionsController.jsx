import { useContext, useEffect, useState } from 'react'
import { GlobalContext } from '../providers/GlobalProvider'
import { doc, writeBatch } from 'firebase/firestore'
import { db } from '../../Firebase'
import { useEndTurn } from './PhaseController'
import { removeCardAndBatch } from '../effects/editCards'
import { useTryEffect } from './EffectsController'
import { getPattern } from '../others/toolBox'
import { usePushLogsIntoBatch, usePushSceneIntoBatch } from './LogsController'
import { getEffectInfo } from '../effects/basics'
import { AuthContext } from '../../AuthContext'

// ================================================================
// TYPES DE PLACEMENTS ============================================
// ================================================================
// Propose to place on your half on the map
export const usePlacementHalfMap = () => {
  const { host, pattern, setGreenCells } = useContext(GlobalContext)
  // Show cells available for card placement
  function placementHalfMap() {
    const team = host ? 1 : 2
    const availableCells = pattern.filter((cell) => cell.side === team && !cell.card)
    setGreenCells(availableCells)
  }
  return placementHalfMap
}
// Obtenir les cases accessibles ou les cartes accessibles
export const useGetAdjacentsCells = () => {
  const { selectedCells, phase, movesLeft } = useContext(GlobalContext)

  function getAdjacentCells(id, maxDistance, onlyWithCards = false, setGreenCells, pattern, diag) {
    if (selectedCells[0].card.atk <= 0 && phase === 3) return

    const ghostType = selectedCells[0].card.ghost || selectedCells[0].card.diving
    const startingCellOwner = selectedCells[0].owner // Supposition d'un propriétaire pour la cellule de départ

    const visited = new Array(32).fill(false)
    const queue = [{ id, distance: 0 }]
    const adjacentCells = []

    // Directions cardinales
    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0]
    ]

    // Ajout de directions diagonales si nécessaire
    if (diag) {
      directions.push([1, 1], [1, -1], [-1, 1], [-1, -1])
    }

    while (queue.length > 0) {
      const current = queue.shift()

      if (current.distance < maxDistance) {
        const row = Math.floor(current.id / 4)
        const col = current.id % 4

        for (const [dx, dy] of directions) {
          const newRow = row + dx
          const newCol = col + dy
          const newId = newRow * 4 + newCol

          if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 4 && !visited[newId]) {
            const adjacentCell = pattern.find((cell) => cell.id === newId)
            if (adjacentCell && adjacentCell.exist) {
              const isSameOwner = adjacentCell.owner === startingCellOwner // Vérifie si les propriétaires sont les mêmes

              // Condition mise à jour pour phase 2 et vérification des propriétaires
              const conditionToPush =
                phase === 2 &&
                current.distance == 0 &&
                adjacentCell.card !== null &&
                isSameOwner &&
                movesLeft >= 2 &&
                !adjacentCell.card.movedThisTurn &&
                !adjacentCell.card.freeze
                  ? true
                  : onlyWithCards
                    ? adjacentCell.card !== null && !adjacentCell.card.diving
                    : adjacentCell.card === null

              if (conditionToPush && id != adjacentCell.id) {
                visited[newId] = true
                adjacentCells.push(adjacentCell)
              }

              if (ghostType || adjacentCell.card === null || (onlyWithCards && maxDistance > 1)) {
                queue.push({ id: newId, distance: current.distance + 1 })
              }
            }
          }
        }
      }
    }

    setGreenCells(adjacentCells)
  }

  return getAdjacentCells
}

// ================================================================
// ACTIONS DE PHASES ==============================================
// ================================================================
// Invoquer
export const usePlaceCardOnArea = () => {
  const {
    host,
    selectedCards,
    gameData,
    setSelectedCards,
    playerSelf,
    placementCostLeft,
    activePlayer,
    setConfirmModal,
    pattern,
    room,
    playerID,
    redrawUsed,
    setRedrawUsed
  } = useContext(GlobalContext)

  const EndTurn = useEndTurn()
  const [batchCommit, setBatchCommit] = useState(false)
  const pushLogsIntoBatch = usePushLogsIntoBatch()
  const pushSceneIntoBatch = usePushSceneIntoBatch()
  const { giveAchievement } = useContext(AuthContext)

  async function placeCardOnArena(cellID, isRecto = true) {
    let cardToPlace = selectedCards[0]

    if (placementCostLeft - cardToPlace.rarity < 0) return
    if (!redrawUsed) setRedrawUsed(true)
    const targetHand = host ? 'handJ1' : 'handJ2'
    const targetPlayer = host ? 'player1.placementLeft' : 'player2.placementLeft'

    cardToPlace.isRecto = isRecto
    cardToPlace.owner = { name: playerSelf.username, hex: playerSelf.skin.primaryColor.hex }

    const batch = writeBatch(db)

    const arenaDocRef = doc(db, `games/${room}/arena`, `cell-${cellID}`)
    batch.update(arenaDocRef, {
      card: cardToPlace,
      owner: activePlayer
    })

    const newHand = playerSelf.hand.filter((card) => card !== cardToPlace)
    const gameDocRef = doc(db, 'games', room)
    batch.update(gameDocRef, {
      [targetHand]: newHand,
      [targetPlayer]: placementCostLeft - cardToPlace.rarity
    })

    const cell = pattern.find((cell) => cell.id === cellID)
    await pushLogsIntoBatch(batch, {
      trigger: cardToPlace,
      action: 'summon',
      to: cell.coordinate
    })
    await pushSceneIntoBatch(batch, {
      cards: [cardToPlace],
      action: `Invocation en ${cell.coordinate}`
    })

    if (cardToPlace.name === 'Krone' && cardToPlace.title === 'Intruse cosmique') {
      // Compter le nombre de cellules qui contiennent une carte valide
      const filledCellsCount = pattern.filter((cell) => cell.card).length

      if (filledCellsCount >= 10) {
        await giveAchievement('HF_kroneChaos')
      }
    }

    batch
      .commit()
      .then(async () => {
        setBatchCommit([cardToPlace.id, cellID])
      })
      .catch((error) => {
        console.error('Error writing batch', error)
      })
  }

  const trySpawn = useTrySpawn()
  useEffect(() => {
    if (batchCommit) {
      const asyncUseEffect = async () => {
        setSelectedCards([])
        setConfirmModal(null)
        setBatchCommit(false)
        if (placementCostLeft == 0) {
          EndTurn()
        }
      }
      asyncUseEffect()
    }
  }, [batchCommit, pattern])

  return placeCardOnArena
}

// Attaquer
export const useTryAttack = () => {
  const { pattern, room, playerID } = useContext(GlobalContext)
  const { giveAchievement } = useContext(AuthContext)
  const EndTurn = useEndTurn()
  const pushLogsIntoBatch = usePushLogsIntoBatch()
  const pushSceneIntoBatch = usePushSceneIntoBatch()
  const TryEffect = useTryEffect()
  async function tryAttack(attackerID, defenderID) {
    const cellAttacker = pattern.find((cell) => cell.id === attackerID)
    const attackerOwner = cellAttacker.owner
    const cardAttacker = cellAttacker.card
    const atkAttacker = cardAttacker.atk
    const cellTarget = pattern.find((cell) => cell.id === defenderID)
    const cardTarget = cellTarget.card
    const batch = writeBatch(db)
    const attackedCellRef = doc(db, `games/${room}/arena`, `cell-${defenderID}`)
    const attackerCellRef = doc(db, `games/${room}/arena`, `cell-${attackerID}`)
    let hpTarget = cardTarget.hp

    await TryEffect('attacked', { attacker: cellAttacker, target: cellTarget })

    if (cardAttacker.hp <= 0) {
      cardAttacker.dead = {
        cell: cellTarget.id,
        id: cardTarget.id,
        uniqueID: cardTarget.uniqueID
      }
    }

    if (!cardAttacker.isRecto) {
      cardAttacker.isRecto = true
      const attackerCellRef = doc(db, `games/${room}/arena`, `cell-${attackerID}`)
      batch.update(attackerCellRef, {
        card: cardAttacker
      })
    }

    if (!cardTarget.isRecto) {
      cardTarget.isRecto = true
    }

    if (cardAttacker.healer) {
      var soinAvant = hpTarget
      if (hpTarget < cardTarget.basehp) {
        hpTarget += atkAttacker
        if (hpTarget > cardTarget.basehp) {
          hpTarget = cardTarget.basehp
        }
      }
      var soinEffectue = hpTarget - soinAvant

      cardTarget.hp = hpTarget // Mise à jour des points de vie

      if (atkAttacker >= 6) {
        await giveAchievement('HF_6heal')
      }

      await pushLogsIntoBatch(batch, {
        trigger: cardAttacker,
        action: 'heal',
        targets: [cardTarget],
        result: { icon: 'hp', value: `+ ${soinEffectue}` }
      })
      await pushSceneIntoBatch(batch, {
        cards: [cardAttacker, cardTarget],
        icon: 'heal',
        sound: 'heal',
        action: `${cardAttacker.name} soigne ${cardTarget.name}`,
        value: soinEffectue
      })

      // Mettre à jour la carte soignée dans la base de données
      batch.update(attackedCellRef, {
        card: cardTarget
      })
    } else {
      if (cardTarget.fortress && !cardAttacker.deathScythe) {
        // La carte possède forteresse
        delete cardTarget.fortress

        await pushLogsIntoBatch(batch, {
          trigger: cardAttacker,
          action: 'attack',
          targets: [cardTarget],
          result: {
            custom: true,
            icon: './effects/fortress.png',
            value: false
          }
        })
        await pushSceneIntoBatch(batch, {
          cards: [cardAttacker, cardTarget],
          icon: 'attack',
          sound: 'block',
          action: 'Forteresse',
          desc: 'Les premiers dégâts que cette carte subira seront annulés.'
        })
      } else {
        // Calculer les dégâts
        let damage
        if (cardTarget.broken) {
          damage = atkAttacker // Ignorer la défense et infliger des dégâts directement
        } else if (cardTarget.def && !cardAttacker.deathScythe) {
          if (atkAttacker >= cardTarget.def) {
            damage = atkAttacker - cardTarget.def
            delete cardTarget.def // Supprimer la défense car elle est brisée
          } else {
            cardTarget.def -= atkAttacker
            damage = 0
          }
        } else {
          damage = atkAttacker // Infliger des dégâts directement
        }

        // Vérifier si les dégâts sont égaux ou supérieurs à 15
        if (damage >= 11) {
          await giveAchievement('HF_11dmg')
        }

        // Appliquer les dégâts
        hpTarget = hpTarget - damage

        if (hpTarget <= 0) {
          cardTarget.dead = {
            cell: cellAttacker.id,
            id: cardAttacker.id,
            uniqueID: cardAttacker.uniqueID
          }
          if (
            cardAttacker.name === 'Blaire Witcher' &&
            cardAttacker.title === 'Démone sanglante' &&
            cellTarget.owner !== playerID
          ) {
            await giveAchievement('HF_blaireKill')
          }
          await pushLogsIntoBatch(batch, {
            trigger: cardAttacker,
            action: 'attack',
            targets: [cardTarget],
            result: { icon: 'death' }
          })
          await pushSceneIntoBatch(batch, {
            cards: [cardAttacker, cardTarget],
            icon: 'attack',
            sound: 'death',
            action: `${cardAttacker.name} élimine ${cardTarget.name}.`
          })
        } else {
          await pushLogsIntoBatch(batch, {
            trigger: cardAttacker,
            action: 'attack',
            targets: [cardTarget],
            result: { icon: 'hp', value: `- ${damage}` }
          })
          await pushSceneIntoBatch(batch, {
            cards: [cardAttacker, cardTarget],
            icon: 'attack',
            sound: 'attack',
            value: damage,
            action: `${cardAttacker.name} attaque ${cardTarget.name}.`
          })
        }
        cardTarget.hp = hpTarget
      }
    }

    if (cardAttacker.dieTogether) {
      cardAttacker.dead = {
        cell: cellAttacker.id,
        id: cardAttacker.id,
        uniqueID: cardAttacker.uniqueID
      }
      let effectInfos = getEffectInfo('dieTogether')
      await pushLogsIntoBatch(batch, {
        trigger: cardAttacker,
        action: 'effect',
        effectInfos: effectInfos,
        result: { icon: 'death' }
      })
      await pushSceneIntoBatch(batch, {
        cards: [cardAttacker],
        action: `Mourir ensemble`,
        desc: 'Quand cette carte attaque, elle meurt.'
      })
    }

    // Choisir si la carte pourra réattaquer ou pas.
    let attackCount = cardAttacker.attackCount
    if (attackCount) {
      attackCount = attackCount - 1
      cardAttacker.attackCount = attackCount
      if (attackCount <= 0) {
        cardAttacker.attackedThisTurn = true
        cardAttacker.attackCount = cardAttacker.baseattackCount
      }
    } else {
      cardAttacker.attackedThisTurn = true
    }

    // Mettre a jour l'attaquant et l'attaqué
    batch.update(attackedCellRef, {
      card: cardTarget
    })
    batch.update(attackerCellRef, {
      card: cardAttacker
    })

    // Exécutez le batch
    await batch.commit()
    await TryEffect('attack', { attacker: cellAttacker, target: cellTarget })

    let patternUpdated = await getPattern(room)
    if (!patternUpdated.some((cell) => cell.card && cell.card.dead)) {
      EndTurn(false)
    }
  }
  return tryAttack
}

// Déplacer
export const useMoveCardOnArena = () => {
  const { room, activePlayer, movesLeft, selectedCells, setSelectedCells, pattern, host } =
    useContext(GlobalContext)
  const EndTurn = useEndTurn()
  const pushLogsIntoBatch = usePushLogsIntoBatch()
  const pushSceneIntoBatch = usePushSceneIntoBatch()

  async function moveCardOnArena(cellID, originCell = selectedCells[0], switchAlly = false) {
    let card = originCell.card
    const newCellID = cellID
    const batch = writeBatch(db)

    const distance = calculateDistance(originCell.id, newCellID)

    card.isRecto = true
    card.movedThisTurn = true

    const newCell = pattern.find((cell) => cell.id === newCellID)

    // Check if the new cell has the burn attribute
    if (newCell.burn) {
      card.hp -= 1
      newCell.burn = false

      // Update the new cell in the database to remove the burn attribute
      const newCellRef = doc(db, `games/${room}/arena`, `cell-${newCellID}`)
      batch.update(newCellRef, {
        burn: false
      })

      // Log the burn effect, checking if the card is dead
      if (card.hp <= 0) {
        card.dead = {
          cell: originCell.id,
          id: card.id,
          uniqueID: card.uniqueID
        }
        await pushLogsIntoBatch(batch, {
          trigger: card,
          action: 'attack',
          targets: [card],
          result: { icon: 'death' }
        })
      } else {
        await pushLogsIntoBatch(batch, {
          trigger: card,
          action: 'attack',
          targets: [card],
          result: { icon: 'hp', value: `-1` }
        })
      }

      await pushSceneIntoBatch(batch, {
        cards: [card],
        action: `Surchauffe inflige 1 dégât.`
      })
    }

    // Supprimez l'ancienne cellule du joueur
    if (switchAlly) {
      const switchCellRef = doc(db, `games/${room}/arena`, `cell-${originCell.id}`)
      switchAlly.card.movedThisTurn = true
      switchAlly.card.isRecto = true
      batch.update(switchCellRef, {
        card: switchAlly.card,
        owner: switchAlly.owner
      })
      await pushLogsIntoBatch(batch, {
        trigger: card,
        action: 'switch',
        targets: [switchAlly.card]
      })
    } else {
      removeCardAndBatch(originCell.id, room, batch)
      await pushLogsIntoBatch(batch, {
        trigger: card,
        action: 'move',
        from: originCell.coordinate,
        to: newCell.coordinate
      })
    }

    // Ajoutez la nouvelle cellule du joueur
    const newCellRef = doc(db, `games/${room}/arena`, `cell-${newCellID}`)
    batch.update(newCellRef, {
      card: card,
      owner: activePlayer
    })

    const gameDocRef = doc(db, 'games', room)
    let newMovesLeft
    if (switchAlly) {
      newMovesLeft = movesLeft - 2
    } else {
      newMovesLeft = movesLeft - distance
    }
    const targetPlayer = host ? 'player1.movesLeft' : 'player2.movesLeft'
    batch.update(gameDocRef, {
      [targetPlayer]: newMovesLeft
    })

    try {
      // Exécutez le batch
      await batch.commit()
      // Réinitialisez les cellules sélectionnées
      setSelectedCells([])
      if (movesLeft - distance <= 0 || (switchAlly && movesLeft - 2 <= 0)) {
        EndTurn()
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des documents Firestore :', error)
    }
  }

  return moveCardOnArena
}

// ================================================================
// UTILITAIRES ==============================================
// ================================================================
const calculateDistance = (a, b) => {
  const coordsA = getCoords(a)
  const coordsB = getCoords(b)
  return Math.abs(coordsA.row - coordsB.row) + Math.abs(coordsA.col - coordsB.col)
}

const getCoords = (id) => {
  const col = 4 // Number of columns in the grid
  return {
    row: Math.floor(id / col),
    col: id % col
  }
}

export const useTrySpawn = () => {
  const tryEffect = useTryEffect()
  const { pattern, room } = useContext(GlobalContext)
  const [isSpawning, setIsSpawning] = useState(false)
  const [processedCells, setProcessedCells] = useState(new Set())

  const trySpawn = async () => {
    if (isSpawning) return
    setIsSpawning(true)

    try {
      let toProcess = pattern.filter((cell) =>
        cell.card?.effects?.some((effect) => effect.when?.includes('spawn') && !effect.spawnUsed)
      )

      const currentProcessedCells = new Set(processedCells)

      while (toProcess.length > 0) {
        const cell = toProcess.shift() // Take the first cell to process

        // Skip processing if the cell is already processed in this run

        console.log(`Processing spawn effects for cell ${cell.id}`)

        // Process the cell's spawn effects
        await processCellSpawn(cell)
        console.log('Finished processing spawn for cell', cell.id)

        // Fetch updated pattern to check for newly spawned cells
        let updatedPattern = await getPattern(room)
        const newSpawns = updatedPattern.filter(
          (newCell) =>
            newCell.card?.effects?.some(
              (effect) => effect.when?.includes('spawn') && !effect.spawnUsed
            ) && !currentProcessedCells.has(newCell.id)
        )

        // Append any new spawns to the end of the list to be processed
        toProcess.push(...newSpawns)
      }

      setProcessedCells(new Set()) // Reset processed cells after each run
    } catch (error) {
      console.error('Error during spawning process:', error)
    } finally {
      setIsSpawning(false)
    }
  }

  const processCellSpawn = async (cell) => {
    console.log(`Processing spawn effects for cell ${cell.id}`)

    // Initial spawn effects processing
    await tryEffect('spawn', [], [cell.card.id, cell.id])
    console.log('Finished initial tryEffect for spawn for cell', cell.id)

    // Mark initial spawn effects as processed
    cell.card.effects.forEach((effect) => {
      if (effect.when?.includes('spawn')) {
        effect.spawnUsed = true // Mark effect as used
      }
    })
  }

  return trySpawn
}
