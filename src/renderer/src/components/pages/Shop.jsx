import '../../styles/pages/shop.scss'
import { AuthContext } from '../../AuthContext'
import { useContext, useState, useEffect } from 'react'
import useSound from 'use-sound'
import selectSfx from '../../assets/sfx/menu_select.wav'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import BackButton from '../items/BackButton'
import HudNavLink from '../items/hudNavLink'
import { FaCheck, FaPatreon, FaStar, FaTshirt } from 'react-icons/fa'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { GiTwoCoins } from 'react-icons/gi'
import { getAllAlternates, getAllShopSkin } from '../others/toolBox'
import Modal from '../items/ClassicModal'
import Tilt from 'react-parallax-tilt'
import { ImCross } from 'react-icons/im'
import { useLocation } from 'react-router-dom'

const Shop = () => {
  const { userSettings, userInfo, addIdToUserList, loginWithPatreon } = useContext(AuthContext)
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })

  const [page, setPage] = useState(1)
  const [buyingAlternate, setBuyingAlternate] = useState(null)
  const [buyingSkin, setBuyingSkin] = useState(null)

  // Barre de recherche alternates
  const [searchAlternate, setSearchAlternate] = useState('')
  // Barre de recherche cosmétiques
  const [searchCosmetic, setSearchCosmetic] = useState('')
  // Sélecteur de type pour les cosmétiques
  const [selectedCosmeticType, setSelectedCosmeticType] = useState('Tous')

  // Récupération des données
  let allAlternates = getAllAlternates()
  let shopSkins = getAllShopSkin()

  // Regrouper les cosmétiques par "type"
  const shopSkinsByType = shopSkins.reduce((acc, skin) => {
    const skinType = skin.type || 'Autre' // si jamais 'type' est undefined
    if (!acc[skinType]) {
      acc[skinType] = []
    }
    acc[skinType].push(skin)
    return acc
  }, {})

  // Filtrer les alternates en fonction de la barre de recherche
  const filteredAlternates = allAlternates.filter((alt) => {
    // Cherche dans alt.name ou alt.title
    const lowerSearch = searchAlternate.toLowerCase()
    return (
      alt.name.toLowerCase().includes(lowerSearch) || alt.title.toLowerCase().includes(lowerSearch)
    )
  })

  // Préparer les cosmétiques pour l’affichage :
  // 1) Filtre par type si selectedCosmeticType != 'Tous'
  // 2) Filtre par nom (ou artiste, selon ton envie) via searchCosmetic
  // On construit un nouvel objet { type -> liste filtrée }
  const filteredShopSkinsByType = Object.entries(shopSkinsByType)
    .filter(([type]) => {
      // Garde toutes les entrées si "Tous", sinon uniquement la clé qui correspond
      if (selectedCosmeticType === 'Tous') return true
      return type === selectedCosmeticType
    })
    .map(([type, skins]) => {
      // On filtre la liste skins par rapport à searchCosmetic
      const lowerSearch = searchCosmetic.toLowerCase()
      const filtered = skins.filter(
        (skin) =>
          skin.name.toLowerCase().includes(lowerSearch) ||
          (skin.author && skin.author.toLowerCase().includes(lowerSearch))
      )
      return [type, filtered]
    })

  return (
    <div className="menuShop">
      <div className="menuShop-wrapper">
        <nav className="menuShop-nav">
          <HudNavLink onClick={() => setPage(1)} selected={page === 1} permOpen>
            <FaStar size={35} />
            <span className="hidden-span">Alternates</span>
          </HudNavLink>
          <HudNavLink onClick={() => setPage(2)} selected={page === 2} permOpen>
            <FaTshirt size={35} />
            <span className="hidden-span">Cosmétiques</span>
          </HudNavLink>
          <HudNavLink
            className="prestige"
            onClick={() => setPage(3)}
            selected={page === 3}
            permOpen
          >
            <FaPatreon size={35} color="#d4af37" />
            <div className="hidden-span prestige-gold">Patreon Babelfest</div>
          </HudNavLink>
        </nav>
        <hr />

        <TransitionGroup className="menuShop-transitionGroup">
          {page === 1 && (
            <CSSTransition key="menuShop-1" timeout={300} classNames="fade">
              <div className="css-transition">
                {/* Barre de recherche pour alternates */}
                <div className="search-controls">
                  <input
                    type="text"
                    placeholder="Rechercher une carte..."
                    value={searchAlternate}
                    onChange={(e) => setSearchAlternate(e.target.value)}
                  />
                </div>
                <p>Les Alternates sont des skins pour vos cartes, équipez-les en créant un deck.</p>
                <div className="menuShop-list">
                  {filteredAlternates.map((card) => (
                    <div
                      className={`menuShop-list-card ${
                        userInfo.alternates.includes(card.altId) && 'sold'
                      }`}
                      key={card.altId}
                      onClick={() => {
                        if (!userInfo.alternates.includes(card.altId)) {
                          select()
                          setBuyingAlternate(card)
                        }
                      }}
                    >
                      <span>
                        {!userInfo.alternates.includes(card.altId) ? (
                          <>
                            <GiTwoCoins size={30} /> {card.cost}
                          </>
                        ) : (
                          <>
                            <FaCheck size={30} /> Acheté !
                          </>
                        )}
                      </span>
                      <img src={card.url} alt={card.altId} />
                      <h1>{card.name}</h1>
                      <h2>{card.title}</h2>
                      <h3>Par {card.author}</h3>
                    </div>
                  ))}
                </div>
              </div>
            </CSSTransition>
          )}

          {page === 2 && (
            <CSSTransition key="menuShop-2" timeout={300} classNames="fade">
              <div className="css-transition">
                {/* Contrôles de recherche / tri pour cosmétiques */}
                <div className="search-controls">
                  <select
                    value={selectedCosmeticType}
                    onChange={(e) => setSelectedCosmeticType(e.target.value)}
                  >
                    <option value="Tous">Tous les types</option>
                    {Object.keys(shopSkinsByType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Rechercher un cosmétique..."
                    value={searchCosmetic}
                    onChange={(e) => setSearchCosmetic(e.target.value)}
                  />
                </div>
                <div className="menuShop-list-wrapper">
                  {/* On parcourt les types filtrés */}
                  {filteredShopSkinsByType.map(([type, skins]) => {
                    // S'il n'y a aucun skin après filtrage, on saute
                    if (!skins || !skins.length) return null
                    let isBorder = type === 'Cadre'

                    return (
                      <div key={type} className="menuShop-typeSection">
                        <h2>{type}</h2>
                        <div className="menuShop-list">
                          {skins.map((skin) => (
                            <div
                              className={`menuShop-list-card ${
                                userInfo.shopFlags.includes(skin.shopFlag) && 'sold'
                              } ${skin.type}`}
                              key={skin.shopFlag}
                              onClick={() => {
                                if (!userInfo.shopFlags.includes(skin.shopFlag)) {
                                  select()
                                  // Ici, tu peux lancer une modal “acheter ce skin”
                                  setBuyingSkin(skin)
                                }
                              }}
                            >
                              <span>
                                {!userInfo.shopFlags.includes(skin.shopFlag) ? (
                                  <>
                                    <GiTwoCoins size={30} /> {skin.cost}
                                  </>
                                ) : (
                                  <>
                                    <FaCheck size={30} /> Acheté !
                                  </>
                                )}
                              </span>
                              <div className="skin-img-container">
                                <img
                                  className="skin skin-main"
                                  src={skin.url}
                                  alt={skin.shopFlag}
                                />
                                {isBorder && (
                                  <img className="skin-avatar" src={userInfo.skin.avatar} />
                                )}
                              </div>
                              <h1>{skin.name}</h1>
                              <h3>Par {skin.author}</h3>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CSSTransition>
          )}

          {page === 3 && (
            <CSSTransition key="menuShop-3" timeout={300} classNames="fade">
              <div className="css-transition">
                {/* Patreon ici */}
                <div className="patreon-content">
                  <div className="prestige">
                    <div className="prestige-gold">
                      <h1>Deviens Patreon Babelfest pour soutenir le jeu !</h1>
                      <p>Obtient chaque mois des récompenses exlusives de manière DÉFINITIVE !</p>
                    </div>
                  </div>
                  <div className="patreon-list">
                    <div className={`patreon-list-card`}>
                      {/* <img src={skin.url} alt={skin.shopFlag} /> */}
                      <h3>1 Mois</h3>
                      <div className="patreon-list-card-wrapper">
                        <div className="prestige">
                          <div className="prestige-gold">
                            <h1>Plaqué Or</h1>
                          </div>
                        </div>
                        <h2>Prestige</h2>
                      </div>
                    </div>
                    <div className={`patreon-list-card`}>
                      <h3>2 Mois</h3>
                      <div className="patreon-list-card-wrapper">
                        <img
                          src={'./skins/banners/banner_patreon_month_2.png'}
                          alt="banner 2 month of patreon"
                        />
                        <h1>Patreon fidèle</h1>
                        <h2>Bannière</h2>
                      </div>
                    </div>
                  </div>
                  <a
                    href="https://patreon.com/user?u=101887164&utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink"
                    target="blank_"
                    className="prestige"
                    onMouseEnter={hover}
                    onClick={select}
                  >
                    <div className="prestige-gold">Je m'abonne !</div>
                  </a>
                  <p className="patreon-warn">
                    La distribution des skins n'est pas encore automatisée. Contactez Cielesis sur
                    Discord pour obtenir vos récompenses.
                  </p>
                </div>
              </div>
            </CSSTransition>
          )}
        </TransitionGroup>

        <span className="menuShop-coinCount">
          <GiTwoCoins size={30} /> {userInfo.stats.coins}
        </span>
      </div>

      {/* Buying alternate */}
      {buyingAlternate && (
        <Modal className="confirmShop">
          <Tilt
            glareEnable={true}
            glareMaxOpacity={0.2}
            glareColor="#ffffff"
            glarePosition="bottom"
            glareBorderRadius="5px"
            gyroscope={true}
            tiltMaxAngleX={7}
            tiltMaxAngleY={7}
            className="confirmShop-card"
          >
            <div className="img-container">
              <img src={buyingAlternate.url} alt={`détails de la carte ${buyingAlternate.altId}`} />
            </div>
          </Tilt>
          <h1>
            Voulez-vous vraiment acheter '{buyingAlternate.name} - {buyingAlternate.title}' pour
            <GiTwoCoins size={30} /> {buyingAlternate.cost} ?
          </h1>
          <div className="confirmShop-controller">
            <HudNavLink
              permOpen
              onClick={() => {
                addIdToUserList(
                  'alternates',
                  buyingAlternate.altId,
                  buyingAlternate.cost,
                  userInfo.alternates.length + userInfo.shopFlags.length
                )
                setBuyingAlternate(null)
              }}
            >
              <FaCheck size={30} color="green" />
              <span className="hidden-span">Acheter</span>
            </HudNavLink>
            <HudNavLink permOpen className="red" onClick={() => setBuyingAlternate(null)}>
              <ImCross size={30} color="#e62e31" />
              <span className="hidden-span">Annuler</span>
            </HudNavLink>
          </div>
        </Modal>
      )}

      {/* Buying skin */}
      {buyingSkin && (
        <Modal className="confirmShop">
          <div className={`img-container skin-container ${buyingSkin.type}`}>
            <img src={buyingSkin.url} alt={`détails de la carte ${buyingSkin.shopFlag}`} />
          </div>
          <h1>
            Voulez-vous vraiment acheter '{buyingSkin.name}' pour
            <GiTwoCoins size={30} /> {buyingSkin.cost} ?
          </h1>
          <div className="confirmShop-controller">
            <HudNavLink
              permOpen
              onClick={() => {
                addIdToUserList(
                  'shopFlags',
                  buyingSkin.shopFlag,
                  buyingSkin.cost,
                  userInfo.alternates.length + userInfo.shopFlags.length
                )
                setBuyingSkin(null)
              }}
            >
              <FaCheck size={30} color="green" />
              <span className="hidden-span">Acheter</span>
            </HudNavLink>
            <HudNavLink permOpen className="red" onClick={() => setBuyingSkin(null)}>
              <ImCross size={30} color="#e62e31" />
              <span className="hidden-span">Annuler</span>
            </HudNavLink>
          </div>
        </Modal>
      )}

      <BackButton />
    </div>
  )
}

export default Shop
