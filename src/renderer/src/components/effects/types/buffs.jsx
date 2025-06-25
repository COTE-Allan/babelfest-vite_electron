import { atkEdit, defEdit, depEdit, hpEdit, randomBoost } from '../editCards'
import { getAdjacentCells } from '../targets'

export function Renforcement({ item, effect, pattern, effectInfos }) {
  let targets = getAdjacentCells(item, effect.target, pattern)
  targets = atkEdit(item.card.name, effect.value, targets)
  const targetsCards = targets.map((target) => target.card)

  return {
    targets: targets,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      targets: targetsCards,
      result: { icon: 'atk', value: `+ ${effect.value}` }
    },
    executor: item
  }
}

export function Turbo({ item, effect, pattern, effectInfos }) {
  let targets = getAdjacentCells(item, effect.target, pattern)
  targets = depEdit(item.card.name, effect.value, targets)
  const targetsCards = targets.map((target) => target.card)

  return {
    targets: targets,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      targets: targetsCards,
      result: { icon: 'dep', value: `+ ${effect.value}` }
    },
    executor: item
  }
}

export function BouclierProtecteur({ item, effect, pattern, effectInfos }) {
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
      result: { icon: 'shield', value: `+ ${effect.value}` }
    },
    executor: item
  }
}

export function Berserk({ item, effect, pattern, effectInfos }) {
  let value = getAdjacentCells(item, effect.target, pattern).length
  let targets = atkEdit(item.card.name, value, [item])
  return {
    targets: value === 0 ? [] : targets,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      result: { icon: 'atk', value: `+ ${value}` }
    },
    executor: item
  }
}

export function SteelBerserk({ item, effect, pattern, effectInfos }) {
  let value = getAdjacentCells(item, effect.target, pattern).length
  let targets = defEdit(item.card.name, value, [item])

  return {
    targets: value === 0 ? [] : targets,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      result: { icon: 'shield', value: `+ ${value}` }
    },
    executor: item
  }
}

export function TousPourUn({ item, effect, pattern, effectInfos }) {
  let value = getAdjacentCells(item, effect.target, pattern).length
  let targets = atkEdit(item.card.name, value, [item])

  return {
    targets: value === 0 ? [] : targets,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      result: { icon: 'atk', value: `+ ${value}` }
    },
    executor: item
  }
}

export function Leader({ item, updatedDeadCell, effectInfos }) {
  if (updatedDeadCell.owner === item.owner) {
    let targets = [randomBoost(item, 1)]

    return {
      targets: targets,
      log: {
        trigger: item.card,
        action: 'effect',
        effectInfos: effectInfos,
        result: { icon: 'random', value: `+ 1` }
      },
      executor: item
    }
  } else {
    return null
  }
}

export function processorAlly({ item, effect, pattern, effectInfos }) {
  let targets = pattern.filter(
    (cell) =>
      cell.card &&
      cell.owner === item.owner &&
      cell.card.rarity === 1 &&
      cell.card.uniqueID !== item.card.uniqueID
  )

  // Number of targets found
  let targetCount = targets.length

  // Calculate the total increase based on the effect value and number of targets
  let totalIncrease = targetCount * effect.value

  // Update item.card properties based on the total increase
  item.card.atk += totalIncrease
  item.card.baseatk += totalIncrease
  item.card.hp += totalIncrease
  item.card.basehp += totalIncrease
  item.card.dep += totalIncrease
  item.card.basedep += totalIncrease

  return {
    targets: [item],
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      result: { icon: 'atk', value: `+ ${totalIncrease}` }
    },
    executor: item
  }
}

export function processorRival({ item, effect, pattern, effectInfos }) {
  let targets = pattern.filter(
    (cell) =>
      cell.card && cell.owner !== item.owner && (cell.card.rarity === 3 || cell.card.rarity === 4)
  )

  // Number of targets found
  let targetCount = targets.length

  // Calculate the total increase based on the effect value and number of targets
  let totalIncrease = targetCount * effect.value

  // Update item.card properties based on the total increase
  item.card.atk += totalIncrease
  item.card.baseatk += totalIncrease
  item.card.hp += totalIncrease
  item.card.basehp += totalIncrease
  item.card.dep += totalIncrease
  item.card.basedep += totalIncrease

  return {
    targets: [item],
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      result: { icon: 'atk', value: `+ ${totalIncrease}` }
    },
    executor: item
  }
}

// Function to increase baseatk and atk of adjacent cells
export function permAtk({ item, effect, pattern, effectInfos }) {
  let targets = getAdjacentCells(item, effect.target, pattern)
  targets = atkEdit(item.card.name, effect.value, targets)
  const targetsCards = targets.map((target) => target.card)

  // Increase baseatk for each target
  targets.forEach((target) => {
    target.card.baseatk += effect.value
  })

  targets.push(item)

  return {
    targets: targets,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      targets: targetsCards,
      result: { icon: 'atk', value: `+ ${effect.value}` }
    },
    executor: item
  }
}

// Function to increase hp and basehp of adjacent cells
export function permHP({ item, effect, pattern, effectInfos }) {
  let targets = getAdjacentCells(item, effect.target, pattern)
  targets = hpEdit(effect.value, targets, false, null, false)
  const targetsCards = targets.map((target) => target.card)

  // Increase basehp for each target
  targets.forEach((target) => {
    target.card.basehp += effect.value
  })

  targets.push(item)

  return {
    targets: targets,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      targets: targetsCards,
      result: { icon: 'hp', value: `+ ${effect.value}` }
    },
    executor: item
  }
}

export async function darwinBoost({ item, effectInfos, pattern, playerID }) {
  let count = 0
  let ach = false

  for (const { id, card, owner } of pattern) {
    if (id === item.id) continue
    if (owner !== playerID || !card?.effects) continue
    for (const effect of card.effects) {
      if (effect.type === 'darwinien') {
        count++
      }
    }
  }

  let target = atkEdit(item.card.name, count, [item])
  target = depEdit(item.card.name, count, [item])

  if (count >= 4) {
    ach = 'HF_5fury'
  }

  return {
    ach: ach,
    targets: target,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos,
      result: {
        custom: true,
        icon: effectInfos.icon,
        value: `+ ${count}`
      }
    },
    executor: item
  }
}
