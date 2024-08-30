import React, { useEffect, useState } from 'react'
import '../../styles/pages/library.scss'
import Modal from '../items/ClassicModal'
import { MdZoomIn } from 'react-icons/md'
import Tilt from 'react-parallax-tilt'
import Slider from 'rc-slider'
import Select from 'react-select'
import { getAllEffects, getCardBasedOnNameAndTitle, getEffectInfo } from '../effects/basics'
import { useLocation } from 'react-router'
import HudNavLink from '../items/hudNavLink'
import { ImCross } from 'react-icons/im'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { getAllCards } from '../others/toolBox'
import BackButton from '../items/BackButton'

export default function Library() {
  const [allCards, setAllCards] = useState(getAllCards())
  const [cards, setCards] = useState(getAllCards)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedCollections, setSelectedCollections] = useState([])
  const [selectedRarities, setSelectedRarities] = useState([])
  const [selectedYears, setSelectedYears] = useState([])
  const [selectedEffects, setSelectedEffects] = useState([])
  const [sortMethod, setSortMethod] = useState('rarity')
  const [cardScale, setCardScale] = useState(125)
  const [selected, setSelected] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(null)

  const location = useLocation()
  const customStyles = {
    control: (provided) => ({
      ...provided,
      height: '50px',
      padding: '0px 10px',
      fontSize: '15px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Noir avec une opacité de 0.5
      borderRadius: '5px',
      border: 'solid 2px rgb(255, 255, 255)',
      fontFamily: "'Kimberly Bl', sans-serif",
      color: 'white'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'rgba(226, 226, 226, 0.7)'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white'
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(0, 0, 0, 0.8)', // Noir avec une opacité de 0.5
      borderRadius: '5px',
      border: 'solid 2px rgb(255, 255, 255)'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'gray' : 'rgba(0, 0, 0, 0.5)', // Noir avec une opacité de 0.5
      color: 'white',
      fontSize: '15px',
      fontFamily: "'Kimberly Bl', sans-serif",
      '&:hover': {
        backgroundColor: 'gray',
        color: 'white'
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'gray',
      color: 'white'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'white'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'white',
      '&:hover': {
        backgroundColor: 'red',
        color: 'white'
      }
    })
  }

  const collections = [...new Set(allCards.map((card) => card.collection))].map((collection) => ({
    value: collection,
    label: collection
  }))
  const years = [
    ...new Set(allCards.filter((card) => card.year).map((card) => card.year.toString()))
  ].map((year) => ({ value: year, label: year }))
  const effects = getAllEffects().map((effect) => ({
    value: effect.slug,
    label: effect.name
  }))
  const rarityOptions = Object.entries({
    1: 'Typique',
    2: 'Rare',
    3: 'Epique',
    4: 'Légendaire',
    5: 'Spéciale'
  }).map(([value, label]) => ({ value, label }))

  useEffect(() => {
    if (selectedIndex !== null) {
      setSelected(cards[selectedIndex])
    }
  }, [selectedIndex])

  useEffect(() => {
    console.log(location.state)
    if (location.state && location.state.selected) {
      const { selected } = location.state
      setSelected(selected)
    }
  }, [location])

  const handlePreviousCard = () => {
    setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : cards.length - 1))
  }

  const handleNextCard = () => {
    setSelectedIndex((prevIndex) => (prevIndex < cards.length - 1 ? prevIndex + 1 : 0))
  }

  const handleCardClick = (key) => {
    if (selectedIndex === key) {
      setSelectedIndex(null)
      setTimeout(() => setSelectedIndex(key), 0)
    } else {
      setSelectedIndex(key)
    }
  }

  const handleCloseModal = () => {
    setSelected(null)
    setSelectedIndex(null)
  }

  useEffect(() => {
    let allCards = getAllCards()
    let filteredCards = [...allCards]

    if (selectedCollections.length > 0) {
      filteredCards = filteredCards.filter((card) =>
        selectedCollections.some((collection) => collection.value === card.collection)
      )
    }

    if (selectedYears.length > 0) {
      filteredCards = filteredCards.filter((card) =>
        selectedYears.some((year) => year.value === (card.year ? card.year.toString() : ''))
      )
    }

    if (selectedEffects.length > 0) {
      filteredCards = filteredCards.filter(
        (card) =>
          card.effects &&
          selectedEffects.some((selectedEffect) =>
            card.effects.some((effect) => effect.type === selectedEffect.value)
          )
      )
    }

    if (search !== '') {
      const searchLower = search.toLowerCase()
      filteredCards = filteredCards.filter(
        (card) =>
          (card.year && card.year.toString().includes(searchLower)) ||
          card.collection.toLowerCase().includes(searchLower) ||
          card.name.toLowerCase().includes(searchLower) ||
          card.author.toLowerCase().includes(searchLower) ||
          card.id == searchLower ||
          (trait[card.trait] && trait[card.trait].toLowerCase().includes(searchLower))
      )
    }

    if (selectedRarities.length > 0) {
      filteredCards = filteredCards.filter((card) =>
        selectedRarities.some((rarity) => rarity.value === card.rarity.toString())
      )
    }

    switch (sortMethod) {
      case 'number':
        filteredCards.sort((a, b) => a.id - b.id)
        break
      case 'name':
        filteredCards.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'rarity':
        filteredCards.sort((a, b) => a.rarity - b.rarity)
        break
      default:
        break
    }

    setCards(filteredCards)
  }, [
    search,
    selectedRarities,
    selectedCollections,
    selectedYears,
    selectedEffects,
    allCards,
    sortMethod
  ])

  const handleCollectionChange = (selectedOptions) => {
    setSelectedCollections(selectedOptions)
  }

  const handleRarityChange = (selectedOptions) => {
    setSelectedRarities(selectedOptions)
  }

  const handleYearChange = (selectedOptions) => {
    setSelectedYears(selectedOptions)
  }

  const handleEffectChange = (selectedOptions) => {
    setSelectedEffects(selectedOptions || [])
  }

  const handleImageLoad = () => {
    const allImagesLoaded = cards.every((card, index) => {
      const imgElement = document.getElementById(`card-img-${index}`)
      return imgElement && imgElement.complete
    })

    if (allImagesLoaded) {
      setLoading(false)
    }
  }

  return (
    <div className="library">
      <BackButton />
      <div className="library-controller">
        <span>
          {cards.length} carte{cards.length > 1 && 's'} trouvée{cards.length > 1 && 's'}
        </span>
        <div className="library-controller-zoom">
          <MdZoomIn color="white" size={40} />
          <Slider
            onChange={(newScale) => setCardScale(newScale)}
            min={100}
            max={250}
            defaultValue={150}
            step={1}
            style={{ width: 200 }}
            styles={{
              handle: { backgroundColor: 'white', borderColor: 'white' },
              track: { backgroundColor: 'white', borderColor: 'white' },
              rail: { backgroundColor: 'rgba(255,255,255, 0.5' }
            }}
          />
        </div>
        <div className="library-controller-inputs">
          <div className="library-controller-inputs-item">
            <span className="library-controller-inputs-item-title">Recherche :</span>
            <input
              type="text"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Recherchez une carte..."
            />
          </div>
          <div className="library-controller-inputs-item">
            <span className="library-controller-inputs-item-title">Trier par :</span>
            <select
              className="library-controller-select"
              onChange={(e) => setSortMethod(e.target.value)}
            >
              <option value="rarity">Trier par rareté</option>
              <option value="number">Trier par numéro</option>
              <option value="name">Trier par nom</option>
            </select>
          </div>
          <div className="library-controller-inputs-item">
            <span className="library-controller-inputs-item-title">Effet :</span>
            <Select
              className="library-controller-select"
              options={effects}
              styles={customStyles}
              isMultif
              onChange={handleEffectChange}
              value={selectedEffects}
              placeholder="Toutes les effets"
            />
          </div>
          <div className="library-controller-inputs-item">
            <span className="library-controller-inputs-item-title">Collections :</span>
            <Select
              className="library-controller-select"
              options={collections}
              styles={customStyles}
              isMulti
              onChange={handleCollectionChange}
              value={selectedCollections}
              placeholder="Toutes les collections"
            />
          </div>
          <div className="library-controller-inputs-item">
            <span className="library-controller-inputs-item-title">Années :</span>
            <Select
              className="library-controller-select"
              options={years}
              styles={customStyles}
              isMulti
              onChange={handleYearChange}
              value={selectedYears}
              placeholder="Toutes les années"
            />
          </div>
          <div className="library-controller-inputs-item">
            <span className="library-controller-inputs-item-title">Raretés :</span>
            <Select
              className="library-controller-select"
              options={rarityOptions}
              styles={customStyles}
              isMulti
              onChange={handleRarityChange}
              value={selectedRarities}
              placeholder="Toutes les raretés"
            />
          </div>
        </div>
      </div>
      <div className="library-list">
        {cards.map((card, key) => (
          <div
            className={`${
              card.shiny != null ? 'library-list-item ' + card.shiny : 'library-list-item'
            } ${!loading && 'fade-in'}`}
            key={key}
            onClick={() => handleCardClick(key)}
            style={{ display: loading ? 'none' : 'block' }}
          >
            <div className="img-container">
              <img
                id={`card-img-${key}`}
                className="library-list-item-img"
                src={card.url}
                alt={`Carte ${card.name} de la collection ${card.collection}`}
                style={{ width: `${cardScale}px` }}
                onLoad={handleImageLoad}
              />
            </div>
          </div>
        ))}
        {loading && <span>Chargement...</span>}
      </div>
      {selected !== null && (
        <Modal>
          <div className="library-detail">
            <div className="library-detail-infos">
              <h1 className={`txt-rarity-${selected.rarity}`}>{selected.name}</h1>
              <h2 className={`txt-rarity-${selected.rarity}`}>{selected.title}</h2>
              <span>par {selected.author}</span>

              {selected.desc && (
                <p className="prestige-promo library-detail-infos-desc">{selected.desc}</p>
              )}

              {selected.rarity !== 5 ? (
                <h2>Coût d'invocation : {selected.rarity}</h2>
              ) : (
                <h2>Non invocable normalement</h2>
              )}
              {selected.effects && (
                <>
                  <h3>Effets :</h3>
                  {selected.effects.map((effect, index) => {
                    let effectInfos = getEffectInfo(effect.type, effect.value)
                    return (
                      <>
                        <div className="details-card-effect" key={index}>
                          <div className="details-card-effect-img">
                            <img src={effectInfos.icon} alt="" />
                            {effect.value != null && (
                              <span className="details-card-effect-img-value">{effect.value}</span>
                            )}
                            {effect.type == 'deathCounter' && (
                              <span className="details-card-effect-img-value">
                                {selected.deathCounter}
                              </span>
                            )}
                            {effect.type == 'timerSummon' && (
                              <span className="details-card-effect-img-value">
                                {selected.timerSummon}
                              </span>
                            )}
                          </div>
                          <div className="details-card-effect-txt">
                            <span>{effectInfos.name}</span>
                            <p>{effectInfos.desc}</p>
                          </div>
                        </div>
                        {effect.cards && (
                          <>
                            <p>L'effet {effectInfos.name} est lié à :</p>
                            <ul>
                              {effect.cards.map((infos) => {
                                let card = getCardBasedOnNameAndTitle(infos)
                                return (
                                  <li
                                    className={`txt-rarity-${card.rarity}`}
                                    onClick={() => {
                                      setSelected(card)
                                    }}
                                  >
                                    {card.name} : {card.title}
                                  </li>
                                )
                              })}
                            </ul>
                          </>
                        )}
                      </>
                    )
                  })}
                </>
              )}
              {selected.explaination && <p>{selected.explaination}</p>}
            </div>
            <Tilt
              glareEnable={true}
              glareMaxOpacity={0.2}
              glareColor="#ffffff"
              glarePosition="bottom"
              glareBorderRadius="5px"
              gyroscope={true}
              tiltMaxAngleX={7}
              tiltMaxAngleY={7}
              className={`library-detail-tilt ${selected.shiny && selected.shiny}`}
            >
              <div className="img-container">
                <img
                  src={selected.url}
                  alt={`détails de la carte ${selected.name} de la collection ${selected.collection}`}
                />
              </div>
            </Tilt>
          </div>
          <HudNavLink onClick={handleCloseModal} className="close">
            <span className="hidden-span">Fermer</span>
            <ImCross size={40} color="#e62e31" />
          </HudNavLink>
          <HudNavLink onClick={handlePreviousCard} className="previous">
            <FaArrowLeft size={45} />
            <span className="hidden-span">Précedente</span>
          </HudNavLink>
          <HudNavLink onClick={handleNextCard} className="next">
            <span className="hidden-span">Suivante</span>
            <FaArrowRight size={45} />
          </HudNavLink>
        </Modal>
      )}
    </div>
  )
}
