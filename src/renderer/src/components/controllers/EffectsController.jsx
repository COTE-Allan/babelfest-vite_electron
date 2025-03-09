import { useCallback, useContext } from 'react'
import { GlobalContext } from '../providers/GlobalProvider'
import { finishStandby, goingStandby } from '../others/standbySystem'
import { db } from '../../Firebase'
import { collection, doc, getDoc, onSnapshot, writeBatch } from 'firebase/firestore'
import { getPattern } from '../others/toolBox'
import { getAllCardsOnArena } from '../effects/targets'
import * as Buffs from '../effects/types/buffs'
import * as Debuffs from '../effects/types/debuffs'
import * as Traps from '../effects/types/traps'
import * as Summons from '../effects/types/summons'
import * as Malus from '../effects/types/malus'
import * as Randoms from '../effects/types/randoms'
import * as Tactics from '../effects/types/tactics'
import * as Offensives from '../effects/types/offensives'

import { getAllEffects, getEffectInfo } from '../effects/basics'
import { usePushLogsIntoBatch, usePushSceneIntoBatch } from './LogsController'
import { AuthContext } from '../../AuthContext'

export const useTryEffect = () => {
  const effectList = {
    atkBuff: Buffs.Renforcement,
    depBuff: Buffs.Turbo,
    defBuff: Buffs.BouclierProtecteur,
    rageShield: Buffs.SteelBerserk,
    rageSword: Buffs.Berserk,
    rageSwordAlly: Buffs.TousPourUn,
    leader: Buffs.Leader,
    processorAlly: Buffs.processorAlly,
    processorRival: Buffs.processorRival,
    permAtk: Buffs.permAtk,
    permHP: Buffs.permHP,
    defDebuff: Debuffs.BriseBouclier,
    freeze: Debuffs.RegardGlace,
    trap: Traps.PiegeOurs,
    taser: Traps.TaserPostMortem,
    stomp: Traps.Pietinement,
    seeingEye: Traps.TroisiemeOeil,
    absoluteSeeingEye: Traps.AbsoluteTroisiemeOeil,
    deathSummon: Summons.AngeRessurect,
    deathSummonDeck: Summons.PiochePostMortem,
    deathSummonGhost: Summons.InvocationMiroir,
    spawnSummon: Summons.InvocationMinions,
    timerSummon: Summons.CompteurPuissance,
    shopSummon: Summons.Soldes,
    metamorphSummon: Summons.Metamorphose,
    deathCounter: Malus.CompteurMort,
    random: Randoms.EffetRandom,
    chaosTP: Randoms.ChaosTP,
    randomHP: Randoms.RandomHP,
    randomATK: Randoms.RandomATK,
    randomDEP: Randoms.RandomDEP,
    swapStats: Tactics.Inversion,
    areaAttack: Tactics.PluieFleche,
    grapple: Tactics.Grappin,
    diving: Tactics.Plongeon,
    flame: Offensives.Surchauffe,
    fireball: Offensives.Fireball
  }

  const {
    room,
    setAskForTarget,
    playerID,
    shop,
    firstToPlay,
    setPhaseEffects,
    setConfirmModal,
    setGreenCells,
    playerSelf,
    playerRival
  } = useContext(GlobalContext)
  const { giveAchievement } = useContext(AuthContext)

  const pushLogsIntoBatch = usePushLogsIntoBatch()
  const pushSceneIntoBatch = usePushSceneIntoBatch()

  async function tryEffect(
    when,
    participants = undefined,
    spawnID = undefined,
    deadCell = undefined,
    phaseWhen = false,
    killer = undefined
  ) {
    return new Promise(async (resolve) => {
      let stillDead = true
      let pattern = await getPattern(room)
      let updatedDeadCell = deadCell

      if (deadCell) {
        updatedDeadCell = pattern.find((cell) => cell.id === deadCell.id)
        if (!updatedDeadCell) {
          console.error(`Dead cell with id ${deadCell.id} not found in pattern`)
          resolve(false) // Resolve immediately if deadCell isn't found
          return
        }
      }

      console.log('tryeffect', participants, when, spawnID, updatedDeadCell)

      const authorizedCards = pattern.filter((cell) => {
        if (!cell?.card?.effects) return false
        const isOwner = cell.owner === playerID
        const isDeadCell = when === 'death' && cell.id === updatedDeadCell?.id
        if (!isOwner && when !== 'attacked' && when !== 'cardDeath' && !isDeadCell) return false

        return cell.card.effects.some((effect) => {
          const effectApplicable = effect.when?.includes(when)
          const effectNotUsed =
            !effect.usedThisTurn && !effect.alreadyUsed && !(effect.spawnUsed && when === 'spawn')
          if (!effectApplicable || !effectNotUsed) return false

          switch (when) {
            case 'death':
              return (
                effect.when.includes('death') &&
                cell.card.uniqueID === updatedDeadCell?.card?.uniqueID
              )
            case 'cardDeath':
              const bymeCheck = effect.byme ? killer?.card?.uniqueID === cell.card.uniqueID : true
              console.log(cell.card.name, effect.byme, bymeCheck, killer)
              return bymeCheck && cell.card.uniqueID !== updatedDeadCell?.card?.uniqueID
            case 'attacked':
              return cell.id === participants?.target?.id
            case 'attack':
              return cell.id === participants?.attacker?.id
            case 'spawn':
              return cell.card.id === spawnID[0] && cell.id === spawnID[1]
            default:
              return true
          }
        })
      })

      let batch = writeBatch(db)

      for await (let item of authorizedCards) {
        for (let index = 0; index < item.card.effects.length; index++) {
          let effect = item.card.effects[index]
          if (effect.when && effect.when.includes(when)) {
            console.log(
              `${item.card.name} active un effet, effect.type : ${effect.type}, index : ${index}`
            )

            if ((effect.alreadyUsed ?? true) === false) {
              effect.alreadyUsed = true
            }
            if ((effect.spawnUsed ?? true) === false) {
              effect.spawnUsed = true
            }

            if (!effect.reusable) {
              effect.usedThisTurn = true
            }

            if (effect.choice) {
              let effectInfos = getEffectInfo(effect.type)
              pattern = await getPattern(room)
              switch (effect.choice) {
                case 'target':
                  let possibleTargets = getAllCardsOnArena(
                    item,
                    effect.target,
                    pattern,
                    effect.base ?? true,
                    effect.self ?? true
                  )
                  if (possibleTargets.length !== 0) {
                    await goingStandby(room, playerID === 1 ? 2 : 1, false)
                    const selection = await demandToChoiceTarget(possibleTargets, effect, item)
                    setAskForTarget(false)
                    const executedEffect = await effectList[effect.type]({
                      index,
                      item,
                      effect,
                      targets: selection,
                      pattern,
                      effectInfos,
                      player: item.owner === playerID ? playerSelf : playerRival
                    })
                    await finishStandby(room)
                    await concludeEffect(batch, executedEffect)
                    await batch.commit()
                    batch = writeBatch(db) // Re-initialize batch for subsequent operations
                  } else {
                    await concludeEffect(batch, {
                      targets: [item],
                      executor: item
                    })
                  }
                  break
                default:
                  break
              }
            } else {
              let effectInfos = getEffectInfo(effect.type)
              const executedEffect = await effectList[effect.type]({
                index,
                item,
                effect,
                pattern,
                attacker: participants?.attacker,
                defender: participants?.defender,
                updatedDeadCell,
                room,
                killer: killer,
                shop,
                effectInfos,
                player: item.owner === playerID ? playerSelf : playerRival,
                rival: item.owner !== playerID ? playerRival : playerSelf
              })
              await concludeEffect(batch, executedEffect)
              stillDead = executedEffect?.stillDead ?? true
            }
          }
        }
      }

      await batch.commit() // Push all remaining changes to the database

      if (phaseWhen) {
        if (firstToPlay === playerID) {
          await goingStandby(room, playerID)
        } else {
          await finishStandby(room)
        }
        setPhaseEffects(false)
      }

      resolve(stillDead) // Resolve the promise after all async operations are complete
    })
  }

  const demandToChoiceTarget = useCallback(
    (possibleTargets, effect, item) => {
      return new Promise((resolve) => {
        let effectInfos = getEffectInfo(effect.type, effect.value)
        setAskForTarget({
          effect: effectInfos,
          card: item.card,
          possibleTargets: possibleTargets,
          resolve: (selection) => {
            setGreenCells([])
            setConfirmModal(null)
            resolve(selection)
          }
        })
      })
    },
    [setAskForTarget]
  )

  const concludeEffect = useCallback(
    async (batch, result) => {
      if (!result || result.cancel) return
      console.log("conclusion de l'effet.", result, result.targets)

      // Cancel the effect if result.targets exists but is empty
      if (Array.isArray(result.targets) && result.targets.length === 0) {
        console.log("Aucun cible trouvée. Annulation de l'effet.")
        return
      }

      if (result.ach) {
        await giveAchievement(result.ach)
      }

      for (const target of result.targets) {
        const ref = doc(db, `games/${room}/arena`, `cell-${target.id}`)
        const docSnapshot = await getDoc(ref)

        if (docSnapshot.exists()) {
          const currentData = docSnapshot.data()

          // Vérifier si les champs ont changé
          let shouldUpdate = false
          for (const key in target) {
            if (target[key] !== currentData[key]) {
              shouldUpdate = true
              break
            }
          }

          // Si des champs ont changé, on ajoute la mise à jour au batch
          if (shouldUpdate) {
            batch.update(ref, target)
          }
        } else {
          // Si le document n'existe pas, on l'ajoute au batch pour une création (si nécessaire)
          batch.set(ref, target)
        }
      }
      if (result.log) {
        await pushLogsIntoBatch(batch, result.log, result.executor.owner)
        console.log(result.log)
        await pushSceneIntoBatch(batch, {
          cards: [result.executor.card],
          icon: result.log.effectInfos.icon,
          value: result.log.result?.value ?? null,
          isEffect: true,
          sound: 'effect',
          targets: result.log.targets ? result.log.targets : null
        })
      }

      console.log(result.executor.card.name + ' : effet terminé.')

      const unsubscribe = onSnapshot(collection(db, `games/${room}/arena`), (snapshot) => {
        let changesDetected = false

        snapshot.docs.forEach((doc) => {
          const data = doc.data()
          if (data) {
            changesDetected = true
          }
        })

        if (changesDetected) {
          unsubscribe()
        }
      })
    },
    [room]
  )

  return tryEffect
}
