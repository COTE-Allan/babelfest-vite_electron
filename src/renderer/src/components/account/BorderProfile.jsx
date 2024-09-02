import { useContext, useState } from 'react'
import borderProfile from '../../jsons/skins/borders.json'
import { AuthContext } from '../../AuthContext'
import { FaLock } from 'react-icons/fa'
import SkinsButton from '../items/skinsButton'
import { isUnlocked } from '../others/toolBox'

export default function BorderProfile({ border, setBorder }) {
  const [pictureLabel, setPictureLabel] = useState([
    borderProfile[0].name,
    borderProfile[0].unlockTip,
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
            isSquare
            lockedCondition={true}
            selected={border === 'empty'}
            onClick={() => {
              if (border === 'empty') {
                setBorder(null)
              } else {
                setBorder('empty')
              }
            }}
            onMouseEnter={() => setPictureLabel(['Rien', "N'équipez aucune bordure.", []])}
            style={{
              backgroundImage: `url(https://res.cloudinary.com/dxdtcakuv/image/upload/v1704881325/babelfest/skins/borders/ibpu0aeyobuhme1keflw.webp)`,
              backgroundSize: 'contain'
            }}
          />
          {borderProfile.map((b) => {
            let lockedCondition = isUnlocked(b, userInfo)

            return (
              <SkinsButton
                isSquare
                onClick={() => {
                  if (lockedCondition && b.url !== border) {
                    if (border === b.url) {
                      setBorder(null)
                    } else {
                      setBorder(b.url)
                    }
                  }
                }}
                onMouseEnter={() => setPictureLabel([b.name, b.unlockTip, lockedCondition])}
                style={{
                  borderImage: `url(${b.url}) 0 fill`,
                  backgroundImage: `url(${userInfo.profilePic})`,
                  backgroundSize: 'contain'
                }}
                selected={border === b.url}
                lockedCondition={lockedCondition}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
