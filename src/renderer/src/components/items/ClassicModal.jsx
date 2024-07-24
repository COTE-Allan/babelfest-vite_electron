import '../../styles/items/modal.scss'

export default function Modal(props) {
  return (
    <>
      <div className={`modal ${props.className}`}>{props.children}</div>
    </>
  )
}
