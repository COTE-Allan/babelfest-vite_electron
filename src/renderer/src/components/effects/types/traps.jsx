import { hpEdit, removeEffects } from '../editCards'
import { getAdjacentCells } from '../targets'

export function PiegeOurs({ item, attacker, effectInfos }) {
  let targets = [attacker]
  targets = hpEdit(-1, targets)

  return {
    targets: targets,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      targets: targets,
      result: { icon: 'hp', value: `- 1` }
    },
    executor: item
  }
}

export async function TaserPostMortem({ item, killer, effectInfos }) {
  if (!killer.card) {
    // Return null effect if killer is null
    return {
      targets: [],
      log: null,
      executor: item
    }
  }

  let attacker = killer
  if (!attacker.card.dead) {
    attacker.card.dead = {
      cell: item.id,
      id: item.card.id,
      uniqueID: item.card.uniqueID
    }
    let targets = [attacker]

    return {
      targets: targets,
      log: {
        trigger: item.card,
        action: 'effect',
        effectInfos: effectInfos,
        targets: [killer.card],
        result: { icon: 'death' }
      },
      executor: item
    }
  } else {
    return {
      targets: [],
      log: false,
      executor: item
    }
  }
}

export function Pietinement({ item, pattern, effect, effectInfos }) {
  let targets = getAdjacentCells(item, effect.target, pattern)
  targets = hpEdit(-1, targets, true, item)
  return {
    targets: targets,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      targets: targets,
      result: { icon: 'hp', value: `- 1` }
    },
    executor: item
  }
}

export function TroisiemeOeil({ item, pattern, effect, effectInfos }) {
  let targets = getAdjacentCells(item, effect.target, pattern)
  let ach = false
  targets.forEach((target) => {
    if (!target.card.isRecto) {
      target = removeEffects(target)
      target.card.isRecto = true
      target.card.effects = [{ type: 'revealed' }]
      ach = 'HF_thirdEye'
    }
  })

  const targetsCards = targets.map((target) => target.card)

  return {
    cancel: targets.length === 0,
    ach: ach,
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



export function AbsoluteTroisiemeOeil({ item, pattern, effect, effectInfos }) {
  let targets = getAdjacentCells(item, effect.target, pattern)
  targets.forEach((target) => {
      target = removeEffects(target)
      target.card.isRecto = true
      target.card.effects = [{ type: 'revealed' }]
  })

  const targetsCards = targets.map((target) => target.card)

  return {
    cancel: targets.length === 0,
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