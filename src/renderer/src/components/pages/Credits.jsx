import { getAllUniqueArtists } from '../others/toolBox'
import '../../styles/pages/credits.scss'
import BackButton from '../items/BackButton'
import Logo from '../../assets/svg/babelfest.svg'

const Credits = () => {
  //  href="https://x.com/koffi_cup" target="_blank"
  //  href="https://x.com/kibanotox" target="_blank"
  const allArtists = getAllUniqueArtists()
  return (
    <div className="credits">
      <div className="credits-wrapper">
        <img src={Logo} className="logo" alt="Babelfest Logo" />
        <div className="credits-item">
          <h2>Développé par Cielesis :</h2>
          <hr />
          <ul className="credits-item-list">
            <li>Concepteur</li>
            <li>Développeur</li>
            <li>Communication</li>
          </ul>
        </div>
        <div className="credits-item">
          <h2>Avec l'assistance de Kiba :</h2>
          <hr />
          <ul className="credits-item-list">
            <li>Testeur</li>
            <li>Rédacteur</li>
            <li>Communication</li>
            <li>Ambassadeur</li>
          </ul>
        </div>
        <div className="credits-item">
          <h2>Bande-originale par :</h2>
          <hr />
          <ul className="credits-item-list">
            <li>713Manu</li>
          </ul>
        </div>
        <div className="credits-item">
          <h2>Artworks dessinés par :</h2>
          <hr />
          <ul className="credits-item-list">
            <li>Cielesis</li>
            <li>Kiba</li>
            <li>Hampoule</li>
          </ul>
        </div>
        <div className="credits-item">
          <h2>Et nos {allArtists.length} artistes :</h2>
          <hr />
          <ul>
            {allArtists.map((artist) => (
              <li>{artist}</li>
            ))}
          </ul>
          <a className="md" target="_blank" href="https://www.mangadraft.com/">
            Retrouvez leurs histoires sur Mangadraft !
          </a>
        </div>
      </div>

      <BackButton />
    </div>
  )
}

export default Credits
