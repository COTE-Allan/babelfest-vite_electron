import React, { useState } from 'react'

const ImageLoader = ({ src, alt, className, width }) => {
  const [loading, setLoading] = useState(true)

  const handleImageLoaded = () => {
    setLoading(false)
  }
  return (
    <div style={{ position: 'relative' }}>
      {loading && <span className="loader"></span>}
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={handleImageLoaded}
        style={{ display: loading ? 'none' : 'block', width: width }}
      />
    </div>
  )
}

export default ImageLoader
