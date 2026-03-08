import { Link } from 'react-router-dom'

const BUILDING_EMOJIS = {
  SC: '🔬',
  EN: '⚙️',
  KBS: '📊',
}

export default function BuildingCard({ building }) {
  const emoji = BUILDING_EMOJIS[building.buildId] || '🏛️'

  return (
    <Link
      to={`/buildings/${building.buildId}`}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden block"
    >
      {/* Image placeholder / Google Place Photo */}
      <div className="h-32 bg-gradient-to-br from-kku-red to-kku-darkred flex items-center justify-center">
        <span className="text-5xl">{emoji}</span>
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
