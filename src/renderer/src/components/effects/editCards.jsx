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
export async function drawHandWithRarityConstraint(deck, cardAmount) {
  if (deck.length < cardAmount) {
    console.error('Not enough cards in the deck to draw the required hand.')
    return [] // Retourne un tableau vide ou tu peux lancer une erreur si nécessaire
  }

  let hand
  let totalRarity
  const deckCopy = [...deck] // Créer une copie du deck pour préserver l'original

  // Calculer les bornes de rareté en fonction de cardAmount et arrondir à l'inférieur
  const minBase = 13
  const maxBase = 15
  const minRarity = Math.floor(minBase * (cardAmount / 8))
  const maxRarity = Math.floor(maxBase * (cardAmount / 8))

  do {
    // Réinitialise la main et le total de la rareté
    hand = []
    totalRarity = 0

    // On tire cardAmount cartes aléatoires
    for (let i = 0; i < cardAmount; i++) {
      const random = Math.floor(Math.random() * deckCopy.length)
      const card = deckCopy[random]

      hand.push(card)
      totalRarity += card.rarity

      // Retirer la carte du deck
      deckCopy.splice(random, 1)
    }

    // Si la main ne satisfait pas la contrainte, on remet les cartes dans le deck
    if (totalRarity < minRarity || totalRarity > maxRarity) {
      deckCopy.push(...hand)
    }
  } while (totalRarity < minRarity || totalRarity > maxRarity)

  // Retirer les cartes tirées du deck original
  for (const card of hand) {
    const index = deck.indexOf(card)
    if (index > -1) {
      deck.splice(index, 1)
    }
  }

  return hand
}

export async function drawHandWithTargetDistribution(deck, cardAmount) {
  if (deck.length < cardAmount) {
    console.error('Not enough cards in the deck to draw the required hand.')
    return []
  }

  let hand = []
  const deckCopy = [...deck]

  // Ensure at least one card of rarity 3 or 4
  let rarity3or4Cards = deckCopy.filter((card) => card.rarity === 3 || card.rarity === 4)
  if (rarity3or4Cards.length > 0) {
    const card = rarity3or4Cards[Math.floor(Math.random() * rarity3or4Cards.length)]
    hand.push(card)
    deckCopy.splice(deckCopy.indexOf(card), 1)
  }

  // Handle Rarity 4: Only 0 or 1 additional card
  let rarity4Cards = deckCopy.filter((card) => card.rarity === 4)
  if (hand[0].rarity !== 4 && rarity4Cards.length > 0 && Math.random() < 0.25) {
    // Assuming 25% chance for rarity 4
    const card = rarity4Cards[Math.floor(Math.random() * rarity4Cards.length)]
    hand.push(card)
    deckCopy.splice(deckCopy.indexOf(card), 1)
  }

  // Handle Rarity 3: Only up to 1 more card if a rarity 4 is already included, otherwise up to 2 cards
  let maxRarity3 = hand.some((card) => card.rarity === 4) ? 1 : 2
  let rarity3Cards = deckCopy.filter((card) => card.rarity === 3)
  for (let i = 0; i < maxRarity3 && rarity3Cards.length > 0; i++) {
    const card = rarity3Cards[Math.floor(Math.random() * rarity3Cards.length)]
    hand.push(card)
    deckCopy.splice(deckCopy.indexOf(card), 1)
    rarity3Cards = deckCopy.filter((card) => card.rarity === 3) // Refresh available cards
  }

  // Fill the rest with Rarity 1 and 2, with Rarity 2 being slightly more rare
  let remainingCardsNeeded = cardAmount - hand.length
  let lowerRarityCards = deckCopy.filter((card) => card.rarity === 1 || card.rarity === 2)

  for (let i = 0; i < remainingCardsNeeded && lowerRarityCards.length > 0; i++) {
    // Favor rarity 1 slightly over rarity 2
    let card
    const rarity1Cards = lowerRarityCards.filter((card) => card.rarity === 1)
    const rarity2Cards = lowerRarityCards.filter((card) => card.rarity === 2)

    if (rarity1Cards.length > 0 && (rarity2Cards.length === 0 || Math.random() < 0.6)) {
      // 60% chance to choose rarity 1
      card = rarity1Cards[Math.floor(Math.random() * rarity1Cards.length)]
    } else if (rarity2Cards.length > 0) {
      card = rarity2Cards[Math.floor(Math.random() * rarity2Cards.length)]
    }

    if (card) {
      hand.push(card)
      deckCopy.splice(deckCopy.indexOf(card), 1)
      lowerRarityCards = deckCopy.filter((card) => card.rarity === 1 || card.rarity === 2) // Refresh available cards
    }
  }

  // Shuffle the hand to mix the rarities
  hand = hand.sort(() => Math.random() - 0.5)

  // Remove drawn cards from the original deck
  for (const card of hand) {
    const index = deck.indexOf(card)
    if (index > -1) {
      deck.splice(index, 1)
    }
  }

  return hand
}

export async function drawHandWithAdjustedRarity(deck, cardAmount) {
  const hand = []
  let totalRarity = 0

  const rarityWeights = {
    1: 4, // Plus de chance de tirer des cartes de rareté 1
    2: 4, // Plus de chance de tirer des cartes de rareté 2
    3: 1, // Moins de chance de tirer des cartes de rareté 3
    4: 1 // Moins de chance de tirer des cartes de rareté 4
  }

  const weightedDeck = deck.flatMap((card) => Array(rarityWeights[card.rarity]).fill(card))

  while (hand.length < cardAmount) {
    const randomIndex = Math.floor(Math.random() * weightedDeck.length)
    const card = weightedDeck[randomIndex]

    hand.push(card)
    totalRarity += card.rarity

    // Retirer la carte du deck et de weightedDeck
    const cardIndex = deck.indexOf(card)
    if (cardIndex !== -1) {
      deck.splice(cardIndex, 1)
      weightedDeck.splice(randomIndex, 1)
    }
  }

  return hand
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

    // Attendre la mise à jour complète de la main
    await new Promise((resolve) => setTimeout(resolve, 500))

    console.log("Avant l'échange, main du joueur:", playerSelf.hand)

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

        updatePayload[targetHand] = [...handFilteredPP, ...playerNewCards]

        const rivalFiltered = playerRival.hand.filter(
          (item) => !playerNewCards.some((card) => containsObject(card, [item]))
        )
        updatePayload[oppositeHand] = [...rivalFiltered, ...rivalNewCards]
        break

      default:
        return
    }

    console.log("Après l'échange, nouvelle main du joueur:", updatePayload[targetHand])

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
  delete target.card.baseattackCount
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
      if (target.card[key] && (key === 'attackCount' || key === 'baseattackCount')) {
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

export function getCardsFromArray(cardsArray) {
  return cardsArray.map((cardInfo) => {
    const { name, title } = cardInfo
    return getCardBasedOnNameAndTitle({ name, title })
  })
}
