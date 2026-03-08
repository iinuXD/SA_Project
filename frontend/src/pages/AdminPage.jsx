import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getBuildings,
  adminCreateBuilding, adminUpdateBuilding, adminDeleteBuilding,
  adminCreateRoom, adminUpdateRoom, adminDeleteRoom,
  adminCreateImage, adminDeleteImage,
} from '../api'
import { useAuth } from '../context/AuthContext'

const TABS = ['buildings', 'rooms', 'images']

export default function AdminPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('buildings')
  const [buildings, setBuildings] = useState([])
  const [loading, setLoading] = useState(true)

  // Forms
  const [buildingForm, setBuildingForm] = useState({ buildName: '', buildDesc: '', buildLocation: '' })
  const [editingBuilding, setEditingBuilding] = useState(null)
  const [roomForm, setRoomForm] = useState({ roomName: '', roomDesc: '', buildId: '' })
  const [editingRoom, setEditingRoom] = useState(null)
  const [imageForm, setImageForm] = useState({ imageUrl: '', imageDesc: '', buildId: '', roomId: '' })

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
      setBuildingForm({ buildName: '', buildDesc: '', buildLocation: '' })
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
      await adminCreateImage({
        ...imageForm,
        buildId: imageForm.buildId || null,
        roomId: imageForm.roomId || null,
      })
      toast.success(t('admin.saveSuccess'))
      setImageForm({ imageUrl: '', imageDesc: '', buildId: '', roomId: '' })
      fetchData()
    } catch (err) {
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
                <FormInput label={t('admin.buildName')} value={buildingForm.buildName}
                  onChange={e => setBuildingForm({ ...buildingForm, buildName: e.target.value })} />
                <FormInput label={t('admin.buildLocation')} value={buildingForm.buildLocation}
                  onChange={e => setBuildingForm({ ...buildingForm, buildLocation: e.target.value })}
                  placeholder="ChIJ..." />
                <div className="sm:col-span-2">
                  <FormInput label={t('admin.buildDesc')} value={buildingForm.buildDesc}
                    onChange={e => setBuildingForm({ ...buildingForm, buildDesc: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                {editingBuilding && (
                  <button onClick={() => { setEditingBuilding(null); setBuildingForm({ buildName: '', buildDesc: '', buildLocation: '' }) }}
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
                    <th className="text-center px-4 py-3">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {buildings.map((b) => (
                    <tr key={b.buildId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-kku-red">{b.buildId}</td>
                      <td className="px-4 py-3 font-medium">{b.buildName}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell truncate max-w-24">{b.buildLocation || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => { setEditingBuilding(b); setBuildingForm({ buildName: b.buildName, buildDesc: b.buildDesc || '', buildLocation: b.buildLocation || '' }) }}
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
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="font-semibold text-gray-700 mb-4">➕ {t('admin.add')} {t('admin.images')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <FormInput label={t('admin.imageUrl')} value={imageForm.imageUrl}
                    onChange={e => setImageForm({ ...imageForm, imageUrl: e.target.value })}
                    placeholder="https://..." />
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
              <button onClick={handleSaveImage}
                className="mt-4 px-6 py-2 bg-kku-red text-white rounded-lg text-sm font-medium hover:bg-kku-darkred">
                {t('schedule.save')}
              </button>
            </div>

            {/* Images list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {buildings.flatMap(b => [
                ...(b.images || []).map(img => ({ ...img, label: b.buildName })),
                ...(b.rooms || []).flatMap(r => (r.images || []).map(img => ({ ...img, label: `${b.buildName} / ${r.roomName}` })))
              ]).map(img => (
                <div key={img.imageId} className="bg-white rounded-xl shadow overflow-hidden">
                  <img src={img.imageUrl} className="w-full h-32 object-cover"
                    onError={e => { e.target.src = 'data:image/svg+xml,...' }} />
                  <div className="p-3">
                    <p className="text-xs text-gray-500">{img.label}</p>
                    {img.imageDesc && <p className="text-sm text-gray-700 mt-1">{img.imageDesc}</p>}
                    <button onClick={() => handleDeleteImage(img.imageId)}
                      className="mt-2 text-xs text-red-500 hover:underline">
                      {t('admin.delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
