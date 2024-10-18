import { FaLock, FaLockOpen } from 'react-icons/fa'

function SkinItem({ skin, userInfo, xpPercentage, rankReward = false }) {
  const { level, url, hex, gradient, name, classe } = skin
  const lock = userInfo.level >= level ? <FaLockOpen /> : <FaLock />
  let content

  if (url) {
    content = <img src={url} alt={`Skin ${name}`} draggable="false" />
  } else if (hex) {
    content = (
      <div
        className={`color ${skin.classes ? skin.classes : ''}`}
        style={{
          background: gradient ? `linear-gradient(to bottom, ${hex}, ${gradient})` : hex
        }}
      />
    )
  } else if (classe) {
    content = (
      <span className={`title prestige skin-title`}>
        <div className={classe}>{userInfo.username}</div>
      </span>
    )
  } else {
    content = <span className="skin-title">{name}</span>
  }

  // Determine if the progress bar should be full width (100%)
  const isUnlocked = userInfo.level >= level
  const progressWidth = isUnlocked ? 100 : xpPercentage

  return (
    <div
      className={`achievements-levels-item ${isUnlocked && 'unlocked'}`}
      key={skin.id || skin.name}
      style={{
        position: 'relative', // Required for positioning the background progress bar
        backgroundColor: 'rgba(43, 43, 43, 0.3)'
      }}
    >
      <div className="achievements-levels-item-wrapper">
        {!rankReward && 
        <>
        <span className="level">{level}</span>
        <hr />
        </>
        }
        {content}
        {skin.type !== 'Titre' && <span className="skin-name">{name}</span>}
        <span className="type">
          {skin.type} {!rankReward && lock}
        </span>
      </div>
      {/* Add a div to show XP progress */}
      {progressWidth > 0 && (
        <div
          className="xp-progress-background"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            opacity: 0.5,
            height: '100%',
            width: `${progressWidth}%`, // Set width based on XP percentage or full width if unlocked
            backgroundColor: userInfo.primaryColor.hex + '80', // Semi-transparent color for visual effect
            zIndex: 0, // Ensure it’s behind the content
            borderRadius: '4px'
          }}
        />
      )}
    </div>
  )
}

export default SkinItem
