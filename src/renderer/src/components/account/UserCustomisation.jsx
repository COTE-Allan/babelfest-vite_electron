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

/** Contexte utilisé pour partager customizedUserInfo au sein du composant */
const CustomizedUserInfoContext = createContext()

export default function UserCustomisation({ user, customizedUserInfo, setCustomizedUserInfo }) {
  const { userInfo } = useContext(AuthContext)
  const [page, setPage] = useState(1)
  const [hoveredSkin, setHoveredSkin] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showUnlocked, setShowUnlocked] = useState(false)
  const detailsRef = useRef(null)

  const skins = getSkins()

  /**
   * Filtre les skins en fonction de l'option "Uniquement débloqué"
   * et du type de skin. Regroupe ensuite par catégorie via groupByCategory.
   */
  function filterSkinsByType(type) {
    const base = skins.filter((skin) => skin.type === type)
    const filtered = showUnlocked
      ? base.filter((skin) => {
          // Lock "classique"
          const locked = !isUnlocked(skin, user)

          // Lock pour récompense classée
          let rankedLock = false
          if (skin.rankedReward) {
            const focusedSeason = userInfo.pastSeasons.find(
              (season) => season.id === skin.rankedReward.id
            )
            rankedLock = !(focusedSeason?.rankReached >= skin.rankedReward.rankNeeded)
          }

          // Lock pour flag
          let flagLock = false
          if (skin.flag) {
            flagLock = !userInfo.flags.includes(skin.flag)
          }

          return !locked && !rankedLock && !flagLock
        })
      : base

    return groupByCategory(filtered)
  }

  function groupByCategory(items) {
    return items.reduce((acc, item) => {
      const cat = item.category || 'Basiques' // par défaut si pas de category
      if (!acc[cat]) {
        acc[cat] = []
      }
      acc[cat].push(item)
      return acc
    }, {})
  }

  /** Gère la position du petit "tooltip" qui apparaît au survol d'un skin */
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (detailsRef.current) {
        const detailsRect = detailsRef.current.getBoundingClientRect()
        const componentWidth = detailsRect.width
        const componentHeight = detailsRect.height

        let x = e.clientX + 50
        let y = e.clientY - 50

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

  function ShowUnlockButton() {
    return (
      <div className="filter-container">
        <button className="filter-button" onClick={() => setShowUnlocked(!showUnlocked)}>
          {!showUnlocked ? 'Tous les cosmétiques' : 'Uniquement débloqués'}
        </button>
      </div>
    )
  }

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
          {/** PAGE 1 : AVATARS */}
          {page === 1 && (
            <CSSTransition key="custom-1" timeout={300} classNames="fade">
              <div className="css-transition">
                <h2>
                  Avatars <ShowUnlockButton />
                </h2>
                <div className="customize-list-wrapper">
                  {(() => {
                    const avatarsByCat = filterSkinsByType('Avatar')
                    return Object.entries(avatarsByCat).map(([catName, items]) => {
                      // on saute les catégories vides (sauf 'Basiques', qu'on veut forcer)
                      if (catName !== 'Basiques' && (!items || !items.length)) {
                        return null
                      }
                      return (
                        <div key={catName} className="category-block">
                          <h3>{catName}</h3>
                          <div className="customize-list">
                            {catName === 'Basiques' && (
                              <SkinItem
                                key="avatar-0"
                                type="avatar"
                                setHoveredSkin={setHoveredSkin}
                                skin={{
                                  lock: false,
                                  name: 'Rien',
                                  unlockTip: "N'équipez aucun avatar.",
                                  remove: true
                                }}
                              >
                                <img
                                  src={userInfo.skin.avatar}
                                  alt="avatar actuel de l'utilisateur"
                                  className="user-avatar"
                                />
                              </SkinItem>
                            )}
                            {items.map((avatar) => (
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
                      )
                    })
                  })()}
                </div>
              </div>
            </CSSTransition>
          )}

          {/** PAGE 2 : CADRES (déjà fait, on le laisse tel quel) */}
          {page === 2 && (
            <CSSTransition key="custom-2" timeout={300} classNames="fade">
              <div className="css-transition">
                <h2>
                  Cadres <ShowUnlockButton />
                </h2>
                <div className="customize-list-wrapper">
                  {(() => {
                    const framesBase = skins.filter((skin) => skin.type === 'Cadre')
                    const frames = showUnlocked
                      ? framesBase.filter((skin) => {
                          const locked = !isUnlocked(skin, user)
                          let rankedLock = false
                          if (skin.rankedReward) {
                            const focusedSeason = userInfo.pastSeasons.find(
                              (season) => season.id === skin.rankedReward.id
                            )
                            rankedLock = !(
                              focusedSeason?.rankReached >= skin.rankedReward.rankNeeded
                            )
                          }
                          let flagLock = false
                          if (skin.flag) {
                            flagLock = !userInfo.flags.includes(skin.flag)
                          }
                          return !locked && !rankedLock && !flagLock
                        })
                      : framesBase

                    const framesByCat = groupByCategory(frames)

                    return Object.entries(framesByCat).map(([catName, items]) => {
                      if (catName !== 'Basiques' && (!items || !items.length)) {
                        return null
                      }
                      return (
                        <div key={catName} className="category-block">
                          <h3>{catName}</h3>
                          <div className="customize-list">
                            {catName === 'Basiques' && (
                              <SkinItem
                                key="cadre-0"
                                type="cadre"
                                setHoveredSkin={setHoveredSkin}
                                skin={{
                                  lock: false,
                                  name: 'Rien',
                                  unlockTip: "N'équipez aucun cadre.",
                                  remove: true
                                }}
                              >
                                <img src={userInfo.skin.avatar} className="user-avatar" alt="" />
                              </SkinItem>
                            )}
                            {items?.map((el) => (
                              <SkinItem
                                key={el.id}
                                skin={el}
                                type="cadre"
                                setHoveredSkin={setHoveredSkin}
                              >
                                <img src={el.url} alt="visuel du cadre" className="skin" />
                                <img src={userInfo.skin.avatar} className="user-avatar" alt="" />
                              </SkinItem>
                            ))}
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            </CSSTransition>
          )}

          {/** PAGE 3 : TITRES */}
          {page === 3 && (
            <CSSTransition key="custom-3" timeout={300} classNames="fade">
              <div className="css-transition">
                <h2>
                  Titres <ShowUnlockButton />
                </h2>
                <div className="customize-list-wrapper">
                  {(() => {
                    const titlesByCat = filterSkinsByType('Titre')
                    return Object.entries(titlesByCat).map(([catName, items]) => {
                      if (catName !== 'Basiques' && (!items || !items.length)) {
                        return null
                      }
                      return (
                        <div key={catName} className="category-block">
                          <h3>{catName}</h3>
                          <div className="customize-list">
                            {catName === 'Basiques' && (
                              <SkinItem
                                key="titre-0"
                                type="titre"
                                setHoveredSkin={setHoveredSkin}
                                skin={{
                                  lock: false,
                                  name: 'Rien',
                                  unlockTip: "N'équipez aucun titre.",
                                  remove: true
                                }}
                              >
                                <span className="titre">Rien</span>
                              </SkinItem>
                            )}
                            {items.map((title) => (
                              <SkinItem
                                key={title.id}
                                skin={title}
                                type="titre"
                                setHoveredSkin={setHoveredSkin}
                              >
                                <span className="titre">{title.name}</span>
                              </SkinItem>
                            ))}
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            </CSSTransition>
          )}

          {/** PAGE 4 : BANNIÈRES */}
          {page === 4 && (
            <CSSTransition key="custom-4" timeout={300} classNames="fade">
              <div className="css-transition">
                <h2>
                  Bannières <ShowUnlockButton />
                </h2>
                <div className="customize-list-wrapper">
                  {(() => {
                    const bannersByCat = filterSkinsByType('Bannière')
                    return Object.entries(bannersByCat).map(([catName, items]) => {
                      if (catName !== 'Basiques' && (!items || !items.length)) {
                        return null
                      }
                      return (
                        <div key={catName} className="category-block">
                          <h3>{catName}</h3>
                          <div className="customize-list">
                            {items.map((banner) => (
                              <SkinItem
                                key={banner.id}
                                skin={banner}
                                type="banner"
                                setHoveredSkin={setHoveredSkin}
                              >
                                <img
                                  src={banner.url}
                                  alt="visuel de la bannière"
                                  className="skin"
                                />
                              </SkinItem>
                            ))}
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            </CSSTransition>
          )}

          {/** PAGE 5 : COULEURS */}
          {page === 5 && (
            <CSSTransition key="custom-5" timeout={300} classNames="fade">
              <div className="css-transition">
                <h2>
                  Couleurs <ShowUnlockButton />
                </h2>
                <div className="customize-list-wrapper">
                  {(() => {
                    const colorsByCat = filterSkinsByType('Couleur')
                    return Object.entries(colorsByCat).map(([catName, items]) => {
                      if (catName !== 'Basiques' && (!items || !items.length)) {
                        return null
                      }
                      return (
                        <div key={catName} className="category-block">
                          <h3>{catName}</h3>
                          <div className="customize-list">
                            {catName === 'Basiques' && (
                              <SkinItem
                                key="color-0"
                                type="color"
                                setHoveredSkin={setHoveredSkin}
                                skin={{
                                  lock: false,
                                  name: 'Rien',
                                  unlockTip: "N'équipez aucune couleur.",
                                  remove: true
                                }}
                              >
                                {/* Exemple d'affichage "aucune couleur" */}
                                <div className="color-div" style={{ background: '#bbb' }}></div>
                              </SkinItem>
                            )}
                            {items.map((color) => (
                              <SkinItem
                                key={color.id}
                                skin={color}
                                type="color"
                                setHoveredSkin={setHoveredSkin}
                              >
                                <div
                                  className="color-div"
                                  style={{
                                    background: color.gradient
                                      ? `linear-gradient(${color.hex}, ${color.gradient})`
                                      : color.hex
                                  }}
                                ></div>
                              </SkinItem>
                            ))}
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            </CSSTransition>
          )}

          {/** PAGE 6 : PRESTIGE */}
          {page === 6 && (
            <CSSTransition key="custom-6" timeout={300} classNames="fade">
              <div className="css-transition">
                <h2>
                  Prestige <ShowUnlockButton />
                </h2>
                <div className="customize-list-wrapper">
                  {(() => {
                    const prestigesByCat = filterSkinsByType('Prestige')
                    return Object.entries(prestigesByCat).map(([catName, items]) => {
                      if (catName !== 'Basiques' && (!items || !items.length)) {
                        return null
                      }
                      return (
                        <div key={catName} className="category-block">
                          <h3>{catName}</h3>
                          <div className="customize-list">
                            {catName === 'Basiques' && (
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
                                <div className="prestige prestige-default">Par défaut</div>
                              </SkinItem>
                            )}
                            {items.map((el) => (
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
                      )
                    })
                  })()}
                </div>
              </div>
            </CSSTransition>
          )}
        </TransitionGroup>

        {hoveredSkin && (
          <div
            ref={detailsRef}
            className={`details-modale ${hoveredSkin.type === 'Bannière' ? 'banner' : ''}`}
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
              <h2 className="skin-name">
                {hoveredSkin.name}{' '}
                {/* Si c'est débloqué ou pas : on affiche FaLock si c'est lock ? */}
                {!hoveredSkin.lock && <FaLock />}
              </h2>
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
  const { userSettings, userInfo } = useContext(AuthContext)
  const { customizedUserInfo, setCustomizedUserInfo, user } = useContext(CustomizedUserInfoContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const sendMessage = useSendMessage()

  // Vérification du lock
  let rankedLock = false
  if (skin.rankedReward) {
    const focusedSeason = userInfo.pastSeasons.find((season) => season.id === skin.rankedReward.id)
    rankedLock = !(focusedSeason?.rankReached >= skin.rankedReward.rankNeeded)
  }
  let flagLock = false
  if (skin.flag) {
    flagLock = !userInfo.flags.includes(skin.flag)
  }

  // On réécrit la propriété lock : elle est vraie si le user PEUT équiper (donc c'est débloqué)
  // Ce code correspond à "Cadre" : isUnlocked(skin) === true => lock = true => peut équiper
  // (c'est un peu contre-intuitif de l'appeler lock, mais on garde la logique existante)
  skin.lock = isUnlocked(skin, user) && !(rankedLock || flagLock)

  const relatedSkinsParams = {
    avatar: 'avatar',
    color: 'primaryColor',
    banner: 'banner',
    prestige: 'prestige',
    cadre: 'border',
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
    // S'il n'est pas débloqué, on affiche un message d'erreur
    if (!skin.lock) {
      sendMessage('Vous ne possédez pas ce cosmétique.', 'error')
      return
    }

    // Copie de l'objet user (ou customizedUserInfo), pour ne pas muter l'original
    let updatedUserInfo = customizedUserInfo ? { ...customizedUserInfo } : { ...user }

    // On applique la bonne valeur
    if (relatedSkinsParams[type]) {
      const paramKey = relatedSkinsParams[type]
      updatedUserInfo.skin[paramKey] = relatedSkinValue[type]
    }

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
