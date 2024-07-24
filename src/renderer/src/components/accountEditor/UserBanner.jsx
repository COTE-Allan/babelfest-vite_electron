import { useContext, useState } from 'react'
import userBanner from '../../jsons/skins/userBanner.json'
import { AuthContext } from '../../AuthContext'
import { FaLock } from 'react-icons/fa'
import SkinsButton from '../items/skinsButton'
import { isUnlocked } from '../others/toolBox'

export default function UserBanner({ banner, setBanner }) {
  const [pictureLabel, setPictureLabel] = useState([
    userBanner[0].name,
    userBanner[0].unlockTip,
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
          {userBanner.map((b) => {
            let lockedCondition = isUnlocked(b, userInfo)

            return (
              <SkinsButton
                isBanner={true}
                onClick={() => {
                  if (lockedCondition && b.url !== banner) {
                    if (banner === b.url) {
                      setBanner([])
                    } else {
                      setBanner(b.url)
                    }
                  }
                }}
                onMouseEnter={() => setPictureLabel([b.name, b.unlockTip, lockedCondition])}
                style={{
                  backgroundImage: `url(${b.url})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat'
                }}
                selected={banner === b.url}
                lockedCondition={lockedCondition}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
