import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getMySchedule, importIcs, updateSession,
  getNotificationSettings, updateNotificationSettings,
} from '../api'
import { useClassNotifications, getTodaySessions, getCurrentSession } from '../utils/notifications'
import { useAuth } from '../context/AuthContext'

const DAY_ORDER = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
const TODAY_DAY = ['SU','MO','TU','WE','TH','FR','SA'][new Date().getDay()]

const COLORS = [
  'bg-blue-100 border-blue-400 text-blue-800',
  'bg-green-100 border-green-400 text-green-800',
  'bg-purple-100 border-purple-400 text-purple-800',
  'bg-yellow-100 border-yellow-400 text-yellow-800',
  'bg-pink-100 border-pink-400 text-pink-800',
  'bg-indigo-100 border-indigo-400 text-indigo-800',
]

export default function SchedulePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [schedule, setSchedule] = useState(null)
  const [notifSettings, setNotifSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingSession, setEditingSession] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showNotifSettings, setShowNotifSettings] = useState(false)
  const fileRef = useRef()

  useClassNotifications(schedule, notifSettings)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    Promise.all([
      getMySchedule().catch(() => null),
      getNotificationSettings().catch(() => null),
    ]).then(([s, n]) => {
      setSchedule(s)
      setNotifSettings(n)
    }).finally(() => setLoading(false))
  }, [user])

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const toastId = toast.loading('กำลังนำเข้าตารางเรียน...')
    try {
      const s = await importIcs(file)
      setSchedule(s)
      toast.success('นำเข้าตารางเรียนสำเร็จ! 🎉', { id: toastId })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'นำเข้าไม่สำเร็จ', { id: toastId })
    }
    e.target.value = ''
  }

  const handleEditSave = async () => {
    try {
      await updateSession(editingSession.subjectId, editForm)
      const updated = await getMySchedule()
      setSchedule(updated)
      setEditingSession(null)
      toast.success(t('admin.saveSuccess'))
    } catch {
      toast.error(t('common.error'))
    }
  }

  const handleNotifSave = async (data) => {
    try {
      const updated = await updateNotificationSettings(data)
      setNotifSettings(updated)
      toast.success(t('admin.saveSuccess'))
    } catch {}
  }

  const todaySessions = schedule ? getTodaySessions(schedule.sessions) : []
  const currentSession = schedule ? getCurrentSession(schedule.sessions) : null

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-gray-500">{t('common.loading')}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-kku-red text-white px-6 py-5">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">{t('schedule.title')}</h1>
            {schedule && (
              <p className="text-white/80 text-sm">
                {t('schedule.semester')} {schedule.semester} / {t('schedule.academicYear')} {schedule.academicYear}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNotifSettings(!showNotifSettings)}
              className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10"
              title={t('schedule.notification')}
            >🔔</button>
            <button
              onClick={() => fileRef.current.click()}
              className="bg-white text-kku-red text-xs font-bold px-3 py-2 rounded-lg hover:bg-kku-light"
            >
              📁 {t('schedule.importIcs')}
            </button>
            <input ref={fileRef} type="file" accept=".ics" onChange={handleImport} className="hidden" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Notification settings panel */}
        {showNotifSettings && notifSettings && (
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-3">🔔 {t('schedule.notification')}</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={notifSettings.isClassAlertEnabled}
                  onChange={(e) => handleNotifSave({ isClassAlertEnabled: e.target.checked })}
                  className="w-4 h-4 accent-kku-red"
                />
                <span className="text-sm text-gray-700">{t('schedule.alertEnabled')}</span>
              </label>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700 w-40">{t('schedule.minutesBefore')}</label>
                <input
                  type="number"
                  min="1" max="60"
                  value={notifSettings.minutesBeforeAlert}
                  onChange={(e) => handleNotifSave({ minutesBeforeAlert: parseInt(e.target.value) })}
                  className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {!schedule ? (
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <p className="text-5xl mb-4">📅</p>
            <p className="text-gray-500 mb-4">{t('schedule.noSchedule')}</p>
            <button
              onClick={() => fileRef.current.click()}
              className="bg-kku-red text-white px-6 py-2 rounded-lg font-medium hover:bg-kku-darkred"
            >
              {t('schedule.importBtn')}
            </button>
          </div>
        ) : (
          <>
            {/* Today's classes highlight */}
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-bold text-gray-800 mb-3">
                📅 {t('schedule.todayClasses')} ({t(`schedule.daysLong.${TODAY_DAY}`)})
              </h2>
              {todaySessions.length === 0 ? (
                <p className="text-gray-400 text-sm">{t('schedule.noTodayClasses')}</p>
              ) : (
                <div className="space-y-2">
                  {todaySessions.map((s) => {
                    const isCurrent = currentSession?.subjectId === s.subjectId
                    const roomDisplay = s.roomOverride || s.room?.roomName || '—'
                    return (
                      <div
                        key={s.subjectId}
                        className={`flex items-center justify-between p-3 rounded-lg border-l-4
                          ${isCurrent ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}
                      >
                        <div>
                          <p className={`font-medium text-sm ${isCurrent ? 'text-green-800' : 'text-gray-800'}`}>
                            {isCurrent && '🟢 '}{s.subjectName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {s.startTime}–{s.endTime} · ห้อง {roomDisplay}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {s.room && (
                            <button
                              onClick={() => navigate(`/buildings/${s.room.buildId}?room=${s.roomId}`)}
                              className="text-xs text-kku-red hover:underline"
                            >
                              📍 แผนที่
                            </button>
                          )}
                          <button
                            onClick={() => { setEditingSession(s); setEditForm({ roomOverride: s.roomOverride || '' }) }}
                            className="text-xs text-blue-500 hover:underline"
                          >
                            {t('schedule.edit')}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Weekly schedule grid */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="grid grid-cols-8 border-b border-gray-100">
                <div className="p-2 text-xs text-gray-400 text-center">เวลา</div>
                {DAY_ORDER.map((day) => (
                  <div
                    key={day}
                    className={`p-2 text-xs font-medium text-center
                      ${day === TODAY_DAY ? 'bg-kku-red text-white' : 'text-gray-600'}`}
                  >
                    {t(`schedule.days.${day}`)}
                  </div>
                ))}
              </div>

              {/* Time slots 8:00 - 21:00 */}
              {Array.from({ length: 14 }, (_, i) => i + 8).map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-gray-50 min-h-[40px]">
                  <div className="p-1 text-xs text-gray-300 text-center border-r border-gray-100">
                    {hour}:00
                  </div>
                  {DAY_ORDER.map((day) => {
                    const sessionsInSlot = schedule.sessions.filter((s) => {
                      if (s.dayOfWeek !== day) return false
                      const [sh] = s.startTime.split(':').map(Number)
                      const [eh] = s.endTime.split(':').map(Number)
                      return sh === hour || (sh < hour && eh > hour)
                    })
                    return (
                      <div key={day} className={`p-0.5 ${day === TODAY_DAY ? 'bg-red-50' : ''}`}>
                        {sessionsInSlot.map((s, idx) => {
                          const [sh] = s.startTime.split(':').map(Number)
                          if (sh !== hour) return null
                          const colorClass = COLORS[idx % COLORS.length]
                          const roomDisplay = s.roomOverride || s.room?.roomName || '?'
                          return (
                            <button
                              key={s.subjectId}
                              onClick={() => { setEditingSession(s); setEditForm({ roomOverride: s.roomOverride || '' }) }}
                              className={`w-full text-left text-xs p-1 rounded border-l-2 mb-0.5 ${colorClass} hover:opacity-80`}
                            >
                              <p className="font-medium truncate">{s.subjectName}</p>
                              <p className="opacity-70 truncate">{roomDisplay}</p>
                            </button>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit session modal */}
      {editingSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-800 mb-4">✏️ {t('schedule.editSession')}</h3>
            <p className="text-sm text-gray-600 mb-4 font-medium">{editingSession.subjectName}</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">{t('schedule.roomOverride')}</label>
                <input
                  type="text"
                  value={editForm.roomOverride}
                  onChange={(e) => setEditForm({ ...editForm, roomOverride: e.target.value })}
                  placeholder="เช่น EN01-102, Make-up"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kku-red"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingSession(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm"
              >
                {t('schedule.cancel')}
              </button>
              <button
                onClick={handleEditSave}
                className="flex-1 bg-kku-red text-white py-2 rounded-lg text-sm font-medium hover:bg-kku-darkred"
              >
                {t('schedule.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
