import { useContext, useState } from 'react'
import profilePics from '../../jsons/skins/profilePics.json'
import { AuthContext } from '../../AuthContext'
import { FaLock } from 'react-icons/fa'
import SkinsButton from '../items/skinsButton'
import { isUnlocked } from '../others/toolBox'

export default function ProfilePics({ profile, setProfile }) {
  const [pictureLabel, setPictureLabel] = useState([
    profilePics[0].name,
    profilePics[0].unlockTip,
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
          {profilePics.map((pp) => {
            let lockedCondition = isUnlocked(pp, userInfo)

            return (
              <SkinsButton
                isSquare
                onClick={() => {
                  if (lockedCondition) {
                    if (profile === pp.url) {
                      setProfile(null)
                    } else {
                      setProfile(pp.url)
                    }
                  }
                }}
                onMouseEnter={() => setPictureLabel([pp.name, pp.unlockTip, lockedCondition])}
                style={{
                  backgroundImage: `url(${pp.url})`,
                  backgroundSize: 'contain'
                }}
                lockedCondition={lockedCondition}
                selected={profile === pp.url}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
