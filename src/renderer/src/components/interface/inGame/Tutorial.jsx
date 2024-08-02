import React, { useContext, useEffect, useRef } from 'react'
import '../../../styles/interface/inGame/tutorial.scss'
import { GlobalContext } from '../../providers/GlobalProvider'
import { GiConfirmed } from 'react-icons/gi'
import { VscDebugRestart } from 'react-icons/vsc'
import { BsMouse2 } from 'react-icons/bs'
import { PiFlagCheckeredFill } from 'react-icons/pi'
import { IoIosFlash } from 'react-icons/io'

export default function Tutorial(props) {
  const { phase, phaseRules } = useContext(GlobalContext)

  return (
    <div className="tutorial">
      {phase === 0 && (
        <>
          <p>
            Au début d'une partie, commencez d'abord par vérifier vos cartes (en bas de l'écran),
            sélectionnez ensuite {phaseRules[0]} cartes et donnez-les à l'adversaire.
          </p>
          <h2>Contrôles</h2>
          <ul>
            <li>
              <BsMouse2 size={30} />
              Clic gauche (sur une carte) : Choisir/Annuler
            </li>
            <li>
              <VscDebugRestart size={30} />: Demander/Accepter de repiocher les cartes
            </li>
            <li>
              <GiConfirmed size={30} /> : Donner vos cartes sélectionnées
            </li>
          </ul>
        </>
      )}
      {phase === 1 && (
        <>
          <p>
            Pour gagner,{' '}
            <b>
              vous devez capturer la base adverse (la case de couleur) ou épuiser les cartes de
              l'adversaire.
            </b>
          </p>
          <p>
            Lors d'une phase de préparation, vous avez <b>un total de 4 énergies.</b> (
            <IoIosFlash size={20} />) Invoquez des cartes de votre main vers l'arène,{' '}
            <b>chaque carte possède un coût en énergie (en haut à gauche de la carte).</b>
          </p>
          <p>
            Votre tour s'arrête quand vous cliquez sur le bouton « Fin de phase » ou quand vos
            points d'invocations atteignent zéro.
          </p>
          <h2>Contrôles</h2>
          <ul>
            <li>
              <BsMouse2 size={30} />
              Clic gauche (sur une carte) : Choisir/Annuler
            </li>
            <li>
              <BsMouse2 size={30} />
              Double clic sur une case valide (en vert) : Invoquer la carte
            </li>
            <li>
              <PiFlagCheckeredFill size={30} /> : Mettre fin à votre phase (vous ne pourrez plus
              invoquer)
            </li>
          </ul>
        </>
      )}
      {phase === 2 && (
        <>
          <p>
            Déplacez vos cartes dans l'arène pour mettre en place votre stratégie. Vous possédez 4
            énergies (
            <IoIosFlash size={20} />
            ), <b>déplacer une carte d'une case coûte une énergie.</b>
          </p>
          <p>
            La valeur de déplacement d'une carte montre la distance max autorisée pour celle-ci,
            gérez vos points pour déplacer un maximum de cartes en un seul tour !
          </p>
          <p>
            Vous pouvez aussi inverser les positions de deux alliés adjacents contre deux énergies.
          </p>
          <p>
            Votre tour s'arrête quand vous cliquez sur le bouton « Fin de phase » ou quand vos
            points de déplacements atteignent zéro.
          </p>
          <h2>Contrôles</h2>
          <ul>
            <li>
              <BsMouse2 size={30} />
              Clic gauche (sur une carte dans l'arène) : Choisir/Annuler
            </li>
            <li>
              <BsMouse2 size={30} />
              Double clic sur une case valide (en vert) : Déplacer la carte
            </li>
            <li>
              <BsMouse2 size={30} />
              Double clic sur un allié adjacent (en vert) : Inverser les cartes
            </li>
            <li>
              <PiFlagCheckeredFill size={30} /> : Mettre fin à votre phase (vous ne pourrez plus
              déplacer de cartes)
            </li>
          </ul>
        </>
      )}
      {phase === 3 && (
        <>
          <p>
            Attaquez les cartes de l'autre joueur pour les détruire ! Lors d'une attaque,
            <b>vous infligez l'attaque de votre carte sur les points de vies de la cible.</b>
          </p>
          <p>
            <b>Chaque carte ne peut attaquer qu'une fois par tour,</b> vous attaquez à tour de rôle
            jusqu'au moment où chaque joueur aura appuyé sur le bouton « Fin de phase ».
          </p>
          <h2>Contrôles</h2>
          <ul>
            <li>
              <BsMouse2 size={30} />
              Clic gauche (sur une carte dans l'arène) : Choisir/Annuler
            </li>
            <li>
              <BsMouse2 size={30} />
              Double clic sur une cible valide (en vert) : Attaquer la carte
            </li>
            <li>
              <PiFlagCheckeredFill size={30} /> : Mettre fin à votre phase (vous ne pourrez plus
              attaquer)
            </li>
          </ul>
        </>
      )}
      {phase === 4 && (
        <>
          <p>
            Afin d'améliorer votre jeu, vous pouvez échanger une ou plusieurs cartes de votre main
            et une ou plusieurs cartes de la boutique. Le coût total des cartes de la boutique
            choisies doit être égal ou supérieurs aux cartes choisies en main pour un échange
            valide.
          </p>
          <p>
            <b>Si vous le souhaitez,</b> sélectionnez une carte de votre main et de la boutique puis
            cliquez sur le bouton « Échanger ».
          </p>
          <h2>Contrôles</h2>
          <ul>
            <li>
              <BsMouse2 size={30} />
              Clic gauche sur une carte (dans votre main) : Choisir/Annuler
            </li>
            <li>
              <BsMouse2 size={30} />
              Clic gauche sur une carte (dans la boutique) : Choisir/Annuler
            </li>
            <li>
              <GiConfirmed size={30} /> : Échangez puis mettez fin à votre phase
            </li>
            <li>
              <PiFlagCheckeredFill size={30} /> : Mettre fin à votre phase sans échanger
            </li>
          </ul>
        </>
      )}
    </div>
  )
}
