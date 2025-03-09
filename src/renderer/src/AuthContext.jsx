import { createContext, useState, useEffect, useContext } from 'react'
import { getAuth, onAuthStateChanged, updateEmail } from 'firebase/auth'
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  collection,
  setDoc,
  getDocs,
  deleteDoc
} from 'firebase/firestore'
import { ref, onValue, set, onDisconnect } from 'firebase/database'
import { db, realtimeDb } from './Firebase'
import { toast } from 'react-toastify'
import useSound from 'use-sound'
import achievementSfx from './assets/sfx/notification_achievement.mp3'
import { getAchievementById } from './components/controllers/AchievementsController'
import { createUserInfo, getCurrentSeason, useSendMessage } from './components/others/toolBox'
import rankedSeasons from './jsons/rankedSeasons.json'
import changelog from './jsons/changelog.json'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [readyToCheckSeasons, setReadyToCheckSeasons] = useState(false)
  const [userInfo, setUserInfo] = useState({})
  const [userSettings, setUserSettings] = useState({})
  const sendMessage = useSendMessage()
  const [playAchievementSound] = useSound(achievementSfx, {
    volume: userSettings.sfxVolume
  })

  const tryAuth = async () => {
    const auth = getAuth()

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log('Utilisateur connecté:', currentUser)
        await updateUserState(currentUser)
      } else {
        console.log('Utilisateur déconnecté')
        resetUserState()
      }
    })

    return () => unsubscribe()
  }

  useEffect(() => {
    window.api.invoke('get-settings').then((settings) => {
      setUserSettings(settings)
    })

    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log('Utilisateur connecté:', currentUser)
        await updateUserState(currentUser)
      } else {
        console.log('Utilisateur déconnecté')
      }
    })

    return () => unsubscribe()
  }, [])

  const updateUserState = async (currentUser) => {
    setUser(currentUser)
    const userRef = doc(db, 'users', currentUser.uid)
    const docSnap = await getDoc(userRef)

    if (docSnap.exists()) {
      const userData = docSnap.data()

      // Fetch decks from the user's 'decks' subcollection
      const decksRef = collection(db, `users/${currentUser.uid}/decks`)
      const decksSnapshot = await getDocs(decksRef)
      const decks = decksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      const userPastSeasonsRef = collection(db, `users/${currentUser.uid}/seasons`)
      const userPastSeasonsSnapshot = await getDocs(userPastSeasonsRef)
      const userPastSeasons = userPastSeasonsSnapshot.docs.map((doc) => ({
        ...doc.data()
      }))

      const userInfo = createUserInfo(
        userData,
        decks,
        currentUser.email,
        currentUser.uid,
        userPastSeasons
      )
      setUserInfo(userInfo)
      setReadyToCheckSeasons(true)
    }
  }

  const resetUserState = () => {
    setUser(false)
    setUserInfo(false)
  }

  // Function to save a new deck
  const saveDeck = async (deckName, deckCards, deckCost) => {
    if (!user) return
    const deckRef = doc(collection(db, `users/${user.uid}/decks`)) // Reference to the new deck document
    await setDoc(deckRef, {
      name: deckName,
      cards: deckCards,
      cost: deckCost,
      creator: userInfo.username,
      createdAt: Date.now(),
      ver: changelog.slice(-1)[0].title
    })
    // Update userInfo with the new deck
    setUserInfo((prev) => ({
      ...prev,
      decks: [
        ...prev.decks,
        {
          id: deckRef.id,
          name: deckName,
          cards: deckCards,
          cost: deckCost,
          creator: userInfo.username,
          ver: changelog.slice(-1)[0].title
        }
      ]
    }))
    await giveAchievement('HF_deckCreator')
    sendMessage(`Deck "${deckName}" sauvegardé avec succès!`, 'success')
  }

  // Function to modify an existing deck
  const modifyDeck = async (deckId, updatedDeck) => {
    if (!user) return
    updatedDeck.ver = changelog.slice(-1)[0].title
    const deckRef = doc(db, `users/${user.uid}/decks`, deckId)
    await updateDoc(deckRef, updatedDeck)

    // Update the decks in userInfo
    setUserInfo((prev) => ({
      ...prev,
      decks: prev.decks.map((deck) => (deck.id === deckId ? { ...deck, ...updatedDeck } : deck)),
      ver: changelog.slice(-1)[0].title
    }))
    sendMessage(`Deck "${updatedDeck.name}" modifié avec succès!`, 'success')
  }

  const deleteDeck = async (deckId) => {
    if (!user) return
    const deckRef = doc(db, `users/${user.uid}/decks`, deckId)

    try {
      // Delete the deck from Firestore
      await deleteDoc(deckRef)

      // Update userInfo to remove the deleted deck from the decks list
      setUserInfo((prev) => ({
        ...prev,
        decks: prev.decks.filter((deck) => deck.id !== deckId)
      }))

      sendMessage(`Deck supprimé avec succès!`, 'success')
    } catch (error) {
      console.error('Erreur lors de la suppression du deck :', error)
      sendMessage(`Échec de la suppression du deck!`, 'error')
    }
  }

  const updateOnlineStatus = async (userId, isDisconnecting) => {
    const statusRef = ref(realtimeDb, '/status/' + userId)
    if (isDisconnecting) {
      await set(statusRef, { state: 'offline', last_changed: Date.now() })
    } else {
      const connectedRef = ref(realtimeDb, '.info/connected')
      onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === false) {
          onDisconnect(statusRef).set({
            state: 'offline',
            last_changed: Date.now()
          })
        } else {
          set(statusRef, { state: 'online', last_changed: Date.now() })
        }
      })
    }
  }

  const updateUser = async (updates) => {
    if (!user) return
    const userRef = doc(db, 'users', user.uid)
    await updateDoc(userRef, updates)
    updateUserState(user)
    sendMessage('Les modifications ont correctement été appliquées.', 'success')
  }

  const changeEmail = async (newEmail) => {
    const auth = getAuth()
    const currentUser = auth.currentUser
    if (currentUser) {
      try {
        await updateEmail(currentUser, newEmail)
        console.log('Email mis à jour avec succès')
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'email :", error)
      }
    }
  }

  const saveSettings = () => {
    window.api.send('settings', userSettings)
    sendMessage('Les modifications ont correctement été appliquées.', 'success')
  }

  const assignUserToLobby = async (lobbyId) => {
    if (!user) return
    const userRef = doc(db, 'users', user.uid)
    const lobbyRef = doc(db, 'lobbies', lobbyId)

    await updateDoc(userRef, {
      currentLobby: lobbyRef
    })

    const lobbyDoc = await getDoc(lobbyRef)
    if (!lobbyDoc.exists()) {
      console.error("Le lobby spécifié n'existe pas")
      return
    }
    const lobbyData = lobbyDoc.data()

    const updatePayload = {}
    if (!lobbyData.j1) {
      updatePayload.j1 = userRef
    } else if (!lobbyData.j2) {
      updatePayload.j2 = userRef
    } else {
      console.error('Le lobby est plein')
      return
    }

    await updateDoc(lobbyRef, updatePayload)
    console.log('Utilisateur assigné au lobby avec succès')
  }

  const giveAchievement = async (achievementName) => {
    if (!user && !userInfo) return
    const achievement = getAchievementById(achievementName)

    if (userInfo.achievements && userInfo.achievements.includes(achievement.id)) {
      return
    }

    const userRef = doc(db, 'users', user.uid)
    await updateDoc(userRef, {
      achievements: arrayUnion(achievement.id)
    })

    playAchievementSound()
    toast.success(
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img width={50} style={{ marginRight: '10px' }} src={achievement.url} />
        <span>Succès obtenu : {achievement.name}</span>
      </div>,
      {
        icon: false
      }
    )

    setUserInfo((prev) => ({
      ...prev,
      achievements: [...prev.achievements, achievement.id]
    }))
  }

  const handleEndOfSeason = async () => {
    const currentTime = Math.floor(Date.now() / 1000) // Timestamp actuel

    // Obtenir les saisons passées (celles dont la date de fin est dépassée)
    const pastSeasons = rankedSeasons.filter((season) => currentTime >= season.endDate)
    if (pastSeasons.length === 0) {
      console.log('Aucune saison passée à traiter.')
      return
    }

    // Sélectionner la saison précédente (la dernière dans la liste des saisons passées)
    const previousSeason = pastSeasons[pastSeasons.length - 1]

    // Vérifier si l'utilisateur est connecté et a des statistiques disponibles
    if (!user || !userInfo || !userInfo.stats) {
      console.log('Aucun utilisateur ou statistiques non disponibles.')
      return
    }

    const userId = user.uid
    const { pr, maxPr, prSeasonId } = userInfo.stats

    // Vérifier si les récompenses pour la saison précédente ont déjà été attribuées

    if (userInfo.pastSeasons.find((season) => season.id === previousSeason.id)) {
      console.log(
        `Les récompenses pour la saison ${previousSeason.name} ont déjà été attribuées pour l'utilisateur ${userId}.`
      )
      return
    }

    // Vérifier que les pr et maxPr correspondent à la saison précédente
    if (prSeasonId !== previousSeason.id) {
      console.log(`L'utilisateur ${userId} n'a pas joué pendant la saison précédente.`)
      return
    }

    // Vérifier si le joueur a un pr > 0
    if (pr > 0) {
      // Calcul du rang atteint en fonction de maxPr
      let rankReached = 1 // Bronze par défaut
      if (maxPr >= 500 && maxPr <= 999) {
        rankReached = 2 // Argent
      } else if (maxPr >= 1000 && maxPr <= 1499) {
        rankReached = 3 // Or
      } else if (maxPr >= 1500 && maxPr <= 1999) {
        rankReached = 4 // Diamant
      } else if (maxPr >= 2000) {
        rankReached = 5 // Maître
      }

      // Stocker les stats dans un sous-document pour la saison précédente
      const userRef = doc(db, 'users', userId)
      const seasonStatsRef = doc(userRef, 'seasons', previousSeason.id)
      await setDoc(seasonStatsRef, {
        pr,
        maxPr,
        id: previousSeason.id,
        rankReached
      })

      console.log(
        `Les récompenses pour la saison ${previousSeason.name} ont été attribuées à l'utilisateur ${userId}.`
      )

      // Réinitialiser les stats pr et maxPr à 0 et mettre à jour prSeasonId pour la nouvelle saison
      const currentSeason = getCurrentSeason()
      const newPrSeasonId = currentSeason ? currentSeason.id : null

      const newBasePr = Math.ceil(pr > 3000 ? 1500 : pr / 2)
      await updateDoc(userRef, {
        'stats.pr': newBasePr,
        'stats.maxPr': newBasePr,
        'stats.prSeasonId': newPrSeasonId
      })

      // Mettre à jour userInfo localement

      setUserInfo((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          pr: newBasePr,
          maxPr: newBasePr,
          prSeasonId: newPrSeasonId
        },
        pastSeasons: [
          ...prev.pastSeasons, // Copie les éléments existants de pastSeasons
          {
            pr,
            maxPr,
            id: previousSeason.id,
            rankReached
          }
        ]
      }))
      sendMessage(
        `La ${previousSeason.name} est terminée ! Vos récompenses de saisons vous attendent sur votre profil.`,
        'success'
      )
      console.log(`L'utilisateur ${userId} a été mis à jour pour la fin de la saison.`)
    } else {
      console.log(`L'utilisateur ${userId} n'a pas joué pendant la saison précédente.`)
    }
  }

  const addIdToUserList = async (field, itemId, coinsCost = 0, amountOfItemBuyed) => {
    if (!user) {
      console.error('Aucun utilisateur connecté.')
      return
    }

    try {
      // 1. Récupérer le nombre de coins actuels côté local
      const currentCoins = userInfo?.stats?.coins ?? 0

      // 2. Si le paramètre coinsCost est supérieur à 0,
      //    on vérifie que l'utilisateur a assez de pièces
      if (coinsCost > 0) {
        if (currentCoins < coinsCost) {
          // Pas assez de coins
          sendMessage?.("Vous n'avez pas suffisamment de pièces pour acheter ceci.", 'error')
          return
        }
      }

      // 3. Préparer l'objet de mise à jour Firestore
      //    - On utilise arrayUnion pour ajouter itemId
      //    - On déduit le coût si coinsCost > 0
      const userRef = doc(db, 'users', user.uid)
      const updatePayload = {
        [field]: arrayUnion(itemId)
      }

      // S'il y a un coût, on met à jour stats.coins
      if (coinsCost > 0) {
        updatePayload['stats.coins'] = currentCoins - coinsCost
      }

      // 4. Mettre à jour dans Firestore
      await updateDoc(userRef, updatePayload)

      // 5. Mettre à jour localement l’état userInfo pour refléter immédiatement la modification
      setUserInfo((prev) => {
        if (!prev) return prev // Sécurité si jamais userInfo est vide

        // Récupérer le tableau existant (flags, alternates, etc.)
        const currentArray = prev[field] || []

        // Vérifier si l'ID est déjà présent (arrayUnion évite le doublon côté Firestore,
        // mais on fait de même en local pour éviter toute redondance)
        const newArray = currentArray.includes(itemId) ? currentArray : [...currentArray, itemId]

        // Mettre à jour coins si nécessaire
        let newCoins = prev.stats?.coins ?? 0
        if (coinsCost > 0) {
          newCoins = newCoins - coinsCost
        }

        return {
          ...prev,
          [field]: newArray,
          stats: {
            ...prev.stats,
            coins: newCoins
          }
        }
      })

      // 6. Message de succès
      sendMessage?.(coinsCost > 0 ? `Achat réussi !` : `Récompense obtenue.`, 'success')
      if (coinsCost > 0) await giveAchievement('HF_shopBuy')
      console.log(amountOfItemBuyed)
      if (amountOfItemBuyed + 1 >= 10) await giveAchievement('HF_shopBuy10')
      if (amountOfItemBuyed + 1 >= 20) await giveAchievement('HF_shopBuy20')
    } catch (error) {
      console.error(`Erreur lors de l’ajout de l’ID "${itemId}" à "${field}" :`, error)
      sendMessage?.(`Erreur lors de l’ajout de "${itemId}".`, 'error')
    }
  }

  useEffect(() => {
    if (user && userInfo && userInfo.pastSeasons && readyToCheckSeasons) {
      const currentSeason = getCurrentSeason()
      if (userInfo.stats.prSeasonId !== currentSeason.id) {
        handleEndOfSeason()
      }
      setReadyToCheckSeasons(false)
    }
  }, [readyToCheckSeasons])

  const contextValue = {
    user,
    userInfo,
    userSettings,
    setUserSettings,
    changeEmail,
    loading,
    updateUserState,
    updateOnlineStatus,
    updateUser,
    saveSettings,
    assignUserToLobby,
    tryAuth,
    giveAchievement,
    saveDeck,
    modifyDeck,
    deleteDeck,
    addIdToUserList
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
