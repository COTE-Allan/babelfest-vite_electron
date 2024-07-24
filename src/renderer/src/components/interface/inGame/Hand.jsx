import '../../../styles/interface/inGame/hand.scss'

export default function Hand(props) {
  let whichHand = props.rival ? 'rival' : 'self'
  return <div className={`hand ${whichHand}`}>{props.children}</div>
}
