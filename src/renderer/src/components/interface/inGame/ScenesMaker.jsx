import { useContext, useEffect, useState } from 'react'
import { GlobalContext } from '../../providers/GlobalProvider'
import Modal from '../../items/ClassicModal'
import { db } from '../../../Firebase'
import { doc, runTransaction } from 'firebase/firestore'
import '../../../styles/interface/inGame/scenesMaker.scss'
import { GiSwordWound, GiRemedy, GiDeathSkull, GiHearts } from 'react-icons/gi'
import { AuthContext } from '../../../AuthContext'
import useSound from 'use-sound'
import summonSfx from '../../../assets/sfx/summon.mp3'
import effectSfx from '../../../assets/sfx/effect.mp3'
import attackSfx from '../../../assets/sfx/ingame_attack.mp3'
import healSfx from '../../../assets/sfx/ingame_heal.wav'
import blockSfx from '../../../assets/sfx/ingame_block.mp3'
import deathSfx from '../../../assets/sfx/ingame_death.mp3'
import hiddenCard from '../../../assets/img/card_unknown.png'
import { FaArrowRight } from 'react-icons/fa'
import { isCardMine } from '../../others/toolBox'

export default function ScenesMaker() {
  const { scenes, user, room, pattern, playerID, isSpectator } = useContext(GlobalContext)
  const { userSettings } = useContext(AuthContext)
  let scene = scenes[0]

  const matchCard1 = pattern.find(
    (cell) => cell.card && cell.card.uniqueID === scene.cards[0].uniqueID
  )
  const matchCard2 = scene.cards[1]
    ? pattern.find((cell) => cell.card && cell.card.uniqueID === scene.cards[1].uniqueID)
    : null

  const [summon] = useSound(summonSfx, {
    volume: userSettings.sfxVolume
  })
  const [attack] = useSound(attackSfx, {
    volume: userSettings.sfxVolume
  })
  const [death] = useSound(deathSfx, {
    volume: userSettings.sfxVolume
  })
  const [block] = useSound(blockSfx, {
    volume: userSettings.sfxVolume
  })
  const [heal] = useSound(healSfx, {
    volume: userSettings.sfxVolume
  })
  const [effect] = useSound(effectSfx, {
    volume: userSettings.sfxVolume
  })

  const iconMapping = {
    attack: <GiSwordWound />,
    heal: <GiRemedy />,
    summon: <FaArrowRight />,
    death: <GiDeathSkull />
  }

  useEffect(() => {
    switch (scene.sound) {
      case 'attack':
        attack()
        break
      case 'death':
        death()
        break
      case 'heal':
        heal()
        break
      case 'block':
        block()
        break
      case 'effect':
        effect()
        break
      default:
        summon()
        break
    }
    const timer = setTimeout(async () => {
      const sceneDocRef = doc(db, 'games', room, 'scenes', scene.id)
      try {
        await runTransaction(db, async (transaction) => {
          const sceneDoc = await transaction.get(sceneDocRef)
          if (!sceneDoc.exists()) {
            throw new Error('Scene does not exist!')
          }

          const playedBy = sceneDoc.data().playedBy || []
          if (!playedBy.includes(user.uid)) {
            transaction.update(sceneDocRef, {
              playedBy: [...playedBy, user.uid]
            })
          }
        })
        console.log('Transaction successfully committed!')
      } catch (e) {
        console.error('Transaction failed: ', e)
      }
    }, 2000)

    // Nettoyer le timer quand le composant est démonté
    return () => clearTimeout(timer)
  }, [effect, scene.id, scene.sound])
  if (scene.isEffect) {
    return (
      <div className={`scenesMaker effectAnim`}>
        {scene.cards[0] && (
          <div className="scenesMaker-card-container">
            <img
              className="scenesMaker-card"
              src={
                matchCard1 &&
                !matchCard1.card.isRecto &&
                (matchCard1.owner !== playerID || isSpectator)
                  ? hiddenCard
                  : scene.cards[0].url
              }
              alt="Card 1"
            />
          </div>
        )}

        {iconMapping[scene.sound] && (
          <div className="scenesMaker-values">
            <div className="scenesMaker-icon">{iconMapping[scene.sound]}</div>
          </div>
        )}
        <div className="scenesMaker-icon">
          <FaArrowRight />
        </div>

        <span className="scenesMaker-action">
          <img className="scenesMaker-effectIcon" src={scene.icon} alt="Icon de l'effet" />
          {scene.value && <span className="scenesMaker-value">{scene.value}</span>}

          {scene.action && scene.action}
          <div className="scenesMaker-targets">
            {scene.targets &&
              scene.targets.map((target) => (
                <>
                  <div className="scenesMaker-card-container">
                    <img
                      className="scenesMaker-card"
                      src={
                        target.isRecto || isCardMine(target, pattern, playerID)
                          ? target.url
                          : hiddenCard
                      }
                      alt={`target card ${target.name}`}
                    />
                  </div>
                </>
              ))}
          </div>
        </span>
      </div>
    )
  } else {
    return (
      <Modal className="fade-in-out zindex11">
        <div className="scenesMaker slideAnim">
          <div className="scenesMaker-cards">
            {scene.cards[0] && (
              <img
                className="scenesMaker-card"
                src={
                  matchCard1 &&
                  !matchCard1.card.isRecto &&
                  (matchCard1.owner !== playerID || isSpectator)
                    ? hiddenCard
                    : scene.cards[0].url
                }
                alt="Card 1"
              />
            )}
            {scene.cards[1] && (
              <>
                {iconMapping[scene.sound] && (
                  <div className="scenesMaker-icon">{iconMapping[scene.sound]}</div>
                )}
                {scene.value !== undefined && (
                  <span className="scenesMaker-value">{scene.value}</span>
                )}
                <img
                  className="scenesMaker-card"
                  src={
                    matchCard2 && !matchCard2.card.isRecto && matchCard2.owner !== playerID
                      ? hiddenCard
                      : scene.cards[1].url
                  }
                  alt="Card 2"
                />
              </>
            )}
          </div>
          <span className="scenesMaker-action">{scene.action}</span>
          <p className="scenesMaker-desc">{scene.desc}</p>
        </div>
      </Modal>
    )
  }
}

// TODO: OPTI CETTE MERDE
