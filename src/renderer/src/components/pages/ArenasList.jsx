import BackButton from '../items/BackButton'
import ArenaPicker from '../others/ArenaPicker'

export default function ArenasList() {
  return (
    <div className="arenasList">
      <BackButton />
      <h1
        style={{
          textAlign: 'center',
          margin: '0',
          padding: '0',
          fontFamily: "'Kimberly Bl', sans-serif"
        }}
      >
        Arènes
      </h1>
      <ArenaPicker disableInteractivity />
    </div>
  )
}
