export async function Surchauffe({ item, updatedDeadCell, effect, effectInfos }) {
  let target = updatedDeadCell

  target.burn = true

  console.log('result :', target)
  return {
    targets: [target],
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      result: {
        custom: true,
        icon: effectInfos.icon
      }
    },
    executor: item
  }
}

export async function Fireball({ item, targets, effect, effectInfos }) {
  if (!Array.isArray(targets) || targets.length === 0) {
    console.error('Aucune cible valide pour Fireball')
    return {
      cancel: true
    }
  }

  console.log('Fireball - Effet activé sur les cibles : ', targets)

  targets.forEach((cell) => {
    if (cell) {
      cell.burn = true // Marque la cellule comme "brûlée"
    } else {
      console.warn('Une cellule invalide a été trouvée dans targets')
    }
  })

  targets.push(item)

  return {
    targets,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos,
      result: {
        custom: true,
        icon: effectInfos.icon
      }
    },
    executor: item
  }
}
