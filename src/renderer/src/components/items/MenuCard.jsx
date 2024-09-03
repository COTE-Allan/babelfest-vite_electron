import { useTransition } from '../../TransitionContext'

const MenuCard = ({ name, desc, where, bg, classNames }) => {
  const { goForward } = useTransition()

  const handleForward = () => {
    goForward(where)
  }

  return (
    <div className={`MenuCard ${classNames}`} onClick={handleForward}>
      <span className="MenuCard-name">{name}</span>
      <span className="MenuCard-desc">{desc}</span>
      <img src={bg} className="MenuCard-bg" />
    </div>
  )
}

export default MenuCard
