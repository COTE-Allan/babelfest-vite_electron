import '../../../styles/interface/inGame/hand.scss'

export default function Hand(props) {
  let whichHand = props.rival ? 'rival' : 'self'
  return (
    <div style={props.style} className={`hand ${whichHand} ${props.className}`}>
      {props.children}
    </div>
  )
}
