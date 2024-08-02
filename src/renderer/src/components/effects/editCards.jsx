import { doc, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '../../Firebase'
import { useContext } from 'react'
import { GlobalContext } from '../providers/GlobalProvider'
import { generateUniqueID } from '../others/toolBox'
import { getDeck } from '../controllers/ManageLobbyAndGame'
import { getCardBasedOnNameAndTitle } from './basics'
import randomEffects from '../../jsons/randomEffects.json'
import { usePushLogsIntoBatch } from '../controllers/LogsController'

let red = '#bb2424'
let green = '#4ead35'

// Retirer une carte du plateau
export function removeCardAndBatch(cellID, room, batchInstance) {
  const cellRef = doc(db, `games/${room}/arena`, `cell-${cellID}`)
  batchInstance.update(cellRef, {
    card: null,
    owner: null
  })
}

// Pioche des cards aléatoires dans le paquet [LOCAL]
export async function drawRandomCards(deck, amount) {
  const drawnCards = []
  for (let i = 0; i < amount; i++) {
    const random = Math.floor(Math.random() * deck.length)
    drawnCards.push(deck[random])
    deck.splice(random, 1)
  }
  return drawnCards
}

// Pioche des cartes aléatoires en fonction de leur rareté
export async function drawCardsByRarity(deck, amount) {
  const rarityProbabilities = [
    { rarity: 1, probability: 50 },
    { rarity: 2, probability: 30 },
    { rarity: 3, probability: 15 },
    { rarity: 4, probability: 5 }
  ]

  // Convert probabilities to cumulative probabilities
  let cumulativeProbability = 0
  const cumulativeProbabilities = rarityProbabilities.map(({ rarity, probability }) => {
    cumulativeProbability += probability
    return { rarity, cumulativeProbability }
  })

  const drawnCards = []
  for (let i = 0; i < amount; i++) {
    const random = Math.random() * 100
    const selectedRarity = cumulativeProbabilities.find(
      ({ cumulativeProbability }) => random <= cumulativeProbability
    ).rarity

    const cardsOfSelectedRarity = deck.filter((card) => card.rarity === selectedRarity)
    if (cardsOfSelectedRarity.length === 0) continue // In case no card of the selected rarity is found

    const randomIndex = Math.floor(Math.random() * cardsOfSelectedRarity.length)
    const drawnCard = cardsOfSelectedRarity[randomIndex]
    drawnCards.push(drawnCard)

    // Remove the drawn card from the deck
    const cardIndexInDeck = deck.indexOf(drawnCard)
    deck.splice(cardIndexInDeck, 1)
  }

  return drawnCards
}

// Piocher une carte et la retirer du deck
export async function drawSingleCardAndUpdateDeck(room) {
  const deck = await getDeck(room)

  if (deck.length === 0) throw new Error('Le deck est vide.')

  // Tirer une carte aléatoirement
  const randomIndex = Math.floor(Math.random() * deck.length)
  const drawnCard = deck.splice(randomIndex, 1)[0]

  // Mettre à jour le deck dans la base de données
  await updateDoc(doc(db, 'games', room), {
    deck
  })
  return drawnCard
}

// Echanger deux cartes depuis la boutique ou avec un autre joueur
// si param 4 = true : passage a la phase suivante
export const useTradeCard = () => {
  const {
    selectedCards,
    selectedShopCards,
    shop,
    playerSelf,
    playerRival,
    firstToPlay,
    host,
    gameData,
    phase,
    room,
    playerID
  } = useContext(GlobalContext)

  const pushLogsIntoBatch = usePushLogsIntoBatch()

  function containsObject(obj, list) {
    return list.some((item) => item.id === obj.id)
  }

  async function tradeCard(type, J1newCard, J2newCard, nextPhase = false) {
    const targetHand = host ? 'handJ1' : 'handJ2'
    const oppositeHand = host ? 'handJ2' : 'handJ1'
    let updatePayload = {}

    const batch = writeBatch(db)

    switch (type) {
      case 'Shop&Player':
        const handFilteredSP = playerSelf.hand.filter((item) => !selectedCards.includes(item))
        const shopFiltered = shop.filter((item) => !selectedShopCards.includes(item))

        await pushLogsIntoBatch(batch, {
          trigger: selectedCards,
          action: 'trade',
          targets: selectedShopCards
        })

        updatePayload[targetHand] = [...handFilteredSP, ...selectedShopCards]
        updatePayload.shop = [...shopFiltered, ...selectedCards]
        break

      case 'Player&Player':
        const [playerNewCards, rivalNewCards] = host
          ? [J1newCard, J2newCard]
          : [J2newCard, J1newCard]

        const handFilteredPP = playerSelf.hand.filter(
          (item) => !rivalNewCards.some((card) => containsObject(card, [item]))
        )
        const rivalFiltered = playerRival.hand.filter(
          (item) => !playerNewCards.some((card) => containsObject(card, [item]))
        )

        updatePayload[targetHand] = [...handFilteredPP, ...playerNewCards]
        updatePayload[oppositeHand] = [...rivalFiltered, ...rivalNewCards]
        break

      default:
        return
    }

    if (nextPhase) updatePayload.phase = phase + 1
    await pushLogsIntoBatch(
      batch,
      {
        turn: 1,
        phase: 1
      },
      firstToPlay
    )
    batch.update(doc(db, 'games', room), updatePayload)
    batch.commit()
  }

  return tradeCard
}

// ============
// CARDS EDITOR
// ============

// Définir l'atk
export function setAtk(target, value) {
  target.card.atk = value
  target.card.baseatk = value
  return target
}

// Définir les hp
export function setHp(target, value) {
  target.card.hp = value
  target.card.basehp = value
  return target
}

// Définir le dep
export function setDep(target, value) {
  target.card.dep = value
  target.card.basedep = value
  return target
}

// Ajouter à la def existante
export function defEdit(user, value, targets) {
  targets.forEach((target) => {
    if (target.card.def) {
      target.card.def = target.card.def + value
    } else {
      target.card.def = value
    }
    ;(target.card.affected = target.card.affected || []).push({
      text: `DEF ${value >= 0 ? '+' : ''}${value}`,
      colorCode: value >= 0 ? green : red
    })
  })
  return targets
}
// Ajouter à l'atk existante
export function atkEdit(user, value, targets) {
  targets.forEach((target) => {
    target.card.atk = target.card.atk + value
    ;(target.card.affected = target.card.affected || []).push({
      text: `ATK ${value >= 0 ? '+' : ''}${value}`,
      colorCode: value >= 0 ? green : red
    })
  })
  return targets
}
// Ajouter à la dep existante
export function depEdit(user, value, targets) {
  targets.forEach((target) => {
    target.card.dep = target.card.dep + value
    ;(target.card.affected = target.card.affected || []).push({
      text: `DEP ${value >= 0 ? '+' : ''}${value}`,
      colorCode: value >= 0 ? green : red
    })
  })
  return targets
}

// Ajouter aux hp existants
export function hpEdit(value, targets, room, specialDeath = false) {
  targets.forEach(async (target) => {
    target.card.hp = target.card.hp + value
    if (target.card.hp <= 0) {
      target.card.dead = {
        cell: target.id,
        id: target.card.id,
        uniqueID: target.card.uniqueID,
        specialDeath: specialDeath
      }
    }
  })
  return targets
}

// Obtenir un point dans une stat aléatoire
export function randomBoost(target, value) {
  // Choix aléatoire de l'attribut à augmenter
  const choice = Math.floor(Math.random() * 3)

  if (choice === 0) {
    // Augmenter les attributs atk
    target.card.atk += value
    target.card.baseatk += value
  } else if (choice === 1) {
    // Augmenter les attributs dep
    target.card.dep += value
    target.card.basedep += value
  } else {
    // Augmenter les attributs hp
    target.card.hp += value
    target.card.basehp += value
  }

  return target
}

// Supprimer tous les effets d'une carte
export function removeEffects(target) {
  delete target.card.fortress
  delete target.card.attackCount
  delete target.card.baseAttackCount
  delete target.card.deathScythe
  delete target.card.reach
  delete target.card.ghost
  delete target.card.healer
  delete target.card.dieTogether
  delete target.card.diving
  delete target.card.deathCounter
  return target
}

// Invoquer des cartes
export function summonCardsFromCardsArray(cells, infos, owner = null) {
  let log = []
  cells.forEach((cell, index) => {
    let newCard = getCardBasedOnNameAndTitle(infos[index])
    cell.card = newCard
    cell.card.isRecto = true
    cell.card.uniqueID = generateUniqueID()
    cell.owner = owner ? owner : cell.owner
    log.push(`${newCard.name} est invoqué !`)
  })

  return { cells: cells, log: log }
}

// Définir un effet aléatoire à une carte
export function randomEffect(target, index) {
  let effect = getRandomFromArray(randomEffects, 1)[0]
  if (effect.speParams) {
    effect.speParams.forEach((speParam) => {
      let [key, value] = speParam
      if (target.card[key] && (key === 'attackCount' || key === 'baseAttackCount')) {
        target.card[key] = target.card[key] + value
      } else {
        target.card[key] = value
      }
    })
    delete effect.speParams
  }
  target.card.effects[index] = effect
  return target
}
