import { createContext, useState, useEffect, useContext } from 'react'
import { getAuth, onAuthStateChanged, updateEmail } from 'firebase/auth'
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { ref, onValue, set, onDisconnect } from 'firebase/database'
import { db, realtimeDb } from './Firebase'
import { toast } from 'react-toastify'
import useSound from 'use-sound'
import achievementSfx from './assets/sfx/notification_achievement.mp3'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState({})
  const [userSettings, setUserSettings] = useState({})
  const [playAchievementSound] = useSound(achievementSfx, {
    volume: userSettings.sfxVolume
  })

  const tryAuth = async () => {
    const auth = getAuth()

    // La fonction pour gérer les changements d'état d'authentification
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
    // Charger les paramètres depuis Electron Store au démarrage
    window.api.invoke('get-settings').then((settings) => {
      console.log(settings)
      setUserSettings(settings)
    })

    // Initialiser l'authentification
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
      const userInfo = {
        email: currentUser.email,
        username: userData.username || 'blank',
        primaryColor: userData.primaryColor,
        secondaryColor: userData.secondaryColor,
        profilePic: userData.profilePic,
        profileBorder: userData.profileBorder,
        flags: userData.flags || [],
        title: userData.title,
        banner: userData.banner,
        friends: [],
        honor: userData.honor || 0,
        honored: userData.honored || 0,
        level: userData.level,
        xp: userData.xp,
        stats: {
          gamesPlayed: userData.stats?.gamesPlayed || 0,
          victories: userData.stats?.victories || 0,
          mmr: userData.stats?.mmr || 500,
          winStreak: userData.stats?.winStreak || 0,
          longestWinStreak: userData.stats?.longestWinStreak || 0
        },
        status: userData.status,
        currentLobby: userData.currentLobby,
        achievements: userData.achievements || [],
        matchSummaries: userData.matchSummaries || []
      }
      setUserInfo(userInfo)
    }
  }

  const resetUserState = () => {
    console.log('reset')
    setUser(false)
    setUserInfo(false)
  }

  const updateOnlineStatus = async (userId, isDisconnecting) => {
    const statusRef = ref(realtimeDb, '/status/' + userId)
    if (isDisconnecting) {
      // Mettre à jour directement le statut sur "offline" lors de la déconnexion
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
    toast.success('Les modifications ont correctement été appliquées.')
    setUserInfo((prev) => ({ ...prev, ...updates }))
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
    // Sauvegarder les paramètres dans Electron Store
    window.api.send('settings', userSettings)
    toast.success('Les modifications ont correctement été appliquées.')
  }

  const assignUserToLobby = async (lobbyId) => {
    if (!user) return // S'assurer qu'un utilisateur est connecté
    const userRef = doc(db, 'users', user.uid) // Référence au document de l'utilisateur
    const lobbyRef = doc(db, 'lobbies', lobbyId) // Référence au document du lobby

    // Mettre à jour le document de l'utilisateur avec la référence au lobby
    await updateDoc(userRef, {
      currentLobby: lobbyRef
    })

    const lobbyDoc = await getDoc(lobbyRef)
    if (!lobbyDoc.exists()) {
      console.error("Le lobby spécifié n'existe pas")
      return
    }
    const lobbyData = lobbyDoc.data()

    // Déterminer si l'utilisateur doit être assigné à j1 ou j2
    const updatePayload = {}
    if (!lobbyData.j1) {
      updatePayload.j1 = userRef // Assigner l'utilisateur à j1 s'il est libre
    } else if (!lobbyData.j2) {
      updatePayload.j2 = userRef // Sinon, essayer d'assigner à j2 s'il est libre
    } else {
      console.error('Le lobby est plein')
      return
    }

    // Mettre à jour le document du lobby avec le nouvel utilisateur
    await updateDoc(lobbyRef, updatePayload)

    console.log('Utilisateur assigné au lobby avec succès')
  }

  const giveAchievement = async (achievement) => {
    if (!user) return

    const userRef = doc(db, 'users', user.uid)

    // Récupérer les données utilisateur actuelles
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) return

    const userData = userSnap.data()

    // Vérifier si l'utilisateur a déjà l'achievement
    if (userData.achievements && userData.achievements.includes(achievement.id)) {
      return
    }

    // Ajouter l'achievement à la liste des achievements de l'utilisateur
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
    giveAchievement
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
