import {
  doc,
  collection,
  updateDoc,
  orderBy,
  query,
  getDocs,
  getDoc,
  where,
  onSnapshot,
  limit
} from 'firebase/firestore'
import { db } from '../../Firebase'

import originCards from '../../jsons/cards/originCards.json'
import reinforcementCards from '../../jsons/cards/reinforcementCards.json'
import babelfish from '../../jsons/cards/babelfish.json'
import mecanicaCards from '../../jsons/cards/mecanicaCards.json'

import bordersData from '../../jsons/skins/borderProfile.json'
import colorsData from '../../jsons/skins/colorsSkins.json'
import bannerData from '../../jsons/skins/userBanner.json'
import avatarData from '../../jsons/skins/profilePics.json'
import titleData from '../../jsons/skins/userTitle.json'

const borders = bordersData.map((item) => ({ ...item, type: 'Bordure' }))
const colors = colorsData.map((item) => ({ ...item, type: 'Couleur' }))
const banner = bannerData.map((item) => ({ ...item, type: 'Bannière' }))
const avatar = avatarData.map((item) => ({ ...item, type: 'Avatar' }))
const title = titleData.map((item) => ({ ...item, type: 'Titre' }))
const allSkins = [...borders, ...colors, ...banner, ...avatar, ...title]

import useSound from 'use-sound'
import errorSfx from '../../assets/sfx/menu_unauthorized.mp3'
import { toast } from 'react-toastify'

export function deepEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true
  }

  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false
  }

  let keys1 = Object.keys(obj1)
  let keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) {
    return false
  }

  for (let key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false
    }
  }

  return true
}

export function formatNumber(value) {
  return value.toString().padStart(2, '0')
}

export function getRandomFromArray(array, nombre) {
  let result = []
  let copieArray = [...array] // Création d'une copie pour ne pas modifier le tableau original

  for (let i = 0; i < nombre; i++) {
    if (copieArray.length === 0) break // Vérifie s'il reste des éléments à extraire

    let indexAleatoire = Math.floor(Math.random() * copieArray.length)
    result.push(copieArray[indexAleatoire])
    copieArray.splice(indexAleatoire, 1) // Supprime l'élément extrait pour ne pas le choisir à nouveau
  }

  return result
}

export function generateCode(len = 6) {
  let charset = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
  let result = ''
  for (let i = 0; i < len; i++) {
    let charsetlength = charset.length
    result += charset.charAt(Math.floor(Math.random() * charsetlength))
  }
  return result
}

export function extractRandomElement(array, nombre) {
  let result = []
  let extractedElements = []
  let copieArray = [...array] // Toujours cette petite copie pour pas toucher à l'original, hein.

  for (let i = 0; i < nombre; i++) {
    if (copieArray.length === 0) break // On vérifie si le tableau n'est pas déjà vide.

    let indexAleatoire = Math.floor(Math.random() * copieArray.length)
    extractedElements.push(copieArray[indexAleatoire]) // Stocke l'élément choisi.
    copieArray.splice(indexAleatoire, 1) // Adieu l'élément, tu ne seras pas regretté.
  }

  result = copieArray // Ce qui reste après la fête.

  return { extractedElements, result } // Un beau paquet cadeau avec tout bien rangé dedans.
}

export async function updateDeck(newDeck, room) {
  updateDoc(doc(db, 'games', room), {
    deck: newDeck
  })
}

export async function updateHand(newHand, team, room) {
  updateDoc(doc(db, 'games', room), {
    [team]: newHand
  })
}

// obtenir toute les cartes du jeu
export function getAllCards() {
  let cards = []
  let idCounter = 1 // Start the counter at 1

  // Function to add unique ID to each card and increment the counter
  const addUniqueId = (card) => {
    const cardWithId = { ...card, id: idCounter } // Add the current counter as the ID
    idCounter++ // Increment the counter for the next card
    return cardWithId
  }

  // Add unique IDs to all cards and combine them into one array
  cards.push(
    ...originCards.map(addUniqueId),
    ...reinforcementCards.map(addUniqueId),
    ...babelfish.map(addUniqueId),
    ...mecanicaCards.map(addUniqueId)
  )

  return cards
}

export function shuffleArray(array) {
  let newArray = [...array] // Crée une copie du tableau
  let currentIndex = newArray.length,
    randomIndex

  // Tant qu'il reste des éléments à mélanger...
  while (currentIndex > 0) {
    // Choisir un élément restant.
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // Et l'échanger avec l'élément courant.
    ;[newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex],
      newArray[currentIndex]
    ]
  }

  return newArray
}

export function defineWinner(room, player) {
  updateDoc(doc(db, 'games', room), {
    finished: player
  })
}

export function useSendErrorMessage() {
  const [error] = useSound(errorSfx)

  const sendErrorMessage = (msg) => {
    error()
    toast.error(msg)
  }

  return sendErrorMessage
}

export function arraysEqual(a, b) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export async function getPattern(room) {
  const q = query(collection(db, `games/${room}/arena`), orderBy('id', 'desc'))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => doc.data())
}

export function generateUniqueID() {
  // Obtenir le nombre de millisecondes depuis l'époque Unix
  const now = Date.now().toString(36)

  // Générer un nombre aléatoire et le convertir en base 36 (numéros + lettres)
  const random = Math.random().toString(36).substring(2, 15)

  // Combiner les deux pour obtenir un ID
  return now + random
}

export function getOnlineUsersCount(setCountCallback) {
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('status.state', '==', 'online'))

  const unsubscribe = onSnapshot(q, (snapshot) => {
    // Mise à jour du compteur avec le nombre d'utilisateurs en ligne
    setCountCallback(snapshot.size)
  })

  // Retourne la fonction de désinscription pour pouvoir l'arrêter plus tard
  return unsubscribe
}

export function getFeaturedCards() {
  // Récupérer toutes les cartes en utilisant getAllCards
  const allCards = getAllCards()

  // Filtrer pour obtenir seulement les cartes avec 'featured' = true
  const featuredCards = allCards.filter((card) => card.featured)

  return featuredCards
}

export async function getTopUsersByMMRAndLevel() {
  const usersRef = collection(db, 'users')

  // Utilisez d'abord orderBy pour le MMR, puis pour le niveau, puis pour l'XP pour gérer les égalités
  const q = query(
    usersRef,
    orderBy('stats.mmr', 'desc'),
    orderBy('level', 'desc'),
    orderBy('xp', 'desc'),
    limit(10)
  )

  try {
    const querySnapshot = await getDocs(q)
    const topUsers = []
    querySnapshot.forEach((doc) => {
      topUsers.push({ id: doc.id, ...doc.data() })
    })
    return topUsers
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error)
    return []
  }
}

export async function getTopUsersByMMR() {
  const usersRef = collection(db, 'users')

  // Utilisez d'abord orderBy pour le MMR, puis pour le niveau, puis pour l'XP pour gérer les égalités
  const q = query(
    usersRef,
    orderBy('stats.mmr', 'desc'),
    orderBy('level', 'desc'),
    orderBy('xp', 'desc'),
    limit(10)
  )

  try {
    const querySnapshot = await getDocs(q)
    const topUsers = []
    querySnapshot.forEach((doc) => {
      topUsers.push({ id: doc.id, ...doc.data() })
    })
    return topUsers
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error)
    return []
  }
}

export async function getTopUsersByLevel() {
  const usersRef = collection(db, 'users')

  // Utilisez d'abord orderBy pour le niveau, puis pour l'xp pour gérer les égalités
  const q = query(usersRef, orderBy('level', 'desc'), orderBy('xp', 'desc'), limit(10))

  try {
    const querySnapshot = await getDocs(q)
    const topUsers = []
    querySnapshot.forEach((doc) => {
      topUsers.push({ id: doc.id, ...doc.data() })
    })
    return topUsers
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error)
    return []
  }
}

export async function getPlayerRank(userId) {
  const usersRef = collection(db, 'users')
  const q = query(
    usersRef,
    orderBy('stats.mmr', 'desc'),
    orderBy('level', 'desc'),
    orderBy('xp', 'desc')
  )
  const querySnapshot = await getDocs(q)

  let rank = 0
  let found = false

  for (const doc of querySnapshot.docs) {
    rank++

    if (doc.id === userId) {
      found = true
      break
    }
  }

  return found ? rank : null
}

export async function getTotalPlayers() {
  const usersRef = collection(db, 'users')
  const snapshot = await getDocs(usersRef)
  return snapshot.size
}

export function getSkinsWithLevel() {
  const skinsWithLevel = allSkins
    .filter((skin) => skin.hasOwnProperty('level') && typeof skin.level === 'number')
    .sort((a, b) => a.level - b.level)

  return skinsWithLevel
}

export function getSkinsByLevel(level) {
  // Filtrer les objets qui ont un 'level' égal à l'entrée
  return allSkins.filter((skin) => skin.level === level)
}

export function getArenaPattern() {
  const arenaPatterns = [
    [[31, 27, 28, 24, 0, 4, 3, 7], [2, 29], 'Colisée'],
    [[26, 25, 5, 6], [0, 31], 'Grande salle'],
    [[19, 12, 8, 23], [3, 28], 'Zigzag'],
    [[10, 8, 23, 21, 31, 0, 1, 30], [3, 28], 'Chaos'],
    [[13, 18, 1, 30], [3, 28], 'Couloirs'],
    [[23, 31, 27, 8, 4, 0], [3, 28], 'Diagonale'],
    [[6, 25, 16, 12, 19, 15], [2, 29], 'Sablier']
  ]

  return arenaPatterns.map((pattern, index) => ({
    id: index,
    pattern
  }))
}

export function getRandomPattern() {
  const arenas = getArenaPattern()

  return getRandomFromArray(arenas, 1)[0].pattern
}

export function isUnlocked(item, userInfo) {
  let levelCondition = item.level ? userInfo.level >= item.level : true
  let flagCondition = item.flag ? userInfo.flags && userInfo.flags.includes(item.flag) : true
  let achievementCondition = item.achievement
    ? userInfo.achievements && userInfo.achievements.includes(item.achievement)
    : true

  return levelCondition && flagCondition && achievementCondition
}

export function isCardMine(card, pattern, playerID) {
  for (let cell of pattern) {
    if (cell.card && cell.card.uniqueID === card.uniqueID) {
      return cell.owner === playerID
    }
  }
  return false
}

export async function findGameByPlayerId(playerId) {
  const lobbiesRef = collection(db, 'lobbies')

  // Créer deux requêtes pour les deux cas possibles
  const userRef = doc(db, 'users', playerId)
  const queryJ1 = query(lobbiesRef, where('j1', '==', userRef))
  const queryJ2 = query(lobbiesRef, where('j2', '==', userRef))

  // Exécuter les requêtes
  const [j1Snapshot, j2Snapshot] = await Promise.all([getDocs(queryJ1), getDocs(queryJ2)])

  // Vérifier les résultats
  if (!j1Snapshot.empty) {
    return j1Snapshot.docs[0].id
  } else if (!j2Snapshot.empty) {
    return j2Snapshot.docs[0].id
  }

  return false
}

export async function reconnectInGame(room, disconnected, id) {
  const filteredDisconnected = disconnected.filter((disconnectedId) => disconnectedId !== id)
  await updateDoc(doc(db, 'games', room), {
    disconnected: filteredDisconnected
  })
}
