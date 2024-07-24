import React, { useContext } from 'react'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import '../../styles/pages/effects.scss'
import ReactFlipCard from 'reactjs-flip-card'
import useSound from 'use-sound'
import { AuthContext } from '../../AuthContext'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'
import { getAllEffects } from '../effects/basics'

const EffectsCategory = React.memo(function EffectsCategory({
  title,
  children,
  openCategory,
  setOpenCategory
}) {
  const [height, setHeight] = useState(0)
  const contentRef = useRef(null)

  const { userSettings } = useContext(AuthContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const categoryImages = {
    Pièges:
      'https://res.cloudinary.com/dxdtcakuv/image/upload/w_50/v1701520367/babelfest/icons/trap_buzj7i.webp',
    Malus:
      'https://res.cloudinary.com/dxdtcakuv/image/upload/w_50/v1705564482/babelfest/icons/muted.webp',
    Aléatoires:
      'https://res.cloudinary.com/dxdtcakuv/image/upload/w_50/v1701520365/babelfest/icons/d%C3%A9_r3sqg6.webp',
    Invocations:
      'https://res.cloudinary.com/dxdtcakuv/image/upload/w_50/v1701520365/babelfest/icons/minions_mr31r0.webp',
    Buffs:
      'https://res.cloudinary.com/dxdtcakuv/image/upload/w_50/v1701520356/babelfest/icons/forge_yoef1f.webp',
    Débuffs:
      'https://res.cloudinary.com/dxdtcakuv/image/upload/w_50/v1701520371/babelfest/icons/broken_fnn5ex.webp',
    Tactiques:
      'https://res.cloudinary.com/dxdtcakuv/image/upload/w_50/v1707128021/babelfest/icons/grapple.webp',
    Offensifs:
      'https://res.cloudinary.com/dxdtcakuv/image/upload/w_50/v1708527362/babelfest/icons/sword.webp'
  }
  const toggleOpen = useCallback(() => {
    setOpenCategory((prevOpenCategory) => (prevOpenCategory === title ? null : title))
  }, [title, setOpenCategory])

  useEffect(() => {
    setHeight(openCategory === title ? contentRef.current.scrollHeight : 0)
  }, [openCategory, title])

  return (
    <div className="effects-category fade-in">
      <h2
        className={`${openCategory === title ? 'active' : ''}`}
        onClick={() => {
          select()
          toggleOpen()
        }}
        onMouseEnter={hover}
      >
        <img src={categoryImages[title]} alt={`Icone de la catégorie ${title}`} />
        {title}
      </h2>
      <ul ref={contentRef} className="effects-list" style={{ height: `${height}px` }}>
        {children}
      </ul>
    </div>
  )
})

export default function Effects() {
  const effectsList = getAllEffects()
  const [openCategory, setOpenCategory] = useState(null)

  const { userSettings } = useContext(AuthContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })

  const groupEffectsByType = useCallback(
    (effects) =>
      effects.reduce((acc, effect) => {
        const { type } = effect
        acc[type] = acc[type] || []
        acc[type].push(effect)
        return acc
      }, {}),
    []
  )

  const groupedEffects = useMemo(
    () => groupEffectsByType(effectsList),
    [effectsList, groupEffectsByType]
  )

  return (
    <div className="effects">
      {Object.entries(groupedEffects).map(([type, effects]) => (
        <EffectsCategory
          title={type}
          key={type}
          openCategory={openCategory}
          setOpenCategory={setOpenCategory}
        >
          {effects.map((effect, index) => (
            <li className="effects-list-item" key={index} onMouseEnter={hover}>
              <ReactFlipCard
                containerCss="effects-list-item-card-container"
                flipCardCss="effects-list-item-card"
                frontComponent={
                  <div className="effects-list-item-recto">
                    <img src={effect.icon} alt={`Icone de l'effet ${effect.name}`} />
                    <span>{effect.name}</span>
                  </div>
                }
                backComponent={
                  <div className="effects-list-item-verso">
                    <span>{effect.name}</span>
                    <p>{effect.desc}</p>
                  </div>
                }
              />
            </li>
          ))}
        </EffectsCategory>
      ))}
    </div>
  )
}
