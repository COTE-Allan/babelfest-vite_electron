import { getAllUniqueArtists } from '../others/toolBox'
import '../../styles/pages/credits.scss'
import BackButton from '../items/BackButton'
import Logo from '../../assets/svg/babelfest.svg'
import { FaHeart, FaMusic, FaPen } from 'react-icons/fa'

const Credits = () => {
  //  href="https://x.com/koffi_cup" target="_blank"
  //  href="https://x.com/kibanotox" target="_blank"
  const allArtists = getAllUniqueArtists()
  return (
    <div className="credits">
      <div className="credits-wrapper">
        <img src={Logo} className="logo" alt="Babelfest Logo" />
        <h2>
          Développé avec <FaHeart size={20} /> par :
        </h2>
        <hr />
        <div className="credits-item">
          <h2>Cielesis</h2>
          <ul className="credits-item-list">
            <li>Concepteur</li>
            <li>Développeur</li>
            <li>Communication</li>
          </ul>
        </div>
        <div className="credits-item">
          <h2>Kiba</h2>
          <ul className="credits-item-list">
            <li>Testeur</li>
            <li>Rédacteur</li>
            <li>Communication</li>
            <li>Ambassadeur</li>
          </ul>
        </div>
        <h2>
          <FaMusic size={20} /> Musiques :
        </h2>
        <hr />
        <div className="credits-item">
          <h2>Bande-originale par</h2>
          <ul className="credits-item-list">
            <li>713Manu</li>
          </ul>
        </div>
        <div className="credits-item">
          <h2>Sunrise Project OST - Before The End par :</h2>
          <ul className="credits-item-list">
            <li>Ayuumiko</li>
            <li>TBK</li>
            <li>Joshua Taipale</li>
          </ul>
        </div>
        <h2>
          <FaPen size={20} /> Assets :
        </h2>
        <hr />
        <div className="credits-item">
          <h2>Voix de Tuto par :</h2>
          <ul className="credits-item-list">
            <li>Kuroda</li>
          </ul>
        </div>
        <div className="credits-item">
          <h2>Artworks dessinés par :</h2>
          <ul className="credits-item-list">
            <li>Cielesis</li>
            <li>Kiba</li>
            <li>Hampoule</li>
            <li>Stain</li>
            <li>ZeCailloux</li>
            <li>YunenDraw</li>
          </ul>
        </div>
        <div className="credits-item">
          <h2>Et nos {allArtists.length} artistes</h2>
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
