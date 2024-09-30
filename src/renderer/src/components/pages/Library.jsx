import React, { useContext, useEffect, useState } from 'react'
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
import { FaArrowLeft, FaArrowRight, FaPen, FaSave, FaTrash } from 'react-icons/fa'
import { getAllCards, useSendMessage } from '../others/toolBox'
import BackButton from '../items/BackButton'
import LoadingLogo from '../items/LoadingLogo'
import { AuthContext } from '../../AuthContext'
import useSound from 'use-sound'
import hoverSfx from '../../assets/sfx/button_hover.wav'
import selectSfx from '../../assets/sfx/menu_select.wav'
import Details from '../interface/inGame/Details'
import ProgressBar from '@ramonak/react-progress-bar'
import Button from '../items/Button'

export default function Library({ editorMode, deck }) {
  const { userSettings, saveDeck, modifyDeck, deleteDeck } = useContext(AuthContext)
  const [detailCard, setDetailCard] = useState(null)
  const [hover] = useSound(hoverSfx, { volume: userSettings.sfxVolume })
  const [select] = useSound(selectSfx, { volume: userSettings.sfxVolume })
  const [allCards, setAllCards] = useState(getAllCards())
  const [cards, setCards] = useState(getAllCards)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedCollections, setSelectedCollections] = useState([])
  const [selectedRarities, setSelectedRarities] = useState([])
  const [selectedYears, setSelectedYears] = useState([])
  const [selectedEffects, setSelectedEffects] = useState([])
  const [sortMethod, setSortMethod] = useState('rarity')
  const [cardScale, setCardScale] = useState(editorMode ? 105 : 120)
  const [selected, setSelected] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const location = useLocation()
  const sendMessage = useSendMessage()
  // States for the deck
  const [deckName, setDeckName] = useState('')
  const [deckCards, setDeckCards] = useState([])

  // Initialize deck data if in editorMode and a valid deck is provided
  useEffect(() => {
    if (editorMode && deck) {
      setDeckName(deck.name || '')
      setDeckCards(deck.cards || [])
    }
  }, [editorMode, deck])

  const rarityOrder = [1, 2, 3, 4, 5]
  const rarityLabels = {
    1: 'Typique',
    2: 'Rare',
    3: 'Épique',
    4: 'Légendaire',
    5: 'Spéciale'
  }
  const rarityMaxAmount = {
    2: 3,
    3: 2,
    4: 1
  }

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '50px',
      padding: '0px 10px',
      fontSize: '15px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '5px',
      border: 'solid 2px rgb(255, 255, 255)'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'gray' : 'rgba(0, 0, 0, 0.5)',
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
    if (selected !== null) {
      const index = flattenedCards.findIndex((c) => c.id === selected.id)
      setSelectedIndex(index)
    }
  }, [selected])

  useEffect(() => {
    if (selectedIndex !== null) {
      setSelected(cards[selectedIndex])
    }
  }, [selectedIndex])

  useEffect(() => {
    console.log(location)
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

  const handleCardClick = (card) => {
    select()

    if (editorMode) {
      if (card.rarity !== 5) {
        const isCardInDeck = deckCards.some(
          (deckCard) => deckCard.name === card.name && deckCard.title === card.title
        )

        // Compter le nombre de cartes par rareté
        const rarityCount = deckCards.reduce((acc, deckCard) => {
          acc[deckCard.rarity] = (acc[deckCard.rarity] || 0) + 1
          return acc
        }, {})

        // Enforce rarity limits
        if (isCardInDeck) {
          // Retirer la carte si elle est déjà dans le deck
          setDeckCards(
            deckCards.filter(
              (deckCard) => deckCard.name !== card.name || deckCard.title !== card.title
            )
          )
        } else {
          // Vérifier la nouvelle contrainte pour les raretés 3 et 4
          const numberOfRarity3 = rarityCount[3] || 0
          const hasRarity4 = (rarityCount[4] || 0) > 0

          // Si on essaie d'ajouter une carte de rareté 4
          if (card.rarity === 4) {
            if (numberOfRarity3 >= 2) {
              sendMessage(
                'Vous ne pouvez pas ajouter une carte légendaire si vous avez déjà deux cartes épiques.',
                'warn'
              )
              return
            }
          }

          // Si on essaie d'ajouter une carte de rareté 3
          if (card.rarity === 3) {
            if (numberOfRarity3 >= 2) {
              sendMessage('Vous avez atteint la limite pour les cartes épiques.', 'warn')
              return
            }
            if (numberOfRarity3 >= 1 && hasRarity4) {
              sendMessage(
                'Vous ne pouvez pas avoir à la fois deux cartes épiques et une carte légendaire.',
                'warn'
              )
              return
            }
          }

          // Vérifier les limites de chaque rareté
          if (
            (card.rarity === 4 && (rarityCount[4] || 0) >= 1) ||
            (card.rarity === 2 && (rarityCount[2] || 0) >= 3)
          ) {
            sendMessage(
              `Vous avez atteint la limite pour les cartes ${rarityLabels[card.rarity]}.`,
              'warn'
            )
            return
          }

          // Ajouter la carte au deck si la limite n'a pas été atteinte
          if (deckCards.length < 8) {
            setDeckCards([
              ...deckCards,
              {
                name: card.name,
                title: card.title,
                image: card.url,
                rarity: card.rarity
              }
            ])
          }
        }
      } else {
        sendMessage('Les cartes spéciales doivent être invoquées via un effet.', 'warn')
      }
    } else {
      setSelected(card)
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
          card.id == searchLower
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
    const allImagesLoaded = cards.every((card) => {
      const imgElement = document.getElementById(`card-img-${card.id}`)
      return imgElement && imgElement.complete
    })

    if (allImagesLoaded) {
      setLoading(false)
    }
  }

  // Function to handle deck saving or modification
  const handleSaveDeck = () => {
    if (!deckName) {
      sendMessage(`Veuillez entrer un nom pour le deck.`, 'warn')
      return
    }

    if (deckCards.length !== 8) {
      sendMessage(`Le deck ne fait pas 8 cartes.`, 'error')
      return
    }

    // Trier les cartes par rareté avant de sauvegarder
    const sortedDeckCards = [...deckCards].sort((a, b) => a.rarity - b.rarity)

    if (deck) {
      // Modifier le deck existant
      modifyDeck(deck.id, {
        name: deckName,
        cards: sortedDeckCards
      })
    } else {
      // Sauvegarder un nouveau deck
      saveDeck(deckName, sortedDeckCards)
    }
    editorMode(false)
  }

  const deckByRarity = deckCards.reduce((acc, card) => {
    if (!acc[card.rarity]) acc[card.rarity] = []
    acc[card.rarity].push(card)
    return acc
  }, {})

  const cardsByRarity = cards.reduce((acc, card) => {
    if (!acc[card.rarity]) acc[card.rarity] = []
    acc[card.rarity].push(card)
    return acc
  }, {})

  const flattenedCards = [].concat(...rarityOrder.map((rarity) => cardsByRarity[rarity] || []))

  return (
    <div className="library fade-in">
      {detailCard && <Details detailCard={detailCard} noRightClick />}
      {!editorMode && <BackButton />}
      <div className="library-wrapper">
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
            {/* Vos champs de recherche et filtres */}
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
                isMulti
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
        <div className="library-list-wrapper">
          <div className={`library-list ${editorMode && 'smaller'}`}>
            {rarityOrder.map(
              (rarity) =>
                cardsByRarity[rarity] &&
                cardsByRarity[rarity].length > 0 && (
                  <div key={rarity} className="library-list-rarity-container">
                    {!loading && (
                      <div className="library-list-rarity-container-text">
                        <h3 className={`txt-rarity-${rarity}`}>{rarityLabels[rarity]}</h3>
                        <hr className={`bg-rarity-${rarity}`} />
                      </div>
                    )}
                    <div className="library-list-cards">
                      {cardsByRarity[rarity].map((card) => (
                        <div
                          onMouseEnter={() => {
                            hover()
                            if (editorMode) setDetailCard(card)
                          }}
                          onMouseLeave={() => {
                            if (editorMode) setDetailCard(null)
                          }}
                          className={`library-list-item ${
                            card.shiny != null ? card.shiny : ''
                          } ${!loading && 'fade-in'} ${
                            editorMode &&
                            deckCards.some(
                              (deckCard) =>
                                deckCard.title === card.title && deckCard.name === card.name
                            )
                              ? 'selected'
                              : 'not-selected'
                          }`} // Ajout de la classe "selected" si la carte est déjà dans le deck
                          key={card.id}
                          onClick={() => handleCardClick(card)}
                          style={{ display: loading ? 'none' : 'block' }}
                        >
                          <div className="img-container">
                            <div className="card-cost">
                              <span className={`txt-rarity-${card.rarity}`}>{card.rarity}</span>
                            </div>
                            <img
                              id={`card-img-${card.id}`}
                              className="library-list-item-img"
                              src={card.url}
                              alt={`Carte ${card.name} de la collection ${card.collection}`}
                              style={{ width: `${cardScale}px` }}
                              onLoad={handleImageLoad}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            )}
            {loading && (
              <div className="library-loading">
                <LoadingLogo />
              </div>
            )}
          </div>
          {editorMode && (
            <div className="library-list-creditsCounter">
              <span>Crédits utilisés :</span>
              <ProgressBar
                customLabel={`25/50`}
                completed={25}
                maxCompleted={50}
                bgColor="#40a8f5"
                height="20px"
                labelAlignment="center"
                labelColor="#fff"
                className="progressBar"
              />
              <span className="alert">Votre deck dépasse la valeur maximale de crédits !</span>
            </div>
          )}
        </div>

        {editorMode && (
          <div className="library-deck">
            <div className="deck-name-input">
              <input
                type="text"
                id="deck-name"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="Deck sans titre"
              />
              <FaPen size={25} />
            </div>
            <hr className="deck-name-input-hr" />
            <h2>Cartes ({deckCards.length}/8)</h2>
            {rarityOrder.map(
              (rarity) =>
                deckByRarity[rarity] &&
                deckByRarity[rarity].length > 0 && (
                  <div key={rarity} className="library-deck-rarity-container">
                    <h3 className={`txt-rarity-${rarity}`}>
                      {rarityLabels[rarity]}{' '}
                      {rarity !== 1 && '(max ' + rarityMaxAmount[rarity] + ')'}
                    </h3>
                    <hr className={`bg-rarity-${rarity}`} />
                    <div className="library-deck-cards">
                      {deckByRarity[rarity].map((card) => (
                        <div
                          key={card.id}
                          onMouseEnter={hover}
                          className="library-deck-card"
                          onClick={() => {
                            select()
                            setDeckCards(
                              deckCards.filter(
                                (deckCard) =>
                                  deckCard.name !== card.name && deckCard.title !== card.title
                              )
                            )
                          }}
                        >
                          <img src={card.image} alt={`${card.name} - ${card.title}`} />
                          <div className="library-deck-card-infos">
                            <h3 className={`txt-rarity-${card.rarity}`}>{card.name}</h3>
                            <h4 className={`txt-rarity-${card.rarity}`}>{card.title}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            )}
            <div className="library-deck-control">
              <HudNavLink permOpen onClick={handleSaveDeck}>
                <FaSave size={25} />
                <span className="hidden-span">Sauvegarder</span>
              </HudNavLink>
              {deck && (
                <HudNavLink
                  permOpen
                  onClick={() => {
                    if (deck) {
                      // deleteDeck(deck.id)
                      setConfirmDelete(true)
                      // editorMode(false)
                    }
                  }}
                >
                  <FaTrash size={25} />
                  <span className="hidden-span">Supprimer</span>
                </HudNavLink>
              )}
              <HudNavLink permOpen onClick={() => editorMode(false)}>
                <FaArrowLeft size={25} />
                <span className="hidden-span">Retour</span>
              </HudNavLink>
            </div>
          </div>
        )}
      </div>

      {selected !== null && (
        <Modal>
          <div className="library-detail">
            <div className="library-detail-infos">
              <h1 className={`txt-rarity-${selected.rarity}`}>{selected.name}</h1>
              <h2 className={`txt-rarity-${selected.rarity}`}>{selected.title}</h2>
              <span>par {selected.author}</span>

              {selected.desc && (
                <div className="prestige">
                  <div className="prestige prestige-promo library-detail-infos-desc">
                    {selected.desc}
                  </div>
                </div>
              )}

              <h2 className={`txt-rarity-${selected.rarity}`}>
                {selected.rarity === 5 ? (
                  <>Non invocable normalement</>
                ) : (
                  <>Coût d'invocation : {selected.rarity}</>
                )}
              </h2>

              {selected.effects && (
                <>
                  <h3>Effets :</h3>
                  {selected.effects.map((effect, index) => {
                    let effectInfos = getEffectInfo(effect.type, effect.value)
                    return (
                      <div key={index}>
                        <div className="details-card-effect">
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
                              {effect.cards.map((infos, idx) => {
                                let card = getCardBasedOnNameAndTitle(infos)
                                return (
                                  <li
                                    key={idx}
                                    className={`txt-rarity-${card.rarity}`}
                                    onClick={() => {
                                      if (editorMode) return
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
                      </div>
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

      {editorMode && confirmDelete && (
        <Modal>
          <div className="modal-container">
            <span>Êtes-vous sûr de vouloir supprimer ce deck ? Cette action est irréversible.</span>
            <Button
              onClick={() => {
                deleteDeck(deck.id)
                editorMode(false)
              }}
              disabled={loading}
              className="warning"
            >
              Oui, je suis sûr
            </Button>
            <Button onClick={() => setConfirmDelete(false)}>Annuler</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
