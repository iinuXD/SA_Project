import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getBuildings,
  adminCreateBuilding, adminUpdateBuilding, adminDeleteBuilding,
  adminCreateRoom, adminUpdateRoom, adminDeleteRoom,
  adminCreateImage, adminDeleteImage, adminUploadImage,
} from '../api'
import { useAuth } from '../context/AuthContext'

const TABS = ['buildings', 'rooms', 'images']

const FormInput = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="text-xs text-gray-500 block mb-1">{label}</label>
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kku-red"
    />
  </div>
)

export default function AdminPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('buildings')
  const [buildings, setBuildings] = useState([])
  const [loading, setLoading] = useState(true)

  // Forms
  const [buildingForm, setBuildingForm] = useState({ buildId: '', buildName: '', buildDesc: '', buildLocation: '' })
  const [editingBuilding, setEditingBuilding] = useState(null)
  const [roomForm, setRoomForm] = useState({ roomName: '', roomDesc: '', buildId: '' })
  const [editingRoom, setEditingRoom] = useState(null)
  const [imageForm, setImageForm] = useState({ imageUrl: '', imageDesc: '', buildId: '', roomId: '', file: null })
  const [uploading, setUploading] = useState(false)
  const [expandedBuildings, setExpandedBuildings] = useState({})

  const toggleBuildingExpand = (buildId) =>
    setExpandedBuildings(prev => ({ ...prev, [buildId]: !prev[buildId] }))

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return }
    fetchData()
  }, [user])

  const fetchData = () => {
    getBuildings()
      .then(setBuildings)
      .finally(() => setLoading(false))
  }

  const allRooms = buildings.flatMap(b => b.rooms ? b.rooms.map(r => ({ ...r, buildName: b.buildName })) : [])

  // Building CRUD
  const handleSaveBuilding = async () => {
    try {
      if (editingBuilding) {
        await adminUpdateBuilding(editingBuilding.buildId, buildingForm)
      } else {
        await adminCreateBuilding(buildingForm)
      }
      toast.success(t('admin.saveSuccess'))
      setBuildingForm({ buildId: '', buildName: '', buildDesc: '', buildLocation: '' })
      setEditingBuilding(null)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || t('common.error'))
    }
  }

  const handleDeleteBuilding = async (id) => {
    if (!confirm(t('admin.confirm_delete'))) return
    await adminDeleteBuilding(id)
    toast.success(t('admin.deleteSuccess'))
    fetchData()
  }

  // Room CRUD
  const handleSaveRoom = async () => {
    try {
      if (editingRoom) {
        await adminUpdateRoom(editingRoom.roomId, roomForm)
      } else {
        await adminCreateRoom(roomForm)
      }
      toast.success(t('admin.saveSuccess'))
      setRoomForm({ roomName: '', roomDesc: '', buildId: '' })
      setEditingRoom(null)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || t('common.error'))
    }
  }

  const handleDeleteRoom = async (id) => {
    if (!confirm(t('admin.confirm_delete'))) return
    await adminDeleteRoom(id)
    toast.success(t('admin.deleteSuccess'))
    fetchData()
  }

  // Image CRUD
  const handleSaveImage = async () => {
    try {
      let imageUrl = imageForm.imageUrl
      if (imageForm.file) {
        setUploading(true)
        const { url } = await adminUploadImage(imageForm.file)
        imageUrl = url
        setUploading(false)
      }
      if (!imageUrl) {
        toast.error('กรุณาเลือกรูปภาพ')
        return
      }
      await adminCreateImage({
        imageUrl,
        imageDesc: imageForm.imageDesc || null,
        buildId: imageForm.buildId || null,
        roomId: imageForm.roomId || null,
      })
      toast.success(t('admin.saveSuccess'))
      setImageForm({ imageUrl: '', imageDesc: '', buildId: '', roomId: '', file: null })
      fetchData()
    } catch (err) {
      setUploading(false)
      toast.error(err.response?.data?.detail || t('common.error'))
    }
  }

  const handleDeleteImage = async (id) => {
    if (!confirm(t('admin.confirm_delete'))) return
    await adminDeleteImage(id)
    toast.success(t('admin.deleteSuccess'))
    fetchData()
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-gray-500">{t('common.loading')}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-kku-red text-white px-6 py-5">
        <h1 className="text-xl font-bold">⚙️ {t('admin.title')}</h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {TABS.map((tb) => (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
                ${tab === tb ? 'bg-kku-red text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {t(`admin.${tb}`)}
            </button>
          ))}
        </div>

        {/* Buildings Tab */}
        {tab === 'buildings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="font-semibold text-gray-700 mb-4">
                {editingBuilding ? `✏️ ${t('admin.edit')}` : `➕ ${t('admin.add')}`} {t('admin.buildings')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput label="ID" value={buildingForm.buildId}
                  onChange={e => setBuildingForm({ ...buildingForm, buildId: e.target.value })}
                  placeholder="SC, EN, KBS..." />
                <FormInput label={t('admin.buildName')} value={buildingForm.buildName}
                  onChange={e => setBuildingForm({ ...buildingForm, buildName: e.target.value })} />
                <div className="sm:col-span-2">
                  <FormInput label={t('admin.buildLocation')} value={buildingForm.buildLocation}
                    onChange={e => setBuildingForm({ ...buildingForm, buildLocation: e.target.value })}
                    placeholder="https://maps.google.com/..." />
                </div>
                <div className="sm:col-span-2">
                  <FormInput label={t('admin.buildDesc')} value={buildingForm.buildDesc}
                    onChange={e => setBuildingForm({ ...buildingForm, buildDesc: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                {editingBuilding && (
                  <button onClick={() => { setEditingBuilding(null); setBuildingForm({ buildId: '', buildName: '', buildDesc: '', buildLocation: '' }) }}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm">
                    {t('schedule.cancel')}
                  </button>
                )}
                <button onClick={handleSaveBuilding}
                  className="px-6 py-2 bg-kku-red text-white rounded-lg text-sm font-medium hover:bg-kku-darkred">
                  {t('schedule.save')}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs">
                  <tr>
                    <th className="text-left px-4 py-3">ID</th>
                    <th className="text-left px-4 py-3">{t('admin.buildName')}</th>
                    <th className="text-left px-4 py-3 hidden sm:table-cell">{t('admin.buildLocation')}</th>
                    <th className="text-center px-4 py-3">{t('admin.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {buildings.map((b) => (
                    <tr key={b.buildId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-kku-red">{b.buildId}</td>
                      <td className="px-4 py-3 font-medium">{b.buildName}</td>
                      <td className="px-4 py-3 text-xs hidden sm:table-cell truncate max-w-48">
                        {b.buildLocation
                          ? <a href={b.buildLocation} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">🔗 Google Maps</a>
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => { setEditingBuilding(b); setBuildingForm({ buildId: b.buildId, buildName: b.buildName, buildDesc: b.buildDesc || '', buildLocation: b.buildLocation || '' }) }}
                            className="text-blue-500 hover:text-blue-700 text-xs px-2 py-1 rounded border border-blue-200">
                            {t('admin.edit')}
                          </button>
                          <button onClick={() => handleDeleteBuilding(b.buildId)}
                            className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded border border-red-200">
                            {t('admin.delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rooms Tab */}
        {tab === 'rooms' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="font-semibold text-gray-700 mb-4">
                {editingRoom ? `✏️ ${t('admin.edit')}` : `➕ ${t('admin.add')}`} {t('admin.rooms')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">{t('admin.selectBuilding')}</label>
                  <select
                    value={roomForm.buildId}
                    onChange={e => setRoomForm({ ...roomForm, buildId: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kku-red"
                  >
                    <option value="">-- เลือกอาคาร --</option>
                    {buildings.map(b => <option key={b.buildId} value={b.buildId}>{b.buildName}</option>)}
                  </select>
                </div>
                <FormInput label={t('admin.roomName')} value={roomForm.roomName}
                  onChange={e => setRoomForm({ ...roomForm, roomName: e.target.value })}
                  placeholder="SC01-101" />
                <div className="sm:col-span-2">
                  <FormInput label={t('admin.roomDesc')} value={roomForm.roomDesc}
                    onChange={e => setRoomForm({ ...roomForm, roomDesc: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                {editingRoom && (
                  <button onClick={() => { setEditingRoom(null); setRoomForm({ roomName: '', roomDesc: '', buildId: '' }) }}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm">
                    {t('schedule.cancel')}
                  </button>
                )}
                <button onClick={handleSaveRoom}
                  className="px-6 py-2 bg-kku-red text-white rounded-lg text-sm font-medium hover:bg-kku-darkred">
                  {t('schedule.save')}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs">
                  <tr>
                    <th className="text-left px-4 py-3">{t('admin.roomName')}</th>
                    <th className="text-left px-4 py-3">{t('admin.buildName')}</th>
                    <th className="text-left px-4 py-3 hidden sm:table-cell">{t('admin.roomDesc')}</th>
                    <th className="text-center px-4 py-3">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {buildings.flatMap(b => (b.rooms || []).map(r => ({ ...r, buildName: b.buildName }))).map((r) => (
                    <tr key={r.roomId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{r.roomName}</td>
                      <td className="px-4 py-3 text-gray-500">{r.buildName}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">{r.roomDesc || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => { setEditingRoom(r); setRoomForm({ roomName: r.roomName, roomDesc: r.roomDesc || '', buildId: r.buildId }) }}
                            className="text-blue-500 hover:text-blue-700 text-xs px-2 py-1 rounded border border-blue-200">
                            {t('admin.edit')}
                          </button>
                          <button onClick={() => handleDeleteRoom(r.roomId)}
                            className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded border border-red-200">
                            {t('admin.delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Images Tab */}
        {tab === 'images' && (
          <div className="space-y-6">
            {/* Add image form */}
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="font-semibold text-gray-700 mb-4">➕ {t('admin.add')} {t('admin.images')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-500 block mb-1">{t('admin.imageUrl')}</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={e => {
                      const file = e.target.files[0]
                      if (file) {
                        setImageForm({ ...imageForm, file, imageUrl: URL.createObjectURL(file) })
                      }
                    }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kku-red"
                  />
                </div>
                <FormInput label={t('admin.imageDesc')} value={imageForm.imageDesc}
                  onChange={e => setImageForm({ ...imageForm, imageDesc: e.target.value })} />
                <div>
                  <label className="text-xs text-gray-500 block mb-1">แนบกับอาคาร</label>
                  <select value={imageForm.buildId}
                    onChange={e => setImageForm({ ...imageForm, buildId: e.target.value, roomId: '' })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kku-red">
                    <option value="">-- เลือกอาคาร (ไม่บังคับ) --</option>
                    {buildings.map(b => <option key={b.buildId} value={b.buildId}>{b.buildName}</option>)}
                  </select>
                </div>
                {imageForm.buildId && (
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">แนบกับห้อง</label>
                    <select value={imageForm.roomId}
                      onChange={e => setImageForm({ ...imageForm, roomId: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kku-red">
                      <option value="">-- เลือกห้อง (ไม่บังคับ) --</option>
                      {(buildings.find(b => b.buildId === imageForm.buildId)?.rooms || []).map(r =>
                        <option key={r.roomId} value={r.roomId}>{r.roomName}</option>
                      )}
                    </select>
                  </div>
                )}
              </div>
              {imageForm.imageUrl && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Preview:</p>
                  <img src={imageForm.imageUrl} className="h-20 object-cover rounded-lg" onError={e => e.target.style.display = 'none'} />
                </div>
              )}
              <button onClick={handleSaveImage} disabled={uploading}
                className="mt-4 px-6 py-2 bg-kku-red text-white rounded-lg text-sm font-medium hover:bg-kku-darkred disabled:opacity-50">
                {uploading ? 'กำลังอัปโหลด...' : t('schedule.save')}
              </button>
            </div>

            {/* Expandable building sections */}
            <div className="space-y-3">
              {buildings.map(b => {
                const isOpen = !!expandedBuildings[b.buildId]
                const buildingImgCount = (b.images || []).length
                const roomImgCount = (b.rooms || []).reduce((sum, r) => sum + (r.images || []).length, 0)
                const totalCount = buildingImgCount + roomImgCount
                return (
                  <div key={b.buildId} className="bg-white rounded-xl shadow overflow-hidden">
                    {/* Building header row */}
                    <button
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                      onClick={() => toggleBuildingExpand(b.buildId)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-kku-red font-bold text-sm">{b.buildId}</span>
                        <span className="font-semibold text-gray-800">{b.buildName}</span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {totalCount} รูป
                        </span>
                      </div>
                      <span className="text-gray-400 text-lg">{isOpen ? '▲' : '▼'}</span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-gray-100 px-5 py-4 space-y-5">
                        {/* Building-level images */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            🏢 รูปอาคาร ({buildingImgCount})
                          </p>
                          {buildingImgCount === 0 ? (
                            <p className="text-xs text-gray-300 italic">ไม่มีรูปภาพ</p>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              {(b.images || []).map(img => (
                                <div key={img.imageId} className="relative group rounded-xl overflow-hidden shadow">
                                  <img src={img.imageUrl} alt={img.imageDesc}
                                    className="w-full h-28 object-cover"
                                    onError={e => e.target.style.display = 'none'} />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end">
                                    <div className="w-full p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                                      {img.imageDesc && <p className="text-white text-xs truncate mb-1">{img.imageDesc}</p>}
                                      <button onClick={() => handleDeleteImage(img.imageId)}
                                        className="w-full text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">
                                        {t('admin.delete')}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Per-room images */}
                        {(b.rooms || []).map(r => (
                          <div key={r.roomId}>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              🚪 {r.roomName} ({(r.images || []).length} รูป)
                            </p>
                            {(r.images || []).length === 0 ? (
                              <p className="text-xs text-gray-300 italic">ไม่มีรูปภาพ</p>
                            ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {r.images.map(img => (
                                  <div key={img.imageId} className="relative group rounded-xl overflow-hidden shadow">
                                    <img src={img.imageUrl} alt={img.imageDesc}
                                      className="w-full h-28 object-cover"
                                      onError={e => e.target.style.display = 'none'} />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end">
                                      <div className="w-full p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                                        {img.imageDesc && <p className="text-white text-xs truncate mb-1">{img.imageDesc}</p>}
                                        <button onClick={() => handleDeleteImage(img.imageId)}
                                          className="w-full text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">
                                          {t('admin.delete')}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
