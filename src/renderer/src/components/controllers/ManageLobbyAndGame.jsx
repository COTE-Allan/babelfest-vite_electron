import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  writeBatch
} from 'firebase/firestore'
import { db } from '../../Firebase'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../AuthContext'
import { useContext } from 'react'
import { getAllCards } from '../others/toolBox'
import { drawRandomCards, generateDeck, getCardsFromArray } from '../effects/editCards'
import { HeadOrTails } from '../effects/basics'

// Créer un lobby et le rejoindre
export function useCreateLobby() {
  const { assignUserToLobby } = useContext(AuthContext)
  const navigate = useNavigate()

  const createLobby = async (lobbyData, rivalId) => {
    const docRef = await addDoc(collection(db, 'lobbies'), {
      ...lobbyData
    })

    await assignUserToLobby(docRef.id)

    if (rivalId) {
      await updateDoc(doc(db, 'matchmaking', rivalId), {
        lobbyFound: docRef.id
      })
    }

    navigate(`/lobby/${docRef.id}`)
  }

  return createLobby
}

export function useJoinLobby() {
  const { assignUserToLobby } = useContext(AuthContext)
  const navigate = useNavigate()

  const joinLobby = async (lobbyId, rejoin = false) => {
    if (!rejoin) await assignUserToLobby(lobbyId)
    navigate(`/lobby/${lobbyId}`)
  }
  return joinLobby
}

export function useLeaveLobby() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const leaveLobby = async (lobbyId, leaveByDisconnect = false, gamemode, inGame = true) => {
    if (!user) return

    try {
      const lobbyRef = doc(db, 'lobbies', lobbyId)
      const lobbyDoc = await getDoc(lobbyRef)

      if (lobbyDoc.exists()) {
        const lobbyData = lobbyDoc.data()

        // Determine if the user is j1 or j2
        const isJ1 = lobbyData.j1 && lobbyData.j1.id === user.uid
        const isJ2 = lobbyData.j2 && lobbyData.j2.id === user.uid

        // Prepare update payload for lobby
        const updatePayload = {}

        // Handle ready statuses
        if (isJ1) {
          updatePayload.readyj1 = null
        } else if (isJ2) {
          updatePayload.readyj2 = null
        }

        // Handle player leaving
        if (isJ1) {
          if (lobbyData.j2) {
            // Promote j2 to j1
            updatePayload.j1 = lobbyData.j2
            updatePayload.j2 = null
            // Move readyj2 to readyj1
            updatePayload.readyj1 = lobbyData.readyj2 || null
            updatePayload.readyj2 = null
          } else {
            // No j2, set j1 to null
            updatePayload.j1 = null
          }
        } else if (isJ2) {
          // Remove j2
          updatePayload.j2 = null
        }

        // Update the lobby document
        await updateDoc(lobbyRef, updatePayload)

        // After updating, check if lobby is empty
        const updatedLobbyDoc = await getDoc(lobbyRef)
        if (updatedLobbyDoc.exists()) {
          const updatedLobbyData = updatedLobbyDoc.data()
          if (!updatedLobbyData.j1 && !updatedLobbyData.j2) {
            // Delete the lobby document
            await deleteDoc(lobbyRef)
          }
        }

        // Handle game document if necessary
        if (lobbyData.gameRef) {
          const gameRef = doc(db, 'games', lobbyData.gameRef)
          const gameDoc = await getDoc(gameRef)

          if (gameDoc.exists()) {
            const gameData = gameDoc.data()
            if (!gameData.finished) {
              await updateDoc(gameRef, {
                finished: isJ1 ? 2 : isJ2 ? 1 : null,
                revenge: { state: 'quit', id: isJ1 ? 1 : 2 }
              })
            } else {
              await updateDoc(gameRef, {
                revenge: { state: 'quit', id: isJ1 ? 1 : 2 }
              })
            }
          } else {
            console.error('Game document does not exist!')
          }
        }
      } else {
        console.error('Lobby document does not exist!')
      }

      // Update user's currentLobby to null
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, { currentLobby: null })

      navigate(gamemode === 'custom' ? '/lobbyList' : '/home')
    } catch (error) {
      console.error('Error leaving lobby: ', error)
    }
  }

  return leaveLobby
}

export function useCreateGame() {
  async function createGame(
    lobbyId,
    j1Ref,
    j2Ref,
    room = null,
    gameSettings = null,
    gameMode = 'custom',
    deckJ1,
    deckJ2,
    deckType = 'random'
  ) {
    let gameDocRef
    // Création ou mise à jour du document de jeu avec les objets utilisateur complets
    if (room === null) {
      // Récupération des données des utilisateurs
      const j1Doc = await getDoc(j1Ref)
      const j2Doc = await getDoc(j2Ref)

      // Assurez-vous que les documents existent avant de continuer
      if (!j1Doc.exists() || !j2Doc.exists()) {
        console.error('Un des joueurs est introuvable dans la base de données.')
        return
      }

      // Extraire les données de l'utilisateur et ajouter l'ID
      const j1 = { id: j1Ref.id, ...j1Doc.data() }
      const j2 = { id: j2Ref.id, ...j2Doc.data() }
      j1.placementLeft = 4
      j1.movesLeft = 4
      j2.placementLeft = 4
      j2.movesLeft = 4
      gameDocRef = await addDoc(collection(db, 'games'), {
        created: Date.now(),
        finished: false,
        phase: 1,
        activePlayer: 0,
        player1: j1,
        player2: j2,
        deckJ1: deckJ1,
        deckJ2: deckJ2,
        standby: false,
        revenge: null,
        lobbyId: lobbyId,
        turn: 1,
        gamemode: gameMode,
        settings: gameSettings,
        deckType: deckType
      })
    } else {
      const roomRef = doc(db, 'games', room)
      await updateDoc(roomRef, {
        created: Date.now(),
        finished: false,
        phase: 1,
        activePlayer: 0,
        ['player1.receiveRewards']: false,
        ['player1.placementLeft']: 4,
        ['player1.movesLeft']: 4,
        ['player2.placementLeft']: 4,
        ['player2.movesLeft']: 4,
        ['player2.receiveRewards']: false,
        standby: false,
        revenge: null,
        turn: 1,
        redraw: null
      })
      gameDocRef = roomRef
    }

    // Référence pour la collection 'arena' du jeu créé
    const arenaColRef = collection(db, 'games', gameDocRef.id, 'arena')
    const batch = writeBatch(db)

    // Configuration de l'arène
    const amount = 32
    const chosenArena = gameSettings.map
    const cellToRemove = chosenArena.cellToRemove
    const bases = chosenArena.bases

    const getCoordinates = (index) => {
      const rowLetters = ['A', 'B', 'C', 'D']
      const rows = rowLetters.length
      const col = Math.floor(index / rows) + 1
      const row = rowLetters[index % rows]
      return `${row}${col}`
    }

    // Création des cellules de l'arène
    const arenaBatchData = Array.from({ length: amount }).map((_, index) => {
      const side = index < amount / 2 ? 1 : 2
      const cellName = `cell-${index}`
      const coordinate = getCoordinates(index)
      const cellRef = doc(arenaColRef, cellName)
      return {
        ref: cellRef,
        data: {
          id: index,
          coordinate: coordinate,
          exist: !cellToRemove.includes(index),
          side: side,
          card: null,
          base: index === bases[0] || index === bases[1],
          owner: null,
          burn: null
        }
      }
    })

    // Ajout des cellules à la transaction
    arenaBatchData.forEach((item) => batch.set(item.ref, item.data))

    // Application de la transaction
    await batch.commit()

    await PopulateDeck(gameDocRef.id, gameSettings.cards, deckJ1, deckJ2)
    await DefineDefaultOrder(gameDocRef.id)

    // Mise à jour du document de lobby avec une référence au jeu créé
    const lobbyDocRef = doc(db, 'lobbies', lobbyId)
    await updateDoc(lobbyDocRef, {
      gameRef: gameDocRef.id
    })
  }
  return createGame
}

async function DrawCards(room, cardAmount) {
  const deck = await getDeck(room)

  if (!deck || deck.length === 0) {
    throw new Error('Deck is undefined or empty')
  }

  const totalDraw = cardAmount * 2 + 9
  const drawnCards = await drawRandomCards(deck, totalDraw)

  if (drawnCards.length < totalDraw) {
    throw new Error('Not enough cards drawn from the deck')
  }

  const hand1 = drawnCards.slice(0, cardAmount)
  const hand2 = drawnCards.slice(cardAmount, cardAmount * 2)
  const shop = drawnCards.slice(cardAmount * 2)

  await updateDoc(doc(db, 'games', room), {
    handJ1: hand1,
    handJ2: hand2,
    deck,
    shop
  })
}

async function DrawCardsWithRarityMax(room, cardAmount, deckJ1, deckJ2) {
  const deck = await getDeck(room)
  console.log()
  if (!deck || deck.length === 0) {
    throw new Error('Deck is undefined or empty')
  }

  // Draw 9 random cards for the shop
  const shop = await drawRandomCards(deck, 9)

  // Draw hands for both players with the rarity constraint

  let hand1, hand2
  if (deckJ1 && deckJ2) {
    hand1 = await getCardsFromArray(deckJ1.cards)
    hand2 = await getCardsFromArray(deckJ2.cards)
  } else {
    hand1 = generateDeck(cardAmount)
    hand2 = generateDeck(cardAmount)
  }

  // Update the game document in the database
  await updateDoc(doc(db, 'games', room), {
    handJ1: hand1,
    handJ2: hand2,
    deck,
    shop
  })
}
export async function getDeck(room) {
  const docRef = doc(db, 'games', room)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    let data = docSnap.data()
    return data.deck
  }
}

export async function PopulateDeck(room, cardsPerHand, deckJ1, deckJ2) {
  let cardsFiltered = getAllCards().filter((card) => card.rarity != 5)
  await updateDoc(doc(db, 'games', room), {
    deck: cardsFiltered
  })
  // await DrawCards(room, cardsPerHand)
  await DrawCardsWithRarityMax(room, cardsPerHand, deckJ1, deckJ2)
}

async function DefineDefaultOrder(room) {
  let coin = HeadOrTails()
  updateDoc(doc(db, 'games', room), {
    FirstToPlay: coin,
    activePlayer: coin
  })
}
