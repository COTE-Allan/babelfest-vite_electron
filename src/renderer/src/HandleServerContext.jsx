import { createContext, useContext, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { ref, set } from 'firebase/database'
import { toast } from 'react-toastify'
import { auth, realtimeDb } from './Firebase'
import { ServerContext } from './ServerContext'
import { AuthContext } from './AuthContext'
import { useSendMessage } from './components/others/toolBox'

export const HandleServerContext = createContext()

export const HandleServerProvider = ({ children }) => {
  const { serverStatus, serverMessage } = useContext(ServerContext)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const sendMessage = useSendMessage()

  const updateOnlineStatus = async (userId) => {
    const statusRef = ref(realtimeDb, '/status/' + userId)
    await set(statusRef, { state: 'offline', last_changed: Date.now() })
  }

  useEffect(() => {
    async function handleServerStatusSwap() {
      if (serverStatus === 'offline') {
        toast.error('Les serveurs sont maintenant déconnectés.')
        await updateOnlineStatus(user.uid)
        await signOut(auth)
        navigate('/login')
      }
    }

    handleServerStatusSwap()
  }, [serverStatus])

  useEffect(() => {
    if (serverMessage && serverMessage.active) {
      sendMessage(serverMessage.string, 'warn', 30000)
    }
  }, [serverMessage])

  return <HandleServerContext.Provider>{children}</HandleServerContext.Provider>
}

// Hook personnalisé pour utiliser le contexte ServerContext
export const useHandleServerContext = () => {
  return useContext(HandleServerContext)
}
