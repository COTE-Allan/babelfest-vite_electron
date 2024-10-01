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
import { useSendMessage } from './components/others/toolBox'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
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

      const userInfo = {
        email: currentUser.email,
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
        stats: {
          gamesPlayed: userData.stats?.gamesPlayed || 0,
          victories: userData.stats?.victories || 0,
          mmr: userData.stats?.mmr || 500,
          winStreak: userData.stats?.winStreak || 0,
          longestWinStreak: userData.stats?.longestWinStreak || 0
        },
        status: userData.status || null,
        currentLobby: userData.currentLobby || null,
        achievements: userData.achievements || [],
        matchSummaries: userData.matchSummaries || [],
        decks // Add decks to the userInfo
      }
      setUserInfo(userInfo)
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
      createdAt: Date.now()
    })
    // Update userInfo with the new deck
    setUserInfo((prev) => ({
      ...prev,
      decks: [...prev.decks, { id: deckRef.id, name: deckName, cards: deckCards }]
    }))
    await giveAchievement('HF_deckCreator')
    sendMessage(`Deck "${deckName}" sauvegardé avec succès!`, 'success')
  }

  // Function to modify an existing deck
  const modifyDeck = async (deckId, updatedDeck) => {
    if (!user) return
    const deckRef = doc(db, `users/${user.uid}/decks`, deckId)
    await updateDoc(deckRef, updatedDeck)

    // Update the decks in userInfo
    setUserInfo((prev) => ({
      ...prev,
      decks: prev.decks.map((deck) => (deck.id === deckId ? { ...deck, ...updatedDeck } : deck))
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
    deleteDeck
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
