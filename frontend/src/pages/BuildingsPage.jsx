import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getBuildings } from '../api'
import BuildingCard from '../components/BuildingCard'

export default function BuildingsPage() {
  const { t } = useTranslation()
  const [buildings, setBuildings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBuildings().then(setBuildings).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-kku-red text-white px-6 py-6">
        <h1 className="text-2xl font-bold">{t('nav.faculties')}</h1>
        <p className="text-white/80 text-sm mt-1">มหาวิทยาลัยขอนแก่น</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow animate-pulse h-40" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {buildings.map((b) => (
              <BuildingCard key={b.buildId} building={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
