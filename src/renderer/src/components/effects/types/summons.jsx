import { generateUniqueID, getRandomFromArray } from '../../others/toolBox'
import { getCardBasedOnID, getCardBasedOnNameAndTitle, getEffectInfo } from '../basics'
import { drawSingleCardAndUpdateDeck, summonCardsFromCardsArray } from '../editCards'
import { getClosestEmptyCells } from '../targets'

export function AngeRessurect({ item, effect, effectInfos, player }) {
  let target = { ...item }
  let summon = summonCardsFromCardsArray([target], effect.cards, item.owner, player)

  const targetsCards = summon.cells.map((target) => target.card)

  return {
    stillDead: false,
    targets: summon.cells,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      targets: targetsCards
    },
    executor: item,
    summoned: summon.cells
  }
}

export async function PiochePostMortem({ item, room, effectInfos, player }) {
  let target = { ...item }
  let card = await drawSingleCardAndUpdateDeck(room)

  target.card = card
  target.card.owner = { name: player.username, hex: player.primaryColor.hex }
  target.card.isRecto = true
  target.card.uniqueID = generateUniqueID()

  return {
    stillDead: false,
    targets: [target],
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      targets: [target.card]
    },
    executor: item,
    summoned: [target]
  }
}

export function InvocationMiroir({ item, killer, effectInfos, player }) {
  if (!killer.card) {
    // Return null effect if killer is null
    return {
      stillDead: true,
      targets: [],
      log: null,
      executor: item,
      summoned: []
    }
  }

  let attacker = killer
  let target = { ...item }
  target.card = getCardBasedOnID(attacker.card.id)
  target.card.owner = { name: player.username, hex: player.primaryColor.hex }
  target.card.uniqueID = generateUniqueID()
  target.card.isRecto = true

  return {
    stillDead: false,
    targets: [target],
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      targets: [target.card]
    },
    executor: item,
    summoned: [target]
  }
}

export function CompteurPuissance({ item, effect, effectInfos, player }) {
  let target = { ...item }
  let summoned = false
  target.card.timerSummon = target.card.timerSummon - 1

  if (target.card.timerSummon <= 0) {
    target.card = getCardBasedOnNameAndTitle(effect.cards[0])
    target.card.isRecto = true
    target.card.owner = { name: player.username, hex: player.primaryColor.hex }
    target.card.uniqueID = generateUniqueID()
    summoned = true
  }

  return {
    targets: [target],
    log: summoned
      ? {
          trigger: item.card,
          action: 'effect',
          effectInfos: effectInfos,
          targets: [target.card]
        }
      : {
          trigger: item.card,
          action: 'effect',
          effectInfos: effectInfos,
          result: {
            custom: true,
            icon: effectInfos.icon,
            value: target.card.timerSummon
          }
        },
    executor: item,
    summoned: [target]
  }
}

export function Soldes({ item, shop, pattern, effectInfos, player }) {
  let targets = getClosestEmptyCells(item.id, 1, pattern)
  let log = []

  targets.forEach((cell) => {
    let newCard = getRandomFromArray(shop, 1)[0]
    cell.card = newCard
    cell.card.isRecto = true
    cell.card.owner = { name: player.username, hex: player.primaryColor.hex }
    cell.card.uniqueID = generateUniqueID()
    cell.owner = item.owner
  })

  const targetsCards = targets.map((target) => target.card)

  targets.push(item)

  return {
    targets: targets,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      targets: targetsCards
    },
    executor: item,
    summoned: targets
  }
}

export function InvocationMinions({ item, effect, pattern, effectInfos, player }) {
  let targets = getClosestEmptyCells(item.id, effect.cards.length, pattern)
  let summon = summonCardsFromCardsArray(targets, effect.cards, item.owner, player)
  let result = summon.cells

  const targetsCards = summon.cells.map((target) => target.card)

  result.push(item)

  return {
    targets: result,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      targets: targetsCards
    },
    executor: item,
    summoned: summon.cells
  }
}

export function Metamorphose({ item, effect, targets, effectInfos }) {
  let targetsBefore = targets.map((target) => ({ ...target.card }))
  let summon = summonCardsFromCardsArray(targets, effect.cards, null, null, true)
  let result = summon.cells

  let targetsAfter = result.map((cell) => ({ ...cell.card }))
  let targetsCards = [...targetsBefore, ...targetsAfter]

  result.push(item)

  return {
    targets: result,
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      targets: targetsCards
    },
    executor: item,
    summoned: summon.cells
  }
}
