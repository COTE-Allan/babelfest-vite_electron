export function NameAndTitle({ user, nameClass = '', titleClass = '' }) {
  const isPrestigious = user.skin.prestige && user.skin.prestige !== 'none'
  const displayName = user.disconnected ? 'Deconnecté' : user.username
  const displayTitle = user.skin.title === 'level' ? `Niveau ${user.stats.level}` : user.skin.title

  return (
    <>
      <span className={`name ${nameClass} ${isPrestigious ? 'prestige' : ''}`}>
        <div className={isPrestigious ? user.skin.prestige : ''} data-text={displayName}>
          {displayName}
        </div>
      </span>
      {!user.disconnected && <span className={`title ${titleClass}`}>{displayTitle}</span>}
    </>
  )
}
