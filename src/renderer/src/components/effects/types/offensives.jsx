export async function Surchauffe({ item, updatedDeadCell, effect, effectInfos }) {
  let target = updatedDeadCell

  target.burn = true

  console.log('result :', target)
  return {
    targets: [target],
    log: {
      trigger: item.card,
      action: 'effect',
      effectInfos: effectInfos,
      result: {
        custom: true,
        icon: effectInfos.icon
      }
    },
    executor: item
  }
}
