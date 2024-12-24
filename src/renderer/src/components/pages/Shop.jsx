import '../../styles/pages/shop.scss'
import { AuthContext } from '../../AuthContext'
import { useContext, useState } from 'react'
import useSound from 'use-sound'
import selectSfx from '../../assets/sfx/menu_select.wav'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import BackButton from '../items/BackButton'
import HudNavLink from '../items/hudNavLink'
import { FaCheck, FaPatreon, FaStar, FaTshirt } from 'react-icons/fa'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { GiTwoCoins } from 'react-icons/gi'
import { getAllAlternates } from '../others/toolBox'
import Modal from '../items/ClassicModal'
import Tilt from 'react-parallax-tilt'
import { ImCross } from 'react-icons/im'

const Shop = () => {
  const { userSettings, userInfo, addIdToUserList } = useContext(AuthContext)
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [page, setPage] = useState(1)
  const [buyingAlternate, setBuyingAlternate] = useState(null)
  let allAlternates = getAllAlternates()

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
        <TransitionGroup className={'menuShop-transitionGroup'}>
          {page === 1 && (
            <CSSTransition key="menuShop-1" timeout={300} classNames="fade">
              <div className="css-transition">
                <div className="menuShop-list">
                  {allAlternates.map((card) => (
                    <div
                      className={`menuShop-list-card ${userInfo.alternates.includes(card.altId) && 'sold'}`}
                      key={card.altId}
                      onMouseEnter={() => {
                        if (!userInfo.alternates.includes(card.altId)) zhover()
                      }}
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
                      <h3>Par {card.artist}</h3>
                    </div>
                  ))}
                </div>
              </div>
            </CSSTransition>
          )}
          {page === 2 && (
            <CSSTransition key="menuShop-2" timeout={300} classNames="fade">
              <div className="css-transition"></div>
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
                addIdToUserList('alternates', buyingAlternate.altId, buyingAlternate.cost)
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
      <BackButton />
    </div>
  )
}

export default Shop
