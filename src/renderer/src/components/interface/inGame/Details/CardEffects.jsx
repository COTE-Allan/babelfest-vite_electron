// components/CardEffects.js
import React from 'react'
import { getEffectInfo, getCardBasedOnNameAndTitle } from '../../../effects/basics'
import { AiFillEyeInvisible } from 'react-icons/ai'

export function CardEffects({ detailCard, setLinkedCard }) {
  return (
    <div className="details-card-effectsList">
      {detailCard.effects &&
        detailCard.effects.map((effect, index) => {
          let effectInfos = getEffectInfo(effect.type, effect.value)
          if (effect.type === 'fortress' && !detailCard.fortress) {
            return null
          }
          return (
            <div className="details-card-effect-container" key={index}>
              <div className="details-card-effect">
                <div className="details-card-effect-img">
                  <img src={effectInfos.icon} alt="" />
                  {effect.value != null && (
                    <span className="details-card-effect-img-value">{effect.value}</span>
                  )}
                  {effect.type === 'deathCounter' && (
                    <span className="details-card-effect-img-value">{detailCard.deathCounter}</span>
                  )}
                  {effect.type === 'timerSummon' && (
                    <span className="details-card-effect-img-value">{detailCard.timerSummon}</span>
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
                            if (setLinkedCard) setLinkedCard(card)
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

      {/* Handling additional card states like freeze, broken, diving, hidden */}
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
            <p>Cette carte ne peut plus se déplacer pendant encore {detailCard.freeze} tour(s).</p>
          </div>
        </div>
      )}
      {detailCard.broken && (
        <div className="details-card-effect">
          <div className="details-card-effect-img">
            <img
              src="https://res.cloudinary.com/dxdtcakuv/image/upload/w_100/v1701520371/babelfest/icons/broken_fnn5ex.webp"
              alt="Icone Brisé"
            />
          </div>
          <div className="details-card-effect-txt">
            <span>Brisé</span>
            <p> Cette carte ne peut pas recevoir de Point de Défense ce tour.</p>
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
              Cette carte peut traverser les cases occupées, mais ne peut ni attaquer ni être
              attaquée jusqu'à la prochaine phase de préparation.
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
              Votre adversaire ne peut pas voir les détails de cette carte, les effets activés par
              cette carte ne seront pas affichés dans l'historique.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
