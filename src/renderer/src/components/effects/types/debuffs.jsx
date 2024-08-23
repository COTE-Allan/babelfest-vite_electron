import { defEdit } from '../editCards'
import { getAdjacentCells } from '../targets'

export function BriseBouclier({ item, effect, pattern, effectInfos }) {
  let targets = getAdjacentCells(item, effect.target, pattern)
  const targetsCards = targets.map((target) => target.card)

  targets.forEach((target) => {
    target.card.broken = true
  })

  return {
    targets: targets,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      targets: targetsCards,
      result: {
        custom: true,
        icon: effectInfos.icon
      }
    },
    executor: item
  }
}

export function RegardGlace({ item, effect, targets, effectInfos }) {
  const targetsCards = targets.map((target) => target.card)
  let ach = false

  targets.forEach((target) => {
    if (target.card.freeze && target.card.freeze > 0) {
      target.card.freeze = effect.value + target.card.freeze
      if (item.card.name === 'Shiro' && item.card.title === 'Héraut du blizzard') {
        ach = 'HF_shiroFreeze'
      }
    } else {
      target.card.freeze = effect.value
    }
  })
  targets.push(item)

  return {
    ach: ach,
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
