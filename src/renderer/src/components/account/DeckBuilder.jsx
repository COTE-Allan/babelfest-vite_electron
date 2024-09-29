import { useContext, useState } from 'react'
import '../../styles/account/deckBuilder.scss'
import { AuthContext } from '../../AuthContext'
import { FaPlus } from 'react-icons/fa'
import Modal from "../items/ClassicModal" 
import Library from '../pages/Library'
import BabelfestBackground from '../../assets/img/fond_babelfest.png'

export default function DeckBuilder() {
  const [deckBuilderOn, setDeckBuilderOn] = useState(false)
  const { user } = useContext(AuthContext)
  return (
    <div className="deckBuilder">
     <div className="deckBuilder-list">
      <div className="deckBuilder-list-item createNew" onClick={() => {setDeckBuilderOn(true)}}>
<FaPlus size={50}/>
Créer nouveau        
      </div>
     </div>
     {deckBuilderOn && <Modal className="deckBuilder-editor">
     <Library editorMode={setDeckBuilderOn}/> 
     <img className='deckBuilder-editor-bg' src={BabelfestBackground} />
     </Modal> }
    </div>
  )
}
