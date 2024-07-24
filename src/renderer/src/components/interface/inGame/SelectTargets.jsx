import { useContext, useEffect, useState } from 'react'
import { GlobalContext } from '../../providers/GlobalProvider'
import Modal from '../../items/Modal'

export default function SelectTarget() {
  const { askForTarget, setGreenCells } = useContext(GlobalContext)
  const [selectedTargets, setSelectedTargets] = useState([])

  const { effect, card, possibleTargets } = askForTarget

  useEffect(() => {
    if (askForTarget) {
      setGreenCells(possibleTargets)
    }
  }, [askForTarget])

  return possibleTargets.length ? (
    <>
      <div className="modal-window">
        <h1>Choissisez une cible !</h1>
        <div className="modal-window-wrapper">
          <div className="modal-window-icons">
            <img src={effect.icon} alt="Icone de l'effet utilisé" />
          </div>
          <div className="modal-window-infos">
            <h2>
              {card.name} active l'effet {effect.name}.
            </h2>
            <p>{effect.desc}</p>
          </div>
        </div>
      </div>
    </>
  ) : null
}
