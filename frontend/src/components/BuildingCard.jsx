import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

const BUILDING_EMOJIS = {
  SC: '🔬',
  EN: '⚙️',
  KBS: '📊',
}

export default function BuildingCard({ building }) {
  const emoji = BUILDING_EMOJIS[building.buildId] || '🏛️'
  const images = building.images || []
  const [imgIndex, setImgIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(() => {
      setImgIndex(i => (i + 1) % images.length)
    }, 3000)
    return () => clearInterval(id)
  }, [images.length])

  return (
    <Link
      to={`/buildings/${building.buildId}`}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden block"
    >
      <div className="h-32 relative overflow-hidden bg-gradient-to-br from-kku-red to-kku-darkred flex items-center justify-center">
        {images.length > 0 ? (
          <>
            {images.map((img, i) => (
              <img
                key={img.imageId}
                src={img.imageUrl}
                alt={img.imageDesc || building.buildName}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === imgIndex ? 'opacity-100' : 'opacity-0'}`}
                onError={e => { e.target.style.display = 'none' }}
              />
            ))}
            {images.length > 1 && (
              <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1 z-10">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`block w-1.5 h-1.5 rounded-full transition-colors ${i === imgIndex ? 'bg-white' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <span className="text-5xl">{emoji}</span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight">
          {building.buildName}
        </h3>
        {building.buildDesc && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{building.buildDesc}</p>
        )}
      </div>
    </Link>
  )
}
