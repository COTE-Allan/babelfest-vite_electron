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

import originCards from '../../jsons/cards/origine.json'
import reinforcementCards from '../../jsons/cards/renforts.json'
import babelfish from '../../jsons/cards/babelfish.json'
import mecanicaCards from '../../jsons/cards/mecanica.json'
import promoCards from '../../jsons/cards/promo.json'
import twentyfourCards from '../../jsons/cards/infini_2024.json'

import bordersData from '../../jsons/skins/borders.json'
import colorsData from '../../jsons/skins/colors.json'
import bannerData from '../../jsons/skins/banners.json'
import avatarData from '../../jsons/skins/avatars.json'
import titleData from '../../jsons/skins/titles.json'
import prestigeData from '../../jsons/skins/prestigeColor.json'

import rankedSeasons from '../../jsons/rankedSeasons.json'

const borders = bordersData.map((item, index) => ({
  ...item,
  id: `border-${index}`,
  type: 'Bordure'
}))

const colors = colorsData.map((item, index) => ({
  ...item,
  id: `color-${index}`,
  type: 'Couleur'
}))

const banner = bannerData.map((item, index) => ({
  ...item,
  id: `banner-${index}`,
  type: 'Bannière'
}))

const avatar = avatarData.map((item, index) => ({
  ...item,
  id: `avatar-${index}`,
  type: 'Avatar'
}))

const title = titleData.map((item, index) => ({
  ...item,
  id: `title-${index}`,
  type: 'Titre'
}))

const prestige = prestigeData.map((item, index) => ({
  ...item,
  id: `prestige-${index}`,
  type: 'Prestige'
}))

const allSkins = [...borders, ...colors, ...banner, ...avatar, ...title, ...prestige]

import useSound from 'use-sound'
import errorSfx from '../../assets/sfx/menu_unauthorized.mp3'
import successSfx from '../../assets/sfx/info_notification.mp3'
import infoSfx from '../../assets/sfx/info_notification.mp3'
import { toast } from 'react-toastify'
import { useContext } from 'react'
import { AuthContext } from '../../AuthContext'

// obtenir toute les cartes du jeu
export function getAllCards(getSpecials = true) {
  let cards = []
  let idCounter = 1 // Start the counter at 1

  // Function to add unique ID to each card and increment the counter
  const addUniqueId = (card) => {
    const cardWithId = { ...card, id: idCounter } // Add the current counter as the ID
    idCounter++ // Increment the counter for the next card
    return cardWithId
  }

  // TOUTES LES CARTES
  // Add unique IDs to all cards and combine them into one array
  cards.push(
    ...originCards.map(addUniqueId),
    ...reinforcementCards.map(addUniqueId),
    ...babelfish.map(addUniqueId),
    ...mecanicaCards.map(addUniqueId),
    ...promoCards.map(addUniqueId),
    ...twentyfourCards.map(addUniqueId)
  )

  if (!getSpecials) cards = cards.filter((card) => card.rarity !== 5)

  return cards
}

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

export function useSendMessage() {
  const context = useContext(AuthContext)
  const userSettings = context ? context.userSettings : { sfxVolume: 0.5 }
  const [info] = useSound(infoSfx, { volume: userSettings.sfxVolume })
  const [success] = useSound(successSfx, { volume: userSettings.sfxVolume })
  const [error] = useSound(errorSfx, { volume: userSettings.sfxVolume })

  const sendMessage = (msg, type = 'error') => {
    switch (type) {
      case 'warn':
        info()
        toast.warn(msg)
        break
      case 'error':
        error()
        toast.error(msg)
        break
      case 'info':
        info()
        toast.info(msg)
        break
      case 'success':
        success()
        toast.success(msg)
        break
      default:
        break
    }
  }

  return sendMessage
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

export async function getTotalAndOnlinePlayers() {
  const usersRef = collection(db, 'users')

  // Récupère toutes les données de la collection
  const snapshot = await getDocs(usersRef)

  // Compte total des utilisateurs
  const totalPlayers = snapshot.size

  // Compte des utilisateurs en ligne
  let onlinePlayers = 0
  snapshot.forEach((doc) => {
    const userData = doc.data()
    if (userData.status && userData.status.state === 'online') {
      onlinePlayers++
    }
  })

  // Retourne les deux valeurs
  return {
    totalPlayers,
    onlinePlayers
  }
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

export function getOnlineUsers(setUsersCallback) {
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('status.state', '==', 'online'))

  const unsubscribe = onSnapshot(q, (snapshot) => {
    // Récupère les utilisateurs en ligne sous forme d'array
    const onlineUsers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))

    // Trie par ordre alphabétique sur le champ 'username'
    onlineUsers.sort((a, b) => a.username.localeCompare(b.username))

    // Mise à jour avec la liste des utilisateurs triée
    setUsersCallback(onlineUsers)
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

export async function getTopUsersByMMR(amount = 10) {
  const usersRef = collection(db, 'users')

  // Requête pour trier par MMR descendant
  const q = query(usersRef, orderBy('stats.mmr', 'desc'), limit(amount))

  try {
    const querySnapshot = await getDocs(q)
    const topUsers = []
    let rank = 1

    querySnapshot.forEach((doc) => {
      // Vérifie si le champ `rank` existe et s'il est un objet, le supprime
      let userData = doc.data()
      if (typeof userData.rank === 'object') {
        console.warn(`Remplacement de rank objet pour l'utilisateur ${doc.id}`)
        delete userData.rank // Supprime l'ancien champ `rank`
      }

      // Ajoute l'utilisateur avec le rang mis à jour
      topUsers.push({ id: doc.id, rank, ...userData })
      rank++
    })

    return topUsers
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error)
    return []
  }
}

export async function getTopUsersByLevel(amount = 10) {
  const usersRef = collection(db, 'users')

  // Utiliser d'abord orderBy pour le niveau, puis pour l'xp pour gérer les égalités
  const q = query(usersRef, orderBy('level', 'desc'), orderBy('xp', 'desc'), limit(amount))

  try {
    const querySnapshot = await getDocs(q)
    const topUsers = []
    let rank = 1

    querySnapshot.forEach((doc) => {
      // Si le champ `rank` existe déjà dans les données et que c'est un objet, remplace-le
      let userData = doc.data()
      if (typeof userData.rank === 'object') {
        console.warn(`Remplacement de rank objet pour l'utilisateur ${doc.id}`)
        delete userData.rank // Supprimer l'ancien champ `rank`
      }

      // Ajouter l'utilisateur avec le rang mis à jour
      topUsers.push({ id: doc.id, rank, ...userData })
      rank++
    })

    return topUsers
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error)
    return []
  }
}

export async function getPlayerRank(userId) {
  const usersRef = collection(db, 'users')

  // Requête pour le classement basé sur le MMR
  const mmrQuery = query(usersRef, orderBy('stats.mmr', 'desc'))
  const mmrQuerySnapshot = await getDocs(mmrQuery)

  let mmrRank = 0
  let foundMmr = false

  for (const doc of mmrQuerySnapshot.docs) {
    mmrRank++

    if (doc.id === userId) {
      foundMmr = true
      break
    }
  }

  // Requête pour le classement basé sur le niveau et l'XP
  const levelXpQuery = query(usersRef, orderBy('level', 'desc'), orderBy('xp', 'desc'))
  const levelXpQuerySnapshot = await getDocs(levelXpQuery)

  let levelXpRank = 0
  let foundLevelXp = false

  for (const doc of levelXpQuerySnapshot.docs) {
    levelXpRank++

    if (doc.id === userId) {
      foundLevelXp = true
      break
    }
  }

  // **Nouvelle requête pour le classement basé sur le PR**
  const currentSeason = getCurrentSeason()
  const prQuery = query(
    usersRef,
    orderBy('stats.pr', 'desc'),
    where('stats.prSeasonId', '==', currentSeason.id)
  )
  const prQuerySnapshot = await getDocs(prQuery)

  let prRank = 0
  let foundPr = false

  for (const doc of prQuerySnapshot.docs) {
    prRank++

    if (doc.id === userId) {
      foundPr = true
      break
    }
  }

  return {
    mmrRank: foundMmr ? mmrRank : null,
    levelXpRank: foundLevelXp ? levelXpRank : null,
    prRank: foundPr ? prRank : null // Ajouter le prRank au retour
  }
}

export async function getTopUsersByPR(amount = 10) {
  const usersRef = collection(db, 'users')

  // Requête pour trier par PR descendant
  const currentSeason = getCurrentSeason()
  const q = query(
    usersRef,
    orderBy('stats.pr', 'desc'),
    limit(amount),
    where('stats.prSeasonId', '==', currentSeason.id)
  )

  try {
    const querySnapshot = await getDocs(q)
    const topUsers = []
    let rank = 1

    querySnapshot.forEach((doc) => {
      let userData = doc.data()

      // Vérifier si le champ `rank` existe et s'il est un objet, le supprimer
      if (typeof userData.rank === 'object') {
        console.warn(`Remplacement de rank objet pour l'utilisateur ${doc.id}`)
        delete userData.rank // Supprime l'ancien champ `rank`
      }

      // Ajouter l'utilisateur avec le rang mis à jour
      topUsers.push({ id: doc.id, rank, ...userData })
      rank++
    })

    return topUsers
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error)
    return []
  }
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

export function getSeasonalsSkins(seasonID) {
  const seasonalsSkins = allSkins
    .filter((skin) => skin.hasOwnProperty('rankedReward') && skin.rankedReward.id === seasonID)
    .sort((a, b) => a.rankedReward.rankNeeded - b.rankedReward.rankNeeded)

  // Initialize an array of 5 elements with "nothing" as default
  const result = new Array(5).fill('nothing')

  // Place skins in their corresponding rankNeeded index
  seasonalsSkins.forEach((skin) => {
    const index = skin.rankedReward.rankNeeded - 1 // Subtract 1 to match the array index (0-4)
    if (index >= 0 && index < 5) {
      result[index] = skin
    }
  })

  return result
}

export function getSkinsByLevel(level) {
  // Filtrer les objets qui ont un 'level' égal à l'entrée
  return allSkins.filter((skin) => skin.level === level)
}

export function getSkins() {
  // Filtrer les objets qui ont un 'level' égal à l'entrée
  return allSkins
}

export function getArenaPattern() {
  const arenaPatterns = [
    [[31, 27, 28, 24, 0, 4, 3, 7], [2, 29], 'Colisée'],
    [[26, 25, 5, 6], [0, 31], 'Grande salle'],
    [[19, 12, 8, 23], [3, 28], 'Zigzag'],
    [[10, 8, 23, 21, 31, 0, 1, 30], [3, 28], 'Chaos'],
    [[13, 18, 1, 30], [3, 28], 'Couloirs'],
    [[23, 31, 27, 8, 4, 0], [3, 28], 'Diagonale'],
    [[6, 25, 16, 12, 19, 15], [2, 29], 'Sablier'],
    [[29, 23, 20, 8, 11, 2], [1, 30], 'Insecte'],
    [[30, 2, 14, 18], [6, 26], 'Immeuble'],
    [[3, 28, 16, 15], [7, 24], 'Désaxé'],
    [[30, 31, 16, 0, 1, 15], [7, 24], 'Slalom'],
    [[31, 24, 23, 11, 3, 4], [1, 29], 'Face à Face'],
    [[22, 28, 9, 3], [5, 26], 'Domino'],
    [[0, 31], [28, 3], 'Simplicité']
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

export function getPlayerStats(stats) {
  const totalGamesPlayed = Object.values(stats.gamesPlayed).reduce(
    (total, current) => total + current,
    0
  )

  // Calcul du nombre de défaites
  const defeats = totalGamesPlayed - stats.victories

  // Calcul du pourcentage de victoires
  const winPercentage = totalGamesPlayed > 0 ? (stats.victories / totalGamesPlayed) * 100 : 0

  return {
    totalGamesPlayed,
    victories: stats.victories,
    defeats,
    winPercentage: winPercentage.toFixed(1),
    gamesPlayed: {
      quick: stats.gamesPlayed.quick ?? 0,
      ranked: stats.gamesPlayed.ranked ?? 0,
      custom: stats.gamesPlayed.custom ?? 0
    },
    pr: stats.pr,
    maxPr: stats.maxPr,
    mmr: stats.mmr,
    winStreak: stats.winStreak ?? 0,
    longestWinStreak: stats.longestWinStreak ?? 0
  }
}

export const getRankClass = (index) => {
  switch (index) {
    case 0:
      return 'maitre'
    case 1:
      return 'diamant'
    case 2:
      return 'or'
    case 3:
      return 'argent'
    case 4:
      return 'bronze'
    default:
      return ''
  }
}

export const getBackgroundStyle = (colorObject, direction = 'to bottom') => {
  if (typeof colorObject === 'string') {
    // Si colorObject est une chaîne de caractères, renvoyer directement cette chaîne
    return colorObject
  } else if (colorObject.gradient) {
    // Si colorObject est un objet avec un gradient, appliquer le dégradé
    return `linear-gradient(${direction}, ${colorObject.hex}, ${colorObject.gradient})`
  }
  // Si colorObject est un objet sans gradient, renvoyer la couleur hex
  return `linear-gradient(${direction}, ${colorObject.hex}, ${colorObject.hex})`
}

export function getAllUniqueArtists() {
  // Récupère toutes les cartes en utilisant la fonction getAllCards
  const allCards = getAllCards()

  // Utiliser un Set pour s'assurer qu'il n'y ait pas de doublons
  const uniqueArtists = new Set()

  // Parcourir chaque carte et ajouter l'artiste au Set (si l'artiste existe)
  allCards.forEach((card) => {
    if (card.author) {
      uniqueArtists.add(card.author)
    }
  })

  // Convertir le Set en tableau pour avoir une liste exploitable
  console.log(uniqueArtists)
  return Array.from(uniqueArtists)
}

export function generateLocalArena(cellsToRemove, bases) {
  const amount = 32

  const getCoordinates = (index) => {
    const rowLetters = ['A', 'B', 'C', 'D']
    const rows = rowLetters.length
    const col = Math.floor(index / rows) + 1
    const row = rowLetters[index % rows]
    return `${row}${col}`
  }

  return Array.from({ length: amount }).map((_, index) => {
    const side = index < amount / 2 ? 1 : 2
    return {
      id: index,
      coordinate: getCoordinates(index),
      exist: !cellsToRemove.includes(index),
      side: side,
      card: null,
      base: index === bases[0] || index === bases[1],
      owner: null
    }
  })
}

// Fonction pour récupérer des cartes basées sur un array d'ID
export function getCardsByIds(ids) {
  const allCards = getAllCards() // Récupère toutes les cartes
  const filteredCards = allCards
    .filter((card) => ids.includes(card.id)) // Filtre les cartes dont l'ID est dans le tableau d'IDs
    .sort((a, b) => a.rarity - b.rarity) // Trie les cartes par la rareté (en supposant que 'rarity' soit un nombre)

  return filteredCards
}

export function createUserInfo(userData, decks = null, email = null, id = null, pastSeasons) {
  console.log(userData.stats.maxPr)
  return {
    email,
    username: userData.username || 'blank',
    primaryColor: userData.primaryColor,
    secondaryColor: userData.secondaryColor,
    profilePic: userData.profilePic,
    profileBorder: userData.profileBorder || null,
    flags: userData.flags || [],
    title: userData.title,
    banner: userData.banner,
    friends: [],
    honor: userData.honor || 0,
    honored: userData.honored || 0,
    level: userData.level,
    xp: userData.xp,
    prestige: userData.prestige || null,
    id,
    stats: {
      gamesPlayed: userData.stats?.gamesPlayed || 0,
      victories: userData.stats?.victories || 0,
      mmr: userData.stats?.mmr || 500,
      winStreak: userData.stats?.winStreak || 0,
      longestWinStreak: userData.stats?.longestWinStreak || 0,
      pr: userData.stats.pr || 0,
      maxPr: userData.stats.maxPr || 0,
      prSeasonId: userData.stats.prSeasonId || null
    },
    status: userData.status || null,
    currentLobby: userData.currentLobby || null,
    achievements: userData.achievements || [],
    matchSummaries: userData.matchSummaries || [],
    decks,
    pastSeasons: pastSeasons || []
  }
}

export const getCurrentSeason = () => {
  if (!rankedSeasons || rankedSeasons.length === 0) {
    return null // ou une valeur par défaut
  }

  // Trier les saisons par date de début pour garantir l'ordre chronologique
  rankedSeasons.sort((a, b) => a.startDate - b.startDate)

  const currentTime = Math.floor(Date.now() / 1000) // Timestamp actuel
  const currentSeason = rankedSeasons.find(
    (season) => currentTime >= season.startDate && currentTime < season.endDate
  )

  // Si aucune saison actuelle n'est trouvée, renvoyer la dernière saison si elle est encore active
  if (!currentSeason) {
    const lastSeason = rankedSeasons[rankedSeasons.length - 1]
    return currentTime < lastSeason.endDate ? lastSeason : null
  }

  return currentSeason
}
