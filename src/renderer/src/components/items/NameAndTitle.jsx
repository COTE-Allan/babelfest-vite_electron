export function NameAndTitle({ user, nameClass = '', titleClass = '' }) {
  const isPrestigious = user.prestige && user.prestige !== 'none'
  const displayName = user.disconnected ? 'Deconnecté' : user.username
  const displayTitle = user.title === 'level' ? `Niveau ${user.level}` : user.title

  return (
    <>
      <span className={`name ${nameClass} ${isPrestigious ? 'prestige' : ''}`}>
        <div className={isPrestigious ? user.prestige : ''} data-text={displayName}>
          {displayName}
        </div>
      </span>
      {!user.disconnected && <span className={`title ${titleClass}`}>{displayTitle}</span>}
    </>
  )
}
