import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps'
import { getBuildings, searchBuildingsRooms, getSearchHistory } from '../api'
import BuildingCard from '../components/BuildingCard'
import WeatherWidget from '../components/WeatherWidget'
import { useAuth } from '../context/AuthContext'

const VITE_GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'
const KKU_CENTER = { lat: 16.4748, lng: 102.8196 }

export default function HomePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [buildings, setBuildings] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searchHistory, setSearchHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const searchTimeout = useRef(null)

  useEffect(() => {
    getBuildings()
      .then(setBuildings)
      .finally(() => setLoading(false))

    if (user) {
      getSearchHistory().then(setSearchHistory).catch(() => {})
    }
  }, [user])

  const handleSearch = (q) => {
    setSearchQuery(q)
    clearTimeout(searchTimeout.current)
    if (!q.trim()) {
      setSearchResults(null)
      return
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await searchBuildingsRooms(q.trim())
        setSearchResults(results)
        if (user) {
          getSearchHistory().then(setSearchHistory).catch(() => {})
        }
      } catch {}
    }, 400)
  }

  const displayedBuildings = searchResults
    ? searchResults.buildings
    : buildings

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div className="relative h-52 bg-gradient-to-r from-kku-darkred to-kku-red overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Khon_Kaen_University_logo.svg/800px-Khon_Kaen_University_logo.svg.png)', backgroundSize: 'contain', backgroundPosition: 'right center', backgroundRepeat: 'no-repeat' }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-6">
          <h1 className="text-3xl font-bold drop-shadow">มหาวิทยาลัยขอนแก่น</h1>
          <p className="text-sm text-white/80 mt-1">KHON KAEN UNIVERSITY</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t('home.searchPlaceholder')}
            className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-kku-red bg-white text-gray-700"
          />
          <span className="absolute left-3 top-3.5 text-gray-400 text-lg">🔍</span>
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults(null) }}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >✕</button>
          )}
        </div>

        {/* Search history */}
        {!searchQuery && searchHistory.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">{t('home.recentSearch')}</p>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 5).map((h) => (
                <button
                  key={h.historyId}
                  onClick={() => handleSearch(h.searchKeyword)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full transition-colors"
                >
                  🕐 {h.searchKeyword}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search results - rooms */}
        {searchResults && searchResults.rooms.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-3">🚪 ห้องเรียน</h3>
            <div className="space-y-2">
              {searchResults.rooms.map((room) => (
                <button
                  key={room.roomId}
                  onClick={() => navigate(`/buildings/${room.buildId}?room=${room.roomId}`)}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-kku-light rounded-lg transition-colors"
                >
                  <p className="font-medium text-gray-800">{room.roomName}</p>
                  {room.roomDesc && <p className="text-xs text-gray-500">{room.roomDesc}</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {searchResults && searchResults.buildings.length === 0 && searchResults.rooms.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            {t('home.noResults')} "{searchQuery}"
          </div>
        )}

        {/* Google Maps */}
        <div className="rounded-xl overflow-hidden shadow-md h-72">
          <APIProvider apiKey={VITE_GMAPS_KEY}>
            <Map
              defaultCenter={KKU_CENTER}
              defaultZoom={15}
              gestureHandling="greedy"
              disableDefaultUI={false}
              mapId="kku-campus-map"
            >
              {buildings.map((b) => (
                <AdvancedMarker
                  key={b.buildId}
                  position={KKU_CENTER}
                  title={b.buildName}
                  onClick={() => navigate(`/buildings/${b.buildId}`)}
                >
                  <div className="bg-kku-red text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg cursor-pointer hover:bg-kku-darkred">
                    {b.buildId}
                  </div>
                </AdvancedMarker>
              ))}
            </Map>
          </APIProvider>
        </div>

        {/* Weather */}
        <WeatherWidget />

        {/* Buildings grid */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">{t('home.buildings')}</h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-xl shadow animate-pulse h-40" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedBuildings.map((b) => (
                <BuildingCard key={b.buildId} building={b} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
