import React, { useContext } from 'react'
import '../../../styles/interface/inGame/logs.scss'
import { GlobalContext } from '../../providers/GlobalProvider'
import { FaArrowRight } from 'react-icons/fa'
import {
  GiCardPlay,
  GiWalkingBoot,
  GiSwordWound,
  GiHearts,
  GiPriceTag,
  GiVibratingShield,
  GiRemedy,
  GiPerspectiveDiceSixFacesRandom,
  GiDeathSkull
} from 'react-icons/gi'
import { getBackgroundStyle, isCardMine } from '../../others/toolBox'

export default function Logs(props) {
  const {
    logs,
    myColor,
    rivalColor,
    playerID,
    pattern,
    phase,
    playerSelf,
    playerRival,
    isSpectator
  } = useContext(GlobalContext)

  const actions = {
    summon: (cardName) => (
      <>
        <GiCardPlay className="icon-action" />
        <span className="icon-action-label">{`Invocation de ${cardName}`}</span>
      </>
    ),
    move: (cardName) => (
      <>
        <GiWalkingBoot className="icon-action" />
        <span className="icon-action-label">{`Déplacement de ${cardName}`}</span>
      </>
    ),
    switch: (cardName) => (
      <>
        <GiWalkingBoot className="icon-action" />
        <span className="icon-action-label">Inversion de position</span>
      </>
    ),
    attack: (cardName) => (
      <>
        <GiSwordWound className="icon-action" />
        <span className="icon-action-label">{`Attaque de ${cardName}`}</span>
      </>
    ),
    heal: (cardName) => (
      <>
        <GiRemedy className="icon-action" />
        <span className="icon-action-label">Soins</span>
      </>
    ),
    trade: (cardName) => (
      <>
        <GiPriceTag size={20} className="icon-action" />
        <span className="icon-action-label">Troc</span>
      </>
    )
  }

  const results = {
    hp: <GiHearts />,
    atk: <GiSwordWound />,
    dep: <GiWalkingBoot />,
    shield: <GiVibratingShield />,
    random: <GiPerspectiveDiceSixFacesRandom />,
    death: <GiDeathSkull />
  }

  const phases = {
    1: 'Préparation',
    2: 'Déplacements',
    3: 'Attaques',
    4: 'Troc'
  }

  return (
    <div className="logs-messages">
      {logs != null &&
        logs.map((log, index) => {
          const previousLogExists = index > 0
          const previousLogHasNoTurn = previousLogExists && !logs[index - 1].turn
          if (log.turn && !previousLogHasNoTurn) {
            return null
          }

          const isMine = log.owner === playerID
          const isVisible = log.trigger?.isRecto || (isMine && !isSpectator)
          const itemColor = isMine
            ? getBackgroundStyle(myColor, 'to right')
            : getBackgroundStyle(rivalColor, 'to right')
          const txtColor = isMine ? myColor.hex : rivalColor.hex

          return (
            <div
              className="logs-item"
              key={index}
              style={{
                borderWidth: log.turn ? 0 : 2
              }}
            >
              {log.turn && previousLogHasNoTurn ? (
                <div className="logs-item-turn">
                  <p style={{ color: txtColor }}>
                    {`TOUR ${log.turn} - ${phases[log.phase]} de ${
                      log.owner === playerID ? playerSelf.username : playerRival.username
                    }`}
                  </p>
                  <hr style={{ borderColor: itemColor }} />
                </div>
              ) : (
                <>
                  {log.action && (
                    <div
                      className="logs-item-action"
                      style={{
                        background: itemColor
                      }}
                    >
                      {log.action === 'effect' ? (
                        <>
                          {Array.isArray(log.trigger) ? (
                            log.trigger.map((trigger, idx) => (
                              <div key={idx} className="logs-item-header">
                                <img
                                  className="icon-action-img"
                                  src={isVisible ? log.effectInfos.icon : './effects/random.png'}
                                  alt="icone de l'effet"
                                />
                                <span className="icon-action-label">
                                  {isVisible
                                    ? log.effectInfos.name + ' de ' + trigger.name
                                    : 'Effet de ???'}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="logs-item-header">
                              <img
                                className="icon-action-img"
                                src={isVisible ? log.effectInfos.icon : './effects/random.png'}
                                alt="icone de l'effet"
                              />
                              <span className="icon-action-label">
                                {isVisible
                                  ? log.effectInfos.name + ' de ' + log.trigger.name
                                  : 'Effet de ???'}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        actions[log.action](isVisible ? log.trigger.name : '???')
                      )}
                    </div>
                  )}
                  <div className="logs-item-content">
                    {log.trigger && (
                      <>
                        {Array.isArray(log.trigger) ? (
                          log.trigger.map((trigger, idx) => (
                            <div className="logs-item-card" key={idx}>
                              <img
                                src={
                                  isVisible || log.action === 'trade'
                                    ? trigger.url
                                    : './effects/random.png'
                                }
                                className={!isVisible && log.action !== 'trade' ? 'hidden' : ''}
                                alt={`carte qui active l'action ${trigger.name}`}
                              />
                            </div>
                          ))
                        ) : (
                          <div className="logs-item-card">
                            <img
                              src={
                                isVisible || log.action === 'trade'
                                  ? log.trigger.url
                                  : './effects/random.png'
                              }
                              className={!isVisible && log.action !== 'trade' ? 'hidden' : ''}
                              alt={`carte qui active l'action ${log.trigger.name}`}
                            />
                          </div>
                        )}
                      </>
                    )}
                    {log.from && (
                      <>
                        <FaArrowRight className="icon-direction" />
                        <span className="logs-item-coords">{log.from}</span>
                      </>
                    )}
                    {log.to && (
                      <>
                        <FaArrowRight className="icon-direction" />
                        <span className="logs-item-coords">{log.to}</span>
                      </>
                    )}
                    {(log.targets || log.result) && <FaArrowRight className="icon-direction" />}
                    {log.targets && (
                      <>
                        {log.targets.map((target, index) => (
                          <div className="logs-item-card" key={index}>
                            <img
                              src={
                                target.isRecto ||
                                isCardMine(target, pattern, playerID) ||
                                log.action === 'trade'
                                  ? target.url
                                  : './effects/random.png'
                              }
                              className={
                                !(
                                  target.isRecto ||
                                  isCardMine(target, pattern, playerID) ||
                                  log.action === 'trade'
                                )
                                  ? 'hidden'
                                  : ''
                              }
                              alt={`target card ${target.name}`}
                            />
                          </div>
                        ))}
                      </>
                    )}
                    {log.result && (
                      <div className="logs-item-result">
                        {log.result.custom ? (
                          <>
                            {isVisible || isMine ? (
                              <img src={log.result.icon} alt="icone de l'action effectuée" />
                            ) : (
                              '?'
                            )}
                          </>
                        ) : (
                          results[log.result.icon]
                        )}
                        {/* Vérification pour cacher la valeur si la carte n'est pas Recto */}
                        {log.result.value && (isVisible || isMine) && (
                          <span className="logs-item-result-value">{log.result.value}</span>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
    </div>
  )
}
