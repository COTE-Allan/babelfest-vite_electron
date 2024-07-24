import { useContext } from 'react'
import '../../../styles/interface/inGame/arena.scss'
import { AiFillEyeInvisible } from 'react-icons/ai'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { SpectatorContext } from '../../providers/SpectatorProvider'
import { useMemo } from 'react'

export default function SpecArena() {
  const {
    pattern,
    player1Color,
    player2Color,
    side,
    phase,
    setDetailCard,
    setRightWindow,
    rightWindow,
    myTurn
  } = useContext(SpectatorContext)

  const rivalColor = side === 1 ? player2Color : player1Color
  const myColor = side === 1 ? player1Color : player2Color
  console.log(myTurn)
  return (
    <div className={`arena-wrapper`} onContextMenu={(e) => e.preventDefault()}>
      <TransformWrapper
        minScale={0.5}
        maxScale={2.5}
        initialScale={0.65}
        centerOnInit={true}
        doubleClick={{ disabled: true }}
        velocityAnimation={{ disabled: false, sensitivity: 100 }}
      >
        <TransformComponent>
          <div className={`arena-coords ${side === 2 ? 'reversed' : ''}`}>
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
              transform: `rotate(${side === 2 ? 0 : 180}deg)`
            }}
          >
            {pattern.map((cell) => {
              let card = cell.card
              let stats
              if (card != null) {
                stats = [card.atk, card.dep, card.hp]
              }
              const cellClasses = useMemo(() => {
                let tiredClass = ''
                if (phase === 2 && card?.movedThisTurn) {
                  tiredClass = 'tired'
                } else if (phase === 3 && card?.attackedThisTurn) {
                  tiredClass = 'tired'
                }

                return `cell
                    ${!side === 2 && 'reversed'}
                    ${card && card.isRecto && card.fortress ? 'shield' : ''} 
                    ${card && card.freeze ? 'freeze' : ''}
                    ${tiredClass}
                    ${card && card.isRecto && card.diving ? 'diving' : ''}
                    `
              }, [cell])

              if (!cell.exist) {
                return <div className="cell cell-inexistant" id={cell.id} data-team={cell.side} />
              }
              return (
                <div
                  className={cellClasses}
                  id={cell.id}
                  data-team={cell.side}
                  style={{
                    backgroundColor: cell.base
                      ? cell.side === 2
                        ? player1Color
                        : player2Color
                      : '#000',
                    '--rotation': `${side === 2 ? '0deg' : '180deg'}`,
                    borderColor: cell.owner
                      ? cell.owner === 1
                        ? player1Color
                        : player2Color
                      : '#FFF'
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    setRightWindow(rightWindow === 'details' ? null : 'details')
                  }}
                  onMouseEnter={() => {
                    setDetailCard(card)
                  }}
                >
                  {card && (
                    <div
                      className={card.shiny ? 'cell-card ' + card.shiny : 'cell-card'}
                      onMouseEnter={() => {
                        setDetailCard(card)
                      }}
                      onMouseLeave={() => {
                        setDetailCard(null)
                      }}
                    >
                      {card.isRecto ? (
                        <>
                          {card.deathCounter && card.deathCounter !== 0 && (
                            <div className="cell-card-counter">{card.deathCounter}</div>
                          )}
                          {card.timerSummon && (
                            <div className="cell-card-counter">{card.timerSummon}</div>
                          )}
                          {typeof card.def === 'number' && card.def !== 0 && (
                            <div className="cell-card-def">{card.def}</div>
                          )}

                          <div className="img-container">
                            {card.freeze && (
                              <img
                                src="https://res.cloudinary.com/dxdtcakuv/image/upload/w_auto/v1702647583/babelfest/icons/freeze.webp"
                                alt="Icone Congelé"
                                className="freeze-icon"
                              />
                            )}
                            <img src={card.url} className="cell-card-visual" alt="Card" />
                          </div>
                          <div className="cell-card-stats">
                            {stats.map((stat, key) => (
                              <div key={key} className="cell-card-stats-item">
                                {stat}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <img src={card.url} className="cell-card-visual hidden" alt="Card" />
                          <AiFillEyeInvisible size={90} className="hidden-icon" />
                          <div className="cell-card-stats">
                            {stats.map((stat, key) => (
                              <div key={key} className="cell-card-stats-item">
                                {stat}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="arena-borders">
            <div className={`arena-borders-container`}>
              <div
                className="arena-borders-item"
                style={{
                  backgroundColor: !myTurn || phase === 0 ? rivalColor : '#939393',
                  boxShadow: !myTurn || phase === 0 ? `0 -10px 70px ${rivalColor}` : 'none'
                }}
              ></div>
              <div
                className="arena-borders-item"
                style={{
                  backgroundColor: myTurn || phase === 0 ? myColor : '#939393',
                  boxShadow: myTurn || phase === 0 ? `0 10px 70px ${myColor}` : 'none'
                }}
              ></div>
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
}
