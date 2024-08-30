import { useTransition } from '../../TransitionContext'

const MenuCard = ({ name, desc, where }) => {
  const { goForward } = useTransition()

  const handleForward = () => {
    goForward(where)
  }

  return (
    <div className="MenuCard" onClick={handleForward}>
      <span className="MenuCard-name">{name}</span>
      <span className="MenuCard-desc">{desc}</span>
    </div>
  )
}

export default MenuCard
