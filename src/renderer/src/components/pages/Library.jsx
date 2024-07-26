import React, { useEffect, useState } from 'react'
import '../../styles/pages/library.scss'
import Modal from '../items/ClassicModal'
import { MdZoomIn } from 'react-icons/md'
import { getAllCards } from '../others/toolBox'
import Tilt from 'react-parallax-tilt'
import Slider from 'rc-slider'
import { getCardBasedOnNameAndTitle, getEffectInfo } from '../effects/basics'
import Button from '../items/Button'
import { useLocation } from 'react-router'

export default function Library() {
  const [allCards, setAllCards] = useState(getAllCards())
  const [cards, setCards] = useState(getAllCards)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedCollections, setSelectedCollections] = useState([])
  const [selectedRarities, setSelectedRarities] = useState([])
  const [selectedYears, setSelectedYears] = useState([]) // Nouvel état pour les années sélectionnées
  const [sortMethod, setSortMethod] = useState('rarity')
  const [cardScale, setCardScale] = useState(125)
  const [selected, setSelected] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(null)

  const location = useLocation()

  // Déterminer les collections et les années
  const collections = [...new Set(allCards.map((card) => card.collection))]
  const years = [
    ...new Set(allCards.filter((card) => card.year).map((card) => card.year.toString()))
  ]

  const trait = {
    1: 'combatif',
    2: 'érudit',
    3: 'charismatique',
    4: 'résistant',
    5: 'craintif'
  }
  const rarityNames = {
    1: 'Typique',
    2: 'Rare',
    3: 'Epique',
    4: 'Légendaire',
    5: 'Spéciale'
  }

  useEffect(() => {
    if (selectedIndex !== null) {
      setSelected(cards[selectedIndex])
    }
  }, [selectedIndex])

  useEffect(() => {
    if (location.state && location.state.selected) {
      const { selected } = location.state // Extrayez 'selected' de l'état de la route
      setSelected(selected)
    }
  }, [location])

  const handlePreviousCard = () => {
    setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : cards.length - 1))
  }

  const handleNextCard = () => {
    setSelectedIndex((prevIndex) => (prevIndex < cards.length - 1 ? prevIndex + 1 : 0))
  }

  // Modifier cette fonction pour gérer la réouverture du modal
  const handleCardClick = (key) => {
    if (selectedIndex === key) {
      setSelectedIndex(null)
      setTimeout(() => setSelectedIndex(key), 0) // Réinitialise puis définit selectedIndex
    } else {
      setSelectedIndex(key)
    }
  }

  const handleCloseModal = () => {
    setSelected(null)
    setSelectedIndex(null) // Réinitialiser selectedIndex si nécessaire
  }

  useEffect(() => {
    let allCards = getAllCards()
    let filteredCards = [...allCards]

    if (selectedCollections.length > 0) {
      filteredCards = filteredCards.filter((card) => selectedCollections.includes(card.collection))
    }

    if (selectedYears.length > 0) {
      filteredCards = filteredCards.filter((card) =>
        selectedYears.includes(card.year ? card.year.toString() : '')
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
        selectedRarities.includes(card.rarity.toString())
      )
    }

    // Trier
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
  }, [search, selectedRarities, selectedCollections, selectedYears, allCards, sortMethod])

  const handleCollectionChange = (event) => {
    const value = event.target.value
    setSelectedCollections((currentCollections) => {
      if (event.target.checked) {
        return [...currentCollections, value]
      } else {
        return currentCollections.filter((collection) => collection !== value)
      }
    })
    const parentDiv = event.target.parentNode
    if (event.target.checked) {
      parentDiv.classList.add('checked')
    } else {
      parentDiv.classList.remove('checked')
    }
  }

  const handleRarityChange = (event) => {
    const value = event.target.value
    setSelectedRarities((currentRarities) =>
      event.target.checked
        ? [...currentRarities, value]
        : currentRarities.filter((rarity) => rarity !== value)
    )
    // Ajouter ou supprimer une classe CSS pour le parent
    const parentDiv = event.target.parentNode
    if (event.target.checked) {
      parentDiv.classList.add('checked')
    } else {
      parentDiv.classList.remove('checked')
    }
  }

  const handleYearChange = (event) => {
    const value = event.target.value
    setSelectedYears((currentYears) =>
      event.target.checked
        ? [...currentYears, value]
        : currentYears.filter((year) => year !== value)
    )
    // Ajouter ou supprimer une classe CSS pour le parent
    const parentDiv = event.target.parentNode
    if (event.target.checked) {
      parentDiv.classList.add('checked')
    } else {
      parentDiv.classList.remove('checked')
    }
  }

  // Gestionnaire de chargement des images
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
            <span className="library-controller-inputs-item-title">Collections :</span>
            <div className="library-controller-checkboxes">
              {collections.map((collection, key) => (
                <label key={key} className="library-controller-checkboxes-item">
                  <input
                    type="checkbox"
                    value={collection}
                    checked={selectedCollections.includes(collection)}
                    onChange={handleCollectionChange}
                  />
                  <span>{collection}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="library-controller-inputs-item">
            <span className="library-controller-inputs-item-title">Années :</span>
            <div className="library-controller-checkboxes">
              {years.map((year, key) => (
                <label key={key} className="library-controller-checkboxes-item">
                  <input
                    type="checkbox"
                    value={year}
                    checked={selectedYears.includes(year)}
                    onChange={handleYearChange}
                  />
                  <span>{year}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="library-controller-inputs-item">
            <span className="library-controller-inputs-item-title">Raretés :</span>
            <div className="library-controller-checkboxes">
              {Object.entries(rarityNames).map(([value, name]) => (
                <label
                  key={value}
                  className={`library-controller-checkboxes-item bg-rarity-${value}`}
                >
                  <input
                    type="checkbox"
                    value={value}
                    checked={selectedRarities.includes(value)}
                    onChange={handleRarityChange}
                  />
                  <span>{name}</span>
                </label>
              ))}
            </div>
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
                <p className="rainbow_text_animated library-detail-infos-desc">{selected.desc}</p>
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
          <div className="navigation-buttons">
            <Button onClick={handlePreviousCard}>Carte précédente</Button>
            <Button onClick={handleCloseModal}>Retour au catalogue</Button>
            <Button onClick={handleNextCard}>Carte suivante</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
