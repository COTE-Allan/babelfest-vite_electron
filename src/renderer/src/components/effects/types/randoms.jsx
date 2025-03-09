import randomEffects from '../../../jsons/randomEffects.json'
import { getRandomFromArray, shuffleArray } from '../../others/toolBox'
import { getEffectInfo } from '../basics'
import { getAllCardsOnArena } from '../targets'

export function EffetRandom({ item, index }) {
  let target = item

  // Effectuer une copie profonde de l'objet newEffect pour éviter toute mutation involontaire
  let newEffect = JSON.parse(JSON.stringify(getRandomFromArray(randomEffects, 1)[0]))

  console.log(`EffetRandom invoked on index ${index} for card ${target.card.name}.`)
  console.log('Current effects:', target.card.effects)

  let effectInfos = getEffectInfo(newEffect.type)
  let randEffectInfos = getEffectInfo('random')

  if (newEffect.speParams) {
    newEffect.speParams.forEach((speParam) => {
      let [key, value] = speParam
      if (target.card[key] && (key === 'attackCount' || key === 'baseattackCount')) {
        target.card[key] = target.card[key] + value
      } else {
        target.card[key] = value
      }
    })
    delete newEffect.speParams
  }

  // Remplacer l'effet à l'index spécifié
  target.card.effects[index] = newEffect

  console.log('Updated effects:', target.card.effects)

  return {
    targets: [target],
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: randEffectInfos,
      result: {
        custom: true,
        icon: effectInfos.icon
      }
    },
    executor: item
  }
}

export function RandomATK({ item, effect, effectInfos }) {
  let newValue = getRandomFromArray(effect.range, 1)[0]
  let target = item
  target.card.atk = newValue
  target.card.baseatk = newValue

  return {
    targets: [target],
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      result: {
        icon: 'atk',
        value: '= ' + newValue
      }
    },
    executor: item
  }
}

export function RandomDEP({ item, effect, effectInfos }) {
  let newValue = getRandomFromArray(effect.range, 1)[0]
  let target = item
  target.card.dep = newValue
  target.card.basedep = newValue

  return {
    targets: [target],
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      result: {
        icon: 'dep',
        value: '= ' + newValue
      }
    },
    executor: item
  }
}

export function RandomHP({ item, effect, effectInfos }) {
  let newValue = getRandomFromArray(effect.range, 1)[0]
  let target = item
  target.card.hp = newValue
  target.card.basehp = newValue

  return {
    targets: [target],
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      result: {
        icon: 'hp',
        value: '= ' + newValue
      }
    },
    executor: item
  }
}

export function ChaosTP({ item, effect, pattern, effectInfos }) {
  let targets = getAllCardsOnArena(item, effect.target, pattern, false)

  targets = shuffleArray(targets)
  for (let i = 0; i < targets.length; i++) {
    let nextIndex = (i + 1) % targets.length

    let tempOwner = targets[i].owner
    let tempCard = targets[i].card

    targets[i].owner = targets[nextIndex].owner
    targets[i].card = targets[nextIndex].card

    targets[nextIndex].owner = tempOwner
    targets[nextIndex].card = tempCard
  }

  targets.push(item)

  return {
    targets: targets,
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
