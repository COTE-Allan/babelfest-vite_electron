// components/CardStats.js
import React from 'react'
import sword from '../../../../assets/img/sword.png'
import boot from '../../../../assets/img/boot.png'
import shield from '../../../../assets/img/shield.png'
import heart from '../../../../assets/img/heart.png'

export function CardStats({ stats, basehp, def, broken }) {
  const statImages = [sword, boot, heart, shield]

  return (
    <div className="details-card-stats">
      {stats.map((stat, index) => (
        <div className="details-card-stats-item" key={index}>
          <img src={statImages[index]} alt={`icon for the stat : ${stat}`} />
          <span key={index}>{stat}</span>
          {index === 2 && <span style={{ fontSize: 15 }}>/ {basehp}</span>}
        </div>
      ))}
      {typeof def === 'number' && def !== 0 && (
        <div className={`details-card-stats-item ${broken ? 'disabled' : ''}`}>
          <img src={shield} alt={`icon for the stat : defense`} />
          <span>{def}</span>
        </div>
      )}
    </div>
  )
}
