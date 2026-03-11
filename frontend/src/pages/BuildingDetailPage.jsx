import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import { getBuilding } from '../api'
import { parseCoordsFromUrl, KKU_CENTER } from '../utils/parseMapUrl'

const VITE_GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'

export default function BuildingDetailPage() {
  const { buildId } = useParams()
  const [searchParams] = useSearchParams()
  const highlightRoom = searchParams.get('room')
  const { t } = useTranslation()
  const [building, setBuilding] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [roomSearch, setRoomSearch] = useState('')

  useEffect(() => {
    getBuilding(buildId)
      .then(setBuilding)
      .finally(() => setLoading(false))
  }, [buildId])

  useEffect(() => {
    if (building && highlightRoom) {
      const room = building.rooms.find(r => r.roomId === highlightRoom)
      if (room) setSelectedRoom(room)
    }
  }, [building, highlightRoom])

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    )

  if (!building)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{t('common.error')}</div>
      </div>
    )

  const mapsUrl = building.buildLocation
    ? building.buildLocation
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(building.buildName + ' KKU Khon Kaen')}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-kku-red text-white px-6 py-6">
        <Link to="/" className="text-white/70 text-sm hover:text-white">← กลับ</Link>
        <h1 className="text-2xl font-bold mt-2">{building.buildName}</h1>
        {building.buildDesc && (
          <p className="text-white/80 text-sm mt-1">{building.buildDesc}</p>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Images */}
        {building.images?.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {building.images.map((img) => (
              <div key={img.imageId} className="rounded-xl overflow-hidden shadow">
                <img
                  src={img.imageUrl}
                  alt={img.imageDesc || building.buildName}
                  className="w-full h-32 object-cover"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Google Maps */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-700">{t('building.location')}</h2>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              {t('building.viewOnMap')} ↗
            </a>
          </div>
          <div className="rounded-xl overflow-hidden shadow-md h-48">
            <APIProvider apiKey={VITE_GMAPS_KEY}>
              <Map defaultCenter={parseCoordsFromUrl(building.buildLocation)} defaultZoom={16} gestureHandling="greedy" mapId="building-map">
                <AdvancedMarker position={parseCoordsFromUrl(building.buildLocation)} title={building.buildName}>
                  <div className="bg-kku-red text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
                    {building.buildId}
                  </div>
                </AdvancedMarker>
              </Map>
            </APIProvider>
          </div>
        </div>

        {/* Rooms list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-700">
              {t('building.rooms')} ({building.rooms?.length || 0})
            </h2>
          </div>
          {building.rooms?.length > 0 && (
            <div className="relative mb-3">
              <input
                type="text"
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                placeholder={t('building.searchRooms') || 'ค้นหาห้องเรียน...'}
                className="w-full px-4 py-2 pl-9 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kku-red bg-white"
              />
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
              {roomSearch && (
                <button
                  onClick={() => setRoomSearch('')}
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 text-sm"
                >✕</button>
              )}
            </div>
          )}
          {building.rooms?.length === 0 ? (
            <p className="text-gray-400 text-sm">{t('building.noRooms')}</p>
          ) : (() => {
            const filtered = building.rooms.filter(room =>
              room.roomName.toLowerCase().includes(roomSearch.toLowerCase()) ||
              (room.roomDesc || '').toLowerCase().includes(roomSearch.toLowerCase())
            )
            return filtered.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">ไม่พบห้องเรียนที่ค้นหา</p>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((room) => (
                <div
                  key={room.roomId}
                  onClick={() => setSelectedRoom(room)}
                  className="bg-white rounded-xl shadow p-4 cursor-pointer transition-all border-2 border-transparent hover:border-kku-red hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-kku-red/10 rounded-lg flex items-center justify-center">
                      <span className="text-kku-red text-lg">🚪</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{room.roomName}</p>
                      {room.roomDesc && (
                        <p className="text-xs text-gray-500">{room.roomDesc}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )
          })()}
        </div>

      </div>

      {/* Room detail modal */}
      {selectedRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setSelectedRoom(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚪</span>
                <h3 className="font-bold text-gray-800 text-lg">{selectedRoom.roomName}</h3>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >✕</button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-4 space-y-4">
              {selectedRoom.roomDesc && (
                <p className="text-sm text-gray-600">{selectedRoom.roomDesc}</p>
              )}
              {selectedRoom.images?.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {selectedRoom.images.map((img) => (
                    <img
                      key={img.imageId}
                      src={img.imageUrl}
                      alt={img.imageDesc || selectedRoom.roomName}
                      className="w-full h-36 object-cover rounded-xl"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">ไม่มีรูปภาพ</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
