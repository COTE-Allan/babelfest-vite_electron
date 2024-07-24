export async function CompteurMort({ item, effectInfos }) {
  let target = item
  target.card.deathCounter = target.card.deathCounter - 1

  if (target.card.deathCounter <= 0) {
    target.card.dead = {
      cell: target.id,
      id: target.card.id,
      uniqueID: target.card.uniqueID
    }
  }

  target.card.deathCounter <= 0
    ? `${target.card.name} est mort.`
    : `${target.card.name} mourra dans ${target.card.deathCounter} tours.`

  return {
    targets: [target],
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      result:
        target.card.deathCounter <= 0
          ? {
              icon: 'death'
            }
          : {
              custom: true,
              icon: effectInfos.icon,
              value: target.card.deathCounter
            }
    },
    executor: item
  }
}
