import { useContext } from 'react'
import { GlobalContext } from '../../providers/GlobalProvider'
import '../../../styles/interface/inGame/arena.scss'
import Cell from '../../items/cell'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

import { ArenaController } from '../../controllers/ArenaController'
import DeathController from '../../controllers/DeathController'
import { getBackgroundStyle } from '../../others/toolBox'

export default function Arena() {
  const {
    host,
    confirmModal,
    pattern,
    askForCell,
    askForTarget,
    greenCells,
    phase,
    myColor,
    rivalColor,
    myTurn,
    showArenaInModal,
    isSpectator
  } = useContext(GlobalContext)

  {
    !isSpectator && ArenaController()
    DeathController()
  }

  return (
    <div
      className={`arena-wrapper ${
        (askForCell || askForTarget || showArenaInModal) &&
        !isSpectator &&
        'arena-wrapper-upperLayer'
      }`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <TransformWrapper
        minScale={0.55}
        maxScale={2.5}
        initialScale={0.55}
        centerOnInit={true}
        doubleClick={{ disabled: true }}
        velocityAnimation={{ disabled: false, sensitivity: 100 }}
        // limitToBounds={false}
        limitToWrapper={true}
      >
        <TransformComponent>
          <div className={`arena-coords ${host ? 'reversed' : ''}`}>
            <div className="arena-coords-col">
              <span>A</span>
              <span>B</span>
              <span>C</span>
              <span>D</span>
            </div>
            <div className="arena-coords-row">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
            </div>
          </div>
          <div
            className="arena"
            style={{
              transform: `rotate(${host ? 0 : 180}deg)`
            }}
          >
            {pattern.map((cell) => (
              <Cell
                key={cell.id}
                cell={cell}
                active={greenCells.some((greenCell) => greenCell.id === cell.id)}
                confirmModal={confirmModal === cell.id}
              />
            ))}
          </div>
          <div className="arena-borders">
            <div className={`arena-borders-container`}>
              <div
                className="arena-borders-item"
                style={{
                  background: !myTurn ? getBackgroundStyle(rivalColor) : '#939393'
                }}
              ></div>
              <div
                className="arena-borders-item"
                style={{
                  background: myTurn ? getBackgroundStyle(myColor) : '#939393'
                }}
              ></div>
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
}
