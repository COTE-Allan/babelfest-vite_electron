import React, { useContext } from 'react'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import '../../styles/pages/effects.scss'
import ReactFlipCard from 'reactjs-flip-card'
import useSound from 'use-sound'
import { AuthContext } from '../../AuthContext'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'
import { getAllEffects } from '../effects/basics'
import Modal from '../items/ClassicModal'
import HudNavLink from '../items/hudNavLink'
import { ImCross } from 'react-icons/im'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

export default function Effects() {
  const effectsList = getAllEffects()
  const [selectedCategory, setSelectedCategory] = useState(null)

  const { userSettings } = useContext(AuthContext)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })

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

  const categoryImages = {
    Pièges:
      'https://res.cloudinary.com/dxdtcakuv/image/upload/w_75/v1701520367/babelfest/icons/trap_buzj7i.webp',
    Malus:
      'https://res.cloudinary.com/dxdtcakuv/image/upload/w_75/v1705564482/babelfest/icons/muted.webp',
    Aléatoires:
      'https://res.cloudinary.com/dxdtcakuv/image/upload/w_75/v1701520365/babelfest/icons/d%C3%A9_r3sqg6.webp',
    Invocations:
      'https://res.cloudinary.com/dxdtcakuv/image/upload/w_75/v1701520365/babelfest/icons/minions_mr31r0.webp',
    Buffs:
      'https://res.cloudinary.com/dxdtcakuv/image/upload/w_75/v1701520356/babelfest/icons/forge_yoef1f.webp',
    Débuffs:
      'https://res.cloudinary.com/dxdtcakuv/image/upload/w_75/v1701520371/babelfest/icons/broken_fnn5ex.webp',
    Tactiques:
      'https://res.cloudinary.com/dxdtcakuv/image/upload/w_75/v1707128021/babelfest/icons/grapple.webp',
    Offensifs:
      'https://res.cloudinary.com/dxdtcakuv/image/upload/w_75/v1708527362/babelfest/icons/sword.webp'
  }

  const categories = Object.keys(groupedEffects)

  const getNextCategory = (currentCategory) => {
    const currentIndex = categories.indexOf(currentCategory)
    return currentIndex < categories.length - 1 ? categories[currentIndex + 1] : categories[0]
  }

  const getPreviousCategory = (currentCategory) => {
    const currentIndex = categories.indexOf(currentCategory)
    return currentIndex > 0 ? categories[currentIndex - 1] : categories[categories.length - 1]
  }

  return (
    <div className="effects">
      {selectedCategory && (
        <Modal>
          <HudNavLink onClick={() => setSelectedCategory(null)} className="close">
            <span className="hidden-span">Fermer</span>
            <ImCross size={40} color="#e62e31" />
          </HudNavLink>
          <HudNavLink
            onClick={() => setSelectedCategory(getPreviousCategory(selectedCategory))}
            className="previous"
          >
            <FaArrowLeft size={45} />
            <span className="hidden-span">Précedente</span>
          </HudNavLink>
          <HudNavLink
            onClick={() => setSelectedCategory(getNextCategory(selectedCategory))}
            className="next"
          >
            <span className="hidden-span">Suivante</span>
            <FaArrowRight size={45} />
          </HudNavLink>
          <h1>{selectedCategory}</h1>
          <div className="effects-list">
            {groupedEffects[selectedCategory].map((effect, index) => (
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
          </div>
        </Modal>
      )}
      <h1>Choisissez une catégorie</h1>
      <div className="effects-categories">
        {Object.entries(groupedEffects).map(([type, effects], index) => (
          <div
            className="effects-category"
            key={index}
            onClick={() => {
              select()
              setSelectedCategory(type)
            }}
            onMouseEnter={hover}
          >
            <img src={categoryImages[type]} alt={`Icone de la catégorie ${type}`} />
            {type}
          </div>
        ))}
      </div>
    </div>
  )
}
