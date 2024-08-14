import sword from '../../../assets/img/sword.png'
import boot from '../../../assets/img/boot.png'
import shield from '../../../assets/img/shield.png'
import heart from '../../../assets/img/heart.png'
import { AiFillEyeInvisible } from 'react-icons/ai'
import '../../../styles/interface/inGame/advancedDetails.scss'
import { getCardBasedOnNameAndTitle, getEffectInfo } from '../../effects/basics'
import { useContext, useEffect, useRef, useState } from 'react'
import { GlobalContext } from '../../providers/GlobalProvider'
import { IoMdArrowRoundBack } from 'react-icons/io'

export function AdvancedDetails({ card }) {
  const { advancedDetailCard, playerID, playerSelf, playerRival } = useContext(GlobalContext)
  const ref = useRef(null)
  const [detailCard, setDetailCard] = useState(advancedDetailCard)
  const [linkedCard, setLinkedCard] = useState(false)
  const stats = [detailCard.atk, detailCard.dep, detailCard.hp]
  const statImages = [sword, boot, heart, shield]

  useEffect(() => {
    if (linkedCard) {
      setDetailCard(linkedCard)
      if (ref.current) {
        ref.current.scrollTo(0, 0)
      }
    } else {
      setDetailCard(advancedDetailCard)
    }
  }, [linkedCard])

  useEffect(() => {
    setDetailCard(advancedDetailCard)
  }, [advancedDetailCard])

  return (
    <div className="advancedDetails" ref={ref}>
      {detailCard.id !== advancedDetailCard.id && (
        <div
          className="details-card-back"
          onClick={() => {
            setDetailCard(advancedDetailCard)
          }}
        >
          <IoMdArrowRoundBack />
          Retour
        </div>
      )}
      <h1 className={`details-card-title txt-rarity-${detailCard.rarity}`}>{detailCard.name}</h1>
      <h2 className={`details-card-subtitle txt-rarity-${detailCard.rarity}`}>
        {detailCard.title}
      </h2>
      <div className="details-card-stats">
        {stats.map((stat, index) => (
          <div className="details-card-stats-item" key={index}>
            <img src={statImages[index]} alt={`icon for the stat : ${stat}`} />
            <span key={index}>{stat}</span>
            {index === 2 && <span style={{ fontSize: 15 }}>/ {detailCard.basehp}</span>}
          </div>
        ))}
        {typeof detailCard.def === 'number' && detailCard.def !== 0 && (
          <div className="details-card-stats-item">
            <img src={shield} alt={`icon for the stat : defense`} />
            <span>{detailCard.def}</span>
          </div>
        )}
      </div>

      <span className="details-card-credits">
        Carte de la collection {detailCard.collection}, dessinée par {detailCard.author}
      </span>

      {detailCard.affected && (
        <div className="details-card-afflictions">
          <h3>Buffs / Débuffs actifs :</h3>
          <ul className="details-card-afflictions-list">
            {detailCard.affected.map((affliction) => (
              <li style={{ backgroundColor: affliction.colorCode }}>{affliction.text}</li>
            ))}
          </ul>
        </div>
      )}

      {detailCard.effects && (
        <div className="details-card-effectsList">
          <h3>Effets :</h3>
          {detailCard.effects &&
            detailCard.effects.map((effect, index) => {
              let effectInfos = getEffectInfo(effect.type, effect.value)
              if (effect.type == 'fortress' && !detailCard.fortress) {
                return
              }
              return (
                <div className="details-card-effect-container" key={index}>
                  <div className="details-card-effect">
                    <div className="details-card-effect-img">
                      <img src={effectInfos.icon} alt="" />
                      {effect.value != null && (
                        <span className="details-card-effect-img-value">{effect.value}</span>
                      )}
                      {effect.type == 'deathCounter' && (
                        <span className="details-card-effect-img-value">
                          {detailCard.deathCounter}
                        </span>
                      )}
                      {effect.type == 'timerSummon' && (
                        <span className="details-card-effect-img-value">
                          {detailCard.timerSummon}
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
                        {effect.cards.map((infos, index) => {
                          let card = getCardBasedOnNameAndTitle(infos)
                          return (
                            <li
                              className={`txt-rarity-${card.rarity}`}
                              key={index}
                              onClick={() => {
                                setLinkedCard(card)
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
          {detailCard.freeze && (
            <div className="details-card-effect">
              <div className="details-card-effect-img">
                <img
                  src="https://res.cloudinary.com/dxdtcakuv/image/upload/w_auto/v1702647583/babelfest/icons/freeze.webp"
                  alt="Icone Congelé"
                />
              </div>
              <div className="details-card-effect-txt">
                <span>Congelé</span>
                <p>Cette carte ne peut pas bouger pendant encore {detailCard.freeze} tours.</p>
              </div>
            </div>
          )}
          {detailCard.diving && (
            <div className="details-card-effect">
              <div className="details-card-effect-img">
                <img
                  src="https://res.cloudinary.com/dxdtcakuv/image/upload/w_100/v1708444045/babelfest/icons/water-splash.webp"
                  alt="Icone Sous l'eau"
                />
              </div>
              <div className="details-card-effect-txt">
                <span>Sous l'eau</span>
                <p>
                  Cette carte peut traverser les cases occupées mais elle ne peut ni attaquer ni
                  être attaqué jusqu'à la prochaine phase de préparation.
                </p>
              </div>
            </div>
          )}
          {detailCard.isRecto !== undefined && !detailCard.isRecto && (
            <div className="details-card-effect">
              <div className="details-card-effect-img">
                <AiFillEyeInvisible size={40} color="white" className="hidden-icon" />
              </div>
              <div className="details-card-effect-txt">
                <span>Dissimulé</span>
                <p>
                  Votre adversaire ne peut pas voir les détails de cette carte, les effets activés
                  par cette carte ne seront pas affichés dans l'historique.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <img className="card-visual" src={detailCard.url} alt={`Visuel de la carte sélectionnée.`} />
    </div>
  )
}
