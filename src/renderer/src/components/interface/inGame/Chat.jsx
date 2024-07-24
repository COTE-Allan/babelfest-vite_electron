import '../../styles/interface/chat.scss'
import { db } from '../../../Firebase'
import { addDoc, query, collection, onSnapshot, orderBy } from 'firebase/firestore'
import { useState } from 'react'
import { useEffect, useRef, useContext } from 'react'
import { GlobalContext } from '../../providers/GlobalProvider'
// Icones
import { BiSolidSend } from 'react-icons/bi'
import Panel from '../esthetics/Panel'

export default function Chat(props) {
  const { player, host, myColor, rivalColor, room } = useContext(GlobalContext)
  const [messages, setMessages] = useState(null)
  const [newMessage, setNewMessage] = useState(null)
  const [cooldown, setCooldown] = useState(false)
  const ref = useRef(null)

  // Send a message
  function sendMessage() {
    if (newMessage && newMessage.length !== 0 && !cooldown) {
      setCooldown(true)
      let ts = Date.now()
      const newDoc = {
        author: player,
        user: host ? 1 : 2,
        txt: newMessage,
        timestamp: ts
      }
      addDoc(collection(db, `games/${room}/tchat`), newDoc)
      setNewMessage('')
      ref.current.value = ''
      setTimeout(() => {
        setCooldown(false)
      }, 1000)
    }
  }
  const handleKeyPress = (e) => {
    //it triggers by pressing the enter key
    if (e.keyCode === 13) {
      sendMessage()
    }
  }

  // Fetch chat messages
  useEffect(() => {
    const q = query(collection(db, `games/${room}/tchat`), orderBy('timestamp'))
    onSnapshot(q, (querySnapshot) => {
      const msgList = querySnapshot.docs.map((doc) => doc.data())
      setMessages(msgList)
    })
  }, [])

  return (
    <Panel title="Tchat">
      <div className="chat-messages">
        {messages != null &&
          messages.map((str, index) => (
            <div
              className={`chat-item ${str.user == 1 ? 'red' : 'blue'}`}
              key={index}
              style={{
                color:
                  str.user == 1 && host ? myColor : str.user == 2 && !host ? myColor : rivalColor
              }}
            >
              <label>{str.author} :</label>
              <p>{str.txt}</p>
            </div>
          ))}
        <div className="chat-anchor"></div>
      </div>
      <div className="chat-input">
        <input
          ref={ref}
          type="text"
          onKeyDown={handleKeyPress}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage} className={cooldown ? 'disabled' : ''}>
          <BiSolidSend color="white" size={30} />
        </button>
      </div>
    </Panel>
  )
}
