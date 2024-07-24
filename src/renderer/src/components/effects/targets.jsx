export function getAdjacentCells(originCell, type, pattern) {
  // Déterminer la ligne et la colonne de la cellule
  const col = Math.floor(originCell.id / 4) // 4 colonnes par ligne
  const row = originCell.id % 4

  // IDs à vérifier autour de originCell, ajustés pour les bords
  let checkIds = []
  if (col > 0) checkIds.push(originCell.id - 4) // Gauche
  if (col < 7) checkIds.push(originCell.id + 4) // Droite
  if (row > 0) checkIds.push(originCell.id - 1) // Haut
  if (row < 3) checkIds.push(originCell.id + 1) // Bas

  // S'assurer que les cellules sur les bords gauche et droit ne considèrent pas les cellules de l'autre côté
  if (row === 0) {
    // Bords gauche
    checkIds = checkIds.filter((id) => id !== originCell.id - 1)
  }
  if (row === 3) {
    // Bords droit
    checkIds = checkIds.filter((id) => id !== originCell.id + 1)
  }

  // Filtrer les cells en fonction du type
  return pattern.filter((cell) => {
    // Vérifier si l'ID de la cell est dans les IDs à vérifier
    if (!checkIds.includes(cell.id) || cell.card === null) return false

    // Comparaison en fonction du type
    switch (type) {
      case 'ally':
        return cell.owner === originCell.owner
      case 'rival':
        return cell.owner !== originCell.owner && cell.owner != null
      case 'any':
        return cell.owner !== null
      default:
        return false
    }
  })
}

export function getAllCardsOnArena(originCell, type, pattern, onBase = true) {
  // Filtrer les cells en fonction du type
  return pattern.filter((cell) => {
    if (cell.id === originCell.id || cell.card == null) return false
    if (!onBase && cell.base) return false
    // Comparaison en fonction du type
    switch (type) {
      case 'ally':
        return cell.owner === originCell.owner
      case 'rival':
        return cell.owner !== originCell.owner && cell.owner != null
      case 'any':
        return cell.owner !== null
      default:
        return false
    }
  })
}

export function getClosestEmptyCells(startId, numCellsNeeded, pattern) {
  if (numCellsNeeded <= 0) return []

  const visited = new Array(pattern.length).fill(false)
  const queue = [{ id: startId, distance: 0 }]
  const closestEmptyCells = []

  while (queue.length > 0) {
    const current = queue.shift()
    const row = Math.floor(current.id / 4)
    const col = current.id % 4

    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0]
    ]

    for (const [dx, dy] of directions) {
      const newRow = row + dx
      const newCol = col + dy
      const newId = newRow * 4 + newCol

      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 4 && !visited[newId]) {
        visited[newId] = true
        const adjacentCell = pattern.find((cell) => cell.id === newId)

        if (!adjacentCell.exist) continue // Ignorer les cellules avec exist = false

        if (adjacentCell.card === null && closestEmptyCells.length < numCellsNeeded) {
          closestEmptyCells.push(adjacentCell)
        }

        queue.push({ id: newId, distance: current.distance + 1 })
      }
    }

    if (closestEmptyCells.length === numCellsNeeded) {
      break // Sort de la boucle si le nombre requis de cellules vides est atteint
    }
  }

  return closestEmptyCells
}
