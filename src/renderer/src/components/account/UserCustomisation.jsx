import React, { useContext, useEffect, useState, useRef, createContext } from 'react'
import { AuthContext } from '../../AuthContext'
import '../../styles/account/userCustomisation.scss'
import HudNavLink from '../items/hudNavLink'
import { AiFillGold } from 'react-icons/ai'
import { IoIosColorPalette } from 'react-icons/io'
import { PiFlagBannerFill } from 'react-icons/pi'
import { MdOutlineTitle } from 'react-icons/md'
import { FaBorderTopLeft, FaLock } from 'react-icons/fa6'
import { BiSolidUserRectangle } from 'react-icons/bi'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { getSkins, isUnlocked, useSendMessage } from '../others/toolBox'
import useSound from 'use-sound'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'

// Créer un contexte pour customizedUserInfo
const CustomizedUserInfoContext = createContext()

export default function UserCustomisation({ user, customizedUserInfo, setCustomizedUserInfo }) {
  const { userInfo } = useContext(AuthContext)
  const [page, setPage] = useState(1)
  const [hoveredSkin, setHoveredSkin] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const detailsRef = useRef(null)

  const skins = getSkins()

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (detailsRef.current) {
        const detailsRect = detailsRef.current.getBoundingClientRect()
        const componentWidth = detailsRect.width
        const componentHeight = detailsRect.height

        // Positionner légèrement à droite et en dessous du curseur
        let x = e.clientX + 50
        let y = e.clientY - 50

        // Empêcher la modale de sortir de l'écran (à droite ou en bas)
        if (x + componentWidth > window.innerWidth) {
          x = e.clientX - componentWidth - 20
        }

        if (y + componentHeight > window.innerHeight) {
          y = e.clientY - componentHeight - 20
        }

        setMousePosition({ x, y })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <CustomizedUserInfoContext.Provider value={{ customizedUserInfo, setCustomizedUserInfo, user }}>
      <div className="customize">
        <nav className="customize-nav">
          <HudNavLink onClick={() => setPage(1)} selected={page === 1} permOpen>
            <BiSolidUserRectangle size={45} />
            <span className="hidden-span">Avatar</span>
          </HudNavLink>
          <HudNavLink onClick={() => setPage(2)} selected={page === 2} permOpen>
            <FaBorderTopLeft size={45} />
            <span className="hidden-span">Cadre</span>
          </HudNavLink>
          <HudNavLink onClick={() => setPage(3)} selected={page === 3} permOpen>
            <MdOutlineTitle size={45} />
            <span className="hidden-span">Titre</span>
          </HudNavLink>
          <HudNavLink onClick={() => setPage(4)} selected={page === 4} permOpen>
            <PiFlagBannerFill size={45} />
            <span className="hidden-span">Bannière</span>
          </HudNavLink>
          <HudNavLink onClick={() => setPage(5)} selected={page === 5} permOpen>
            <IoIosColorPalette size={45} />
            <span className="hidden-span">Couleurs</span>
          </HudNavLink>
          <HudNavLink onClick={() => setPage(6)} selected={page === 6} permOpen>
            <AiFillGold size={45} />
            <span className="hidden-span">Prestige</span>
          </HudNavLink>
        </nav>
        <TransitionGroup className="customize-content">
          {page === 1 && (
            <CSSTransition key="custom-1" timeout={300} classNames="fade">
              <div className="css-transition">
                <h2>Avatars</h2>
                <div className="customize-list">
                  {skins
                    .filter((skin) => skin.type === 'Avatar')
                    .map((avatar) => (
                      <SkinItem
                        key={avatar.id}
                        skin={avatar}
                        type="avatar"
                        setHoveredSkin={setHoveredSkin}
                      >
                        <img src={avatar.url} alt="visuel de l'avatar" />
                      </SkinItem>
                    ))}
                </div>
              </div>
            </CSSTransition>
          )}
          {page === 2 && (
            <CSSTransition key="custom-2" timeout={300} classNames="fade">
              <div className="css-transition">
                <h2>Cadres</h2>
                <div className="customize-list">
                  <SkinItem
                    key="cadre-0"
                    type="cadre"
                    setHoveredSkin={setHoveredSkin}
                    skin={{
                      lock: false,
                      name: 'Rien',
                      unlockTip: "N'équipez aucune bordure.",
                      remove: true
                    }}
                  >
                    <img src={userInfo.profilePic} className="user-avatar" />{' '}
                  </SkinItem>
                  {skins
                    .filter((skin) => skin.type === 'Bordure')
                    .map((el) => (
                      <SkinItem key={el.id} skin={el} type="cadre" setHoveredSkin={setHoveredSkin}>
                        <img src={el.url} alt="visuel du cadre" className="skin" />
                        <img src={userInfo.profilePic} className="user-avatar" />
                      </SkinItem>
                    ))}
                </div>
              </div>
            </CSSTransition>
          )}
          {page === 3 && (
            <CSSTransition key="custom-3" timeout={300} classNames="fade">
              <div className="css-transition">
                <h2>Titres</h2>
                <div className="customize-list">
                  {skins
                    .filter((skin) => skin.type === 'Titre')
                    .map((el) => (
                      <SkinItem key={el.id} skin={el} type="titre" setHoveredSkin={setHoveredSkin}>
                        <span className="titre">{el.name}</span>
                      </SkinItem>
                    ))}
                </div>
              </div>
            </CSSTransition>
          )}
          {page === 4 && (
            <CSSTransition key="custom-4" timeout={300} classNames="fade">
              <div className="css-transition">
                <h2>Bannières</h2>
                <div className="customize-list">
                  {skins
                    .filter((skin) => skin.type === 'Bannière')
                    .map((el) => (
                      <SkinItem key={el.id} skin={el} type="banner" setHoveredSkin={setHoveredSkin}>
                        <img src={el.url} alt="visuel du cadre" className="skin" />
                      </SkinItem>
                    ))}
                </div>
              </div>
            </CSSTransition>
          )}
          {page === 5 && (
            <CSSTransition key="custom-5" timeout={300} classNames="fade">
              <div className="css-transition">
                <h2>Couleurs</h2>
                <div className="customize-list">
                  {skins
                    .filter((skin) => skin.type === 'Couleur')
                    .map((el) => (
                      <SkinItem key={el.id} skin={el} type="color" setHoveredSkin={setHoveredSkin}>
                        <div
                          className="color-div"
                          style={{
                            background: el.gradient
                              ? `linear-gradient(${el.hex}, ${el.gradient})`
                              : el.hex
                          }}
                        ></div>
                      </SkinItem>
                    ))}
                </div>
              </div>
            </CSSTransition>
          )}
          {page === 6 && (
            <CSSTransition key="custom-6" timeout={300} classNames="fade">
              <div className="css-transition">
                <h2>Prestige</h2>
                <div className="customize-list">
                  <SkinItem
                    key="prestige-0"
                    type="prestige"
                    setHoveredSkin={setHoveredSkin}
                    skin={{
                      lock: false,
                      name: 'Par défaut',
                      unlockTip: 'Prestige par défaut.',
                      remove: true
                    }}
                  >
                    <div className={`prestige prestige-default`}>Par défaut</div>
                  </SkinItem>
                  {skins
                    .filter((skin) => skin.type === 'Prestige')
                    .map((el) => (
                      <SkinItem
                        key={el.id}
                        skin={el}
                        type="prestige"
                        setHoveredSkin={setHoveredSkin}
                      >
                        <div className={`prestige ${el.classe}`}>{el.name}</div>
                      </SkinItem>
                    ))}
                </div>
              </div>
            </CSSTransition>
          )}
        </TransitionGroup>

        {hoveredSkin && (
          <div
            ref={detailsRef}
            className={`details-modale ${hoveredSkin.type === 'Bannière' && 'banner'}`}
            style={{
              left: `${mousePosition.x}px`,
              top: `${mousePosition.y}px`
            }}
          >
            {hoveredSkin.url && <img src={hoveredSkin.url} alt="visuel du skin" />}
            {hoveredSkin.hex && (
              <div
                className="color-div"
                style={{
                  background: hoveredSkin.gradient
                    ? `linear-gradient(${hoveredSkin.hex}, ${hoveredSkin.gradient})`
                    : hoveredSkin.hex
                }}
              ></div>
            )}
            <div className="details-modale-content">
              {hoveredSkin.classe ? (
                <h2 className="skin-name prestige">
                  <div className={hoveredSkin.classe}>
                    {hoveredSkin.name} {!hoveredSkin.lock && <FaLock />}
                  </div>
                </h2>
              ) : (
                <h2 className="skin-name">
                  {hoveredSkin.name} {!hoveredSkin.lock && <FaLock />}
                </h2>
              )}
              {hoveredSkin.author && <span className="skin-artist">Par {hoveredSkin.author}</span>}
              <p className="skin-unlock-method">{hoveredSkin.unlockTip}</p>
              {hoveredSkin.lock ? (
                <p className="skin-equip">Cliquez pour équiper !</p>
              ) : (
                <p className="skin-locked">Vous ne possédez pas ce cosmétique.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </CustomizedUserInfoContext.Provider>
  )
}

function SkinItem({ skin, type, children, setHoveredSkin }) {
  const { userSettings } = useContext(AuthContext)
  const { customizedUserInfo, setCustomizedUserInfo, user } = useContext(CustomizedUserInfoContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  skin.lock = isUnlocked(skin, user)
  const sendMessage = useSendMessage()

  const relatedSkinsParams = {
    avatar: 'profilePic',
    color: 'primaryColor',
    banner: 'banner',
    prestige: 'prestige',
    cadre: 'profileBorder',
    titre: 'title'
  }

  const relatedSkinValue = {
    avatar: skin.url,
    color: { hex: skin.hex, gradient: skin.gradient ?? null },
    banner: skin.url,
    prestige: skin.classe,
    cadre: skin.url,
    titre: skin.name
  }

  const handleEnter = () => {
    hover()
    setHoveredSkin(skin)
  }

  const handleLeave = () => {
    setHoveredSkin(null)
  }

  const handleClick = () => {
    select()

    if (!skin.lock) {
      sendMessage('Vous ne possédez pas ce cosmétique.', 'error')
      return
    }

    // Si customizedUserInfo est null, on le remplace par userInfo
    let updatedUserInfo = customizedUserInfo ? { ...customizedUserInfo } : { ...user }

    // Appliquer la bonne valeur selon le type
    if (relatedSkinsParams[type]) {
      const paramKey = relatedSkinsParams[type]
      updatedUserInfo[paramKey] = relatedSkinValue[type]
    }

    // Mettre à jour customizedUserInfo
    setCustomizedUserInfo(updatedUserInfo)
  }

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      className={`customize-list-item ${type} ${!skin.lock ? 'disabled' : ''}`}
    >
      {children}
    </div>
  )
}
