import { getEffectInfo } from '../basics'
import { hpEdit } from '../editCards'
import { getAdjacentCells, getClosestEmptyCells } from '../targets'

export function Inversion({ item, effectInfos }) {
  let target = { ...item }
  let hp = item.card.hp
  let atk = item.card.atk

  target.card.hp = atk
  target.card.basehp = atk
  target.card.atk = hp
  target.card.baseatk = hp

  return {
    targets: [target],
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      targets: [target.card],
      result: { icon: 'atk', value: `= ${target.card.atk}` }
    },
    executor: target
  }
}

export function PluieFleche({ item, effect, pattern, effectInfos, attacker }) {
  let targets = getAdjacentCells(item, effect.target, pattern)
  targets = hpEdit(-1, targets, true, attacker)

  return {
    targets: targets,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      targets: targets,
      result: { icon: 'hp', value: `-1` }
    },
    executor: item
  }
}

export function Grappin({ item, targets, pattern, effectInfos }) {
  let targetCells = getClosestEmptyCells(item.id, targets.length, pattern)
  let affectedCells = []
  let originalTargets = []

  targets.forEach((target, index) => {
    if (index < targetCells.length) {
      targetCells[index].card = target.card
      targetCells[index].owner = target.owner

      affectedCells.push(targetCells[index])

      // Enregistrer la carte originale avant de la définir à null
      originalTargets.push(target.card)

      target.card = null
      target.owner = null

      affectedCells.push(target)
    }
  })
  affectedCells.push(item)

  return {
    targets: affectedCells,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      targets: originalTargets
    },
    executor: item
  }
}

export function Plongeon({ item, effectInfos }) {
  let target = item
  target.card.diving = !target.card.diving

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
