import { defEdit } from '../editCards'
import { getAdjacentCells } from '../targets'

export function BriseBouclier({ item, effect, pattern, effectInfos }) {
  let targets = getAdjacentCells(item, effect.target, pattern)
  targets = defEdit(item.card.name, effect.value, targets)

  const targetsCards = targets.map((target) => target.card)

  return {
    targets: targets,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      targets: targetsCards,
      result: { icon: 'shield', value: `${effect.value}` }
    },
    executor: item
  }
}

export function RegardGlace({ item, effect, targets, effectInfos }) {
  let log = [`${item.card.name} gèle des cartes !`]

  const targetsCards = targets.map((target) => target.card)

  targets.forEach((target) => {
    if (target.card.freeze && target.card.freeze > 0) {
      target.card.freeze = effect.value + target.card.freeze
    } else {
      target.card.freeze = effect.value
    }
    log.push(`${target.card.name} est gelé !`)
  })
  targets.push(item)

  return {
    targets: targets,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      targets: targetsCards,
      result: {
        custom: true,
        icon: effectInfos.icon,
        value: `${effect.value}`
      }
    },
    executor: item
  }
}
