import '../../styles/esthetics/cardsBackground.scss'
import BabelfestBackground from '../../assets/img/fond_babelfest.png'

export default function CardsBackground() {

  return (
    <>
      <div className={`carousel-filter`}></div>
      <div className="carousel">
            <img
              className={`carousel-picture`}
              src={BabelfestBackground}
              alt={'background du menu'}
              onLoad={() => setRegularLoaded(true)}
              />
      </div>
</>
  
  )
}

