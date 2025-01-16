import React, { createContext, useState, useEffect, useContext } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from './Firebase'

export const ServerContext = createContext()

export const ServerProvider = ({ children }) => {
  const [serverStatus, setServerStatus] = useState(null)
  const [serverMessage, setServerMessage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Référence au document "main_server" dans la collection "server_status"
    const serverDocRef = doc(db, 'server_status', 'main_server')

    // Écoute en temps réel les changements sur le document
    const unsubscribe = onSnapshot(
      serverDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data()
          setServerStatus(data.status) // Mettre à jour le statut du serveur
          setServerMessage(data.message)
        } else {
          console.error("Le document 'main_server' n'existe pas.")
          setServerStatus(null)
          setServerMessage(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Erreur lors de l’écoute des mises à jour de Firestore :', error)
        setServerStatus(null)
        setLoading(false)
        setServerMessage(null)
      }
    )

    // Nettoyer l'abonnement à la sortie du composant
    return () => unsubscribe()
  }, [])

  const contextValue = {
    serverStatus,
    serverMessage,
    loading
  }

  return <ServerContext.Provider value={contextValue}>{children}</ServerContext.Provider>
}

// Hook personnalisé pour utiliser le contexte ServerContext
export const useServerContext = () => {
  return useContext(ServerContext)
}
