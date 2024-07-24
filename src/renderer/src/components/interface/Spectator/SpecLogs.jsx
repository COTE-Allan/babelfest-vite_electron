import React, { useContext, useEffect, useRef } from 'react'
import '../../../styles/interface/inGame/logs.scss'
import { SpectatorContext } from '../../providers/SpectatorProvider'
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
import { isCardMine } from '../../others/toolBox'

export default function SpecLogs(props) {
  const { logs, player1Color, player2Color, playerID, pattern, phase, player1, player2 } =
    useContext(SpectatorContext)

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
        <GiPriceTag className="icon-action" />
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
            return
          }

          const isMine = log.owner === 1
          const isVisible = log.trigger?.isRecto || isMine
          const itemColor = isMine ? player1Color : player2Color

          return (
            <div
              className={`logs-item`}
              key={index}
              style={{
                borderColor: itemColor,
                borderWidth: log.turn ? 0 : 2
              }}
            >
              {log.turn && previousLogHasNoTurn ? (
                <div className="logs-item-turn">
                  <p
                    style={{
                      color: itemColor
                    }}
                  >
                    {`TOUR ${log.turn} - ${phases[log.phase]} de
                                      ${
                                        log.owner === playerID ? player1.username : player2.username
                                      }`}
                  </p>
                  <hr
                    style={{
                      borderColor: itemColor
                    }}
                  />
                </div>
              ) : (
                <>
                  {log.action && (
                    <div
                      className="logs-item-action"
                      style={{
                        backgroundColor: itemColor
                      }}
                    >
                      {log.action === 'effect' ? (
                        <>
                          <img
                            className="icon-action-img"
                            src={
                              isVisible
                                ? log.effectInfos.icon
                                : 'https://res.cloudinary.com/dxdtcakuv/image/upload/v1701520367/babelfest/icons/random_nb5zhf.webp'
                            }
                            alt="icone de l'effet"
                          />
                          <span className="icon-action-label">
                            {isVisible
                              ? log.effectInfos.name + ' de ' + log.trigger.name
                              : 'Effet de ???'}
                          </span>
                        </>
                      ) : (
                        actions[log.action](isVisible ? log.trigger.name : '???')
                      )}
                    </div>
                  )}
                  <div className="logs-item-content">
                    {log.trigger && (
                      <>
                        <div className="logs-item-card">
                          <img
                            src={
                              isVisible || log.action === 'trade'
                                ? log.trigger.url
                                : 'https://res.cloudinary.com/dxdtcakuv/image/upload/v1701520367/babelfest/icons/random_nb5zhf.webp'
                            }
                            className={!isVisible && log.action !== 'trade' && 'hidden'}
                            alt={`carte qui active l'action ${log.trigger.name}`}
                          />
                        </div>
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
                        {log.targets.map((target) => (
                          <>
                            <div className="logs-item-card">
                              <img
                                src={
                                  target.isRecto ||
                                  isCardMine(target, pattern, playerID) ||
                                  log.action === 'trade'
                                    ? target.url
                                    : 'https://res.cloudinary.com/dxdtcakuv/image/upload/v1701520367/babelfest/icons/random_nb5zhf.webp'
                                }
                                className={
                                  !(
                                    target.isRecto ||
                                    isCardMine(target, pattern, playerID) ||
                                    log.action === 'trade'
                                  ) && 'hidden'
                                }
                              />
                            </div>
                          </>
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
                        {log.result.value && (
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
