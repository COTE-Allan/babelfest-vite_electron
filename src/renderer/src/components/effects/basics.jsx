import { getAllCards } from '../others/toolBox'
import effectsInfos from '../../jsons/effects.json'

export function lancerDe10() {
  return Math.floor(Math.random() * 10) + 1
}

export function HeadOrTails() {
  // Créez un nombre aléatoire entre 1 et 10 (inclus)
  const randomNumber = Math.floor(Math.random() * 10) + 1
  // Si le randomNumber est supérieur ou égal à 5, retournez 1 (tête), sinon retournez 2 (pile)
  return randomNumber >= 5 ? 1 : 2
}

export function getCardBasedOnID(id) {
  let result = getAllCards().find((card) => card.id === id)
  result.isRecto = true
  return result
}

export function getCardBasedOnNameAndTitle(infos) {
  let result = getAllCards().find((card) => card.name === infos.name && card.title === infos.title)
  result.isRecto = true
  return result
}

export function getCardsBasedOnMultipleInfos(infosArray) {
  let cards = []
  let allCards = getAllCards()
  infosArray.forEach((info) => {
    let cardTarget = allCards.find((card) => card.name === info.name && card.title === info.title)
    let result = {
      cost: cardTarget.cost,
      image: cardTarget.url,
      name: cardTarget.name,
      title: cardTarget.title,
      rarity: cardTarget.rarity
    }
    cards.push(result)
  })
  return cards
}

export function getTotalCost(deck) {
  let cost = 0
  deck.forEach((card) => {
    cost = cost + card.cost
  })
  return cost
}

export function getEffectInfo(effectName) {
  return effectsInfos.find((effect) => effect.slug === effectName)
}
export function getAllEffects() {
  return effectsInfos
}
