import { useContext } from 'react'
import '../../styles/items/modal.scss'
import { GlobalContext } from '../providers/GlobalProvider'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'

export default function Modal(props) {
  const { showArenaInModal, setShowArenaInModal } = useContext(GlobalContext)
  return (
    <>
      <div className={`modal`}>{!showArenaInModal && props.children}</div>
      {props.showArena && (
        <div
          className="modal-showArenaInModal"
          onClick={() => setShowArenaInModal(!showArenaInModal)}
        >
          {showArenaInModal ? (
            <>
              <AiFillEyeInvisible size={50} />
              Cacher l'arène
            </>
          ) : (
            <>
              <AiFillEye size={50} />
              Afficher l'arène
            </>
          )}
        </div>
      )}
    </>
  )
}
