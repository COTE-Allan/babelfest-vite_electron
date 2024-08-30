import { useTransition } from '../../TransitionContext'

const MenuCard = ({ name, desc, where, bg }) => {
  const { goForward } = useTransition()

  const handleForward = () => {
    goForward(where)
  }

  return (
    <div className="MenuCard" onClick={handleForward}>
      <span className="MenuCard-name">{name}</span>
      <span className="MenuCard-desc">{desc}</span>
      <img src={bg} className='MenuCard-bg' />
    </div>
  )
}

export default MenuCard
