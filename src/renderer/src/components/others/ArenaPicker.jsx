import { getArenaPattern } from './toolBox'

function ArenaPicker({ selectedMap, setSelectedMap, disableInteractivity }) {
  const arenas = getArenaPattern()

  const handleClick = (selectedArena) => {
    if (disableInteractivity) return // Disable interactivity if the prop is true

    if (selectedMap && selectedArena.id === selectedMap.id) {
      setSelectedMap(null)
    } else {
      setSelectedMap(selectedArena)
    }
  }

  const isSelected = (arena) => disableInteractivity || (selectedMap && arena.id === selectedMap.id)

  return (
    <div className="arenaPicker">
      {arenas.map((arena) => (
        <div className="arenaPicker-item-container" key={arena.id}>
          <span>{arena.pattern[2]}</span>
          <div
            className={`arenaPicker-item ${isSelected(arena) ? 'selected' : ''}`}
            onClick={() => handleClick(arena)}
            style={{ pointerEvents: disableInteractivity ? 'none' : 'auto' }}
          >
            {Array.from({ length: 32 }, (_, cellIndex) => {
              const cellID = cellIndex
              let additionalClass = ''

              if (arena.pattern[0].includes(cellID)) {
                additionalClass = 'gone'
              } else if (arena.pattern[1].includes(cellID)) {
                additionalClass = 'base'
              }

              return <div key={cellID} className={`arenaPicker-item-cell ${additionalClass}`}></div>
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ArenaPicker