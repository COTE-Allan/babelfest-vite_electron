import { useContext, useEffect } from 'react'
import { SpectatorContext } from '../../providers/SpectatorProvider'
import { AuthContext } from '../../../AuthContext'
import Modal from '../../items/ClassicModal'
import { db } from '../../../Firebase'
import { doc, runTransaction } from 'firebase/firestore'
import '../../../styles/interface/inGame/scenesMaker.scss'
import { GiSwordWound, GiRemedy, GiShield } from 'react-icons/gi'
import useSound from 'use-sound'
import effectSfx from '../../../assets/sfx/effect.mp3'
import attackSfx from '../../../assets/sfx/ingame_attack.mp3'
import healSfx from '../../../assets/sfx/ingame_heal.wav'
import blockSfx from '../../../assets/sfx/ingame_block.mp3'
import deathSfx from '../../../assets/sfx/ingame_death.mp3'
import summonSfx from '../../../assets/sfx/summon.mp3'

export default function SpecScenesMaker() {
  const { scenes, user, room } = useContext(SpectatorContext)
  const { userSettings } = useContext(AuthContext)
  let scene = scenes[0]

  const [effect] = useSound(effectSfx, { volume: userSettings.sfxVolume })
  const [attack] = useSound(attackSfx, { volume: userSettings.sfxVolume })
  const [death] = useSound(deathSfx, { volume: userSettings.sfxVolume })
  const [block] = useSound(blockSfx, { volume: userSettings.sfxVolume })
  const [heal] = useSound(healSfx, { volume: userSettings.sfxVolume })
  const [summon] = useSound(summonSfx, { volume: userSettings.sfxVolume })

  const iconMapping = {
    attack: <GiSwordWound />,
    heal: <GiRemedy />,
    block: <GiShield />
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
    }, 2200)

    // Nettoyer le timer quand le composant est démonté
    return () => clearTimeout(timer)
  }, [effect, scene.id, scene.sound])

  return (
    <Modal className={'fade-in-out'}>
      <div className={`scenesMaker ${scene.isEffect ? 'effectAnim' : 'slideAnim'}`}>
        <div className="scenesMaker-cards">
          {scene.cards[0] && (
            <img className="scenesMaker-card" src={scene.cards[0].url} alt="Card 1" />
          )}
          {scene.cards[1] && (
            <>
              {iconMapping[scene.sound] && (
                <div className="scenesMaker-icon">{iconMapping[scene.sound]}</div>
              )}
              {scene.value !== undefined && (
                <span className="scenesMaker-value">{scene.value}</span>
              )}
              <img className="scenesMaker-card" src={scene.cards[1].url} alt="Card 2" />
            </>
          )}
        </div>
        <span className="scenesMaker-action">{scene.action}</span>
        <p className="scenesMaker-desc">{scene.desc}</p>
      </div>
    </Modal>
  )
}
