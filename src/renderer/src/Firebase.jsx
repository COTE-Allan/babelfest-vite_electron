import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyA3lTWRvFKDHytbZcGDtUIYoMZkOwo7qWI',
  authDomain: 'babelfest-fae77.firebaseapp.com',
  projectId: 'babelfest-fae77',
  storageBucket: 'babelfest-fae77.appspot.com',
  messagingSenderId: '279141342651',
  appId: '1:279141342651:web:4a4250cd2efcb781bdb89e',
  measurementId: 'G-C7T0QKS684',
  databaseURL: 'https://babelfest-fae77-default-rtdb.europe-west1.firebasedatabase.app'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const realtimeDb = getDatabase(app)
