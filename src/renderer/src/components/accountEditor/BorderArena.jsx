import { useContext, useState } from 'react'
import borderArena from '../../jsons/skins/borderArena.json'
import { AuthContext } from '../../AuthContext'
import { FaLock } from 'react-icons/fa'
import SkinsButton from '../items/skinsButton'

export default function BorderArena({ arena, setArena }) {
  const [pictureLabel, setPictureLabel] = useState([
    borderArena[0].name,
    borderArena[0].unlockTip,
    true
  ])
  const { userInfo } = useContext(AuthContext)

  return (
    <div className="skins-selector">
      <div className="skins-selector-infos">
        <span className="skins-selector-title">
          {pictureLabel[0]} {pictureLabel[2] === false && <FaLock />}
        </span>
        <span className="skins-selector-desc">{pictureLabel[1]}</span>
      </div>
      <div className="skins-selector-list-wrapper">
        <div className="skins-selector-list">
          <SkinsButton
            isArena={true}
            lockedCondition={true}
            selected={arena === 'empty'}
            onClick={() => {
              if (arena === 'empty') {
                setArena([])
              } else {
                setArena('empty')
              }
            }}
            onMouseEnter={() =>
              setPictureLabel([
                'Simpliste',
                "Une arène simple, reprenant votre couleur d'arène.",
                []
              ])
            }
            style={{
              backgroundColor: userInfo.primaryColor,
              padding: 50
            }}
          />
          {borderArena.map((b) => {
            let lockedCondition = (userInfo.flags && userInfo.flags.includes(b.flag)) || !b.flag
            return (
              <SkinsButton
                isArena={true}
                onClick={() => {
                  if (lockedCondition && b.url !== arena) {
                    if (arena.includes(b.url)) {
                      setArena([])
                    } else {
                      setArena([b.url, b.reverse])
                    }
                  }
                }}
                onMouseEnter={() => setPictureLabel([b.name, b.unlockTip, lockedCondition])}
                style={{
                  backgroundImage: `url(${b.url})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat'
                }}
                selected={arena.includes(b.url)}
                lockedCondition={lockedCondition}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
