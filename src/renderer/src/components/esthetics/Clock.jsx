import React, { useState, useEffect } from 'react'
import '../../styles/esthetics/clock.scss' // Assurez-vous que le chemin d'accès est correct

function Clock() {
  const [dateEtHeure, setDateEtHeure] = useState(new Date()) // Initialiser l'état avec la date et l'heure actuelles

  useEffect(() => {
    const timerID = setInterval(
      () => tick(),
      1000 // Mettre à jour l'heure chaque seconde
    )

    return function cleanup() {
      clearInterval(timerID) // Nettoyer le timer lors du démontage du composant
    }
  }, [])

  function tick() {
    setDateEtHeure(new Date()) // Mettre à jour l'état avec la nouvelle date et heure
  }

  // Fonction pour formater l'heure au format HH:mm
  function formaterHeure(date) {
    const heures = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${heures}:${minutes}`
  }

  // Fonction pour formater la date au format "JJ MMM"
  function formaterDate(date) {
    const jours = date.getDate().toString().padStart(2, '0')
    const mois = [
      'jan',
      'fév',
      'mar',
      'avr',
      'mai',
      'jun',
      'jul',
      'aoû',
      'sep',
      'oct',
      'nov',
      'déc'
    ]
    const abrevMois = mois[date.getMonth()] // Utiliser le mois actuel pour obtenir l'abréviation en français
    return `${jours} ${abrevMois}` // Formater la date en "JJ MMM"
  }

  return (
    <div className="clock">
      <span>{formaterDate(dateEtHeure)}</span>
      <h2>{formaterHeure(dateEtHeure)}</h2>
    </div>
  )
}

export default Clock
