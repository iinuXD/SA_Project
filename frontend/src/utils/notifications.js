import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

const DAY_MAP = { 0: 'SU', 1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA' }

export function useClassNotifications(schedule, notifSettings) {
  const notifiedRef = useRef(new Set())

  useEffect(() => {
    if (!schedule || !notifSettings?.isClassAlertEnabled) return

    const interval = setInterval(() => {
      const now = new Date()
      const todayDay = DAY_MAP[now.getDay()]
      const currentMinutes = now.getHours() * 60 + now.getMinutes()
      const minutesBefore = notifSettings.minutesBeforeAlert || 15

      schedule.sessions.forEach((session) => {
        if (session.dayOfWeek !== todayDay) return

        const [h, m] = session.startTime.split(':').map(Number)
        const sessionMinutes = h * 60 + m
        const diff = sessionMinutes - currentMinutes

        const key = `${session.subjectId}-${now.toDateString()}`
        if (diff > 0 && diff <= minutesBefore && !notifiedRef.current.has(key)) {
          notifiedRef.current.add(key)
          const roomDisplay =
            session.roomOverride || session.room?.roomName || 'ไม่ระบุห้อง'
          toast(
            `🔔 ${session.subjectName}\nเริ่มใน ${diff} นาที — ห้อง ${roomDisplay}`,
            {
              duration: 8000,
              style: { background: '#8B1A1A', color: '#fff', borderRadius: '12px' },
              icon: '📚',
            }
          )
        }
      })
    }, 30000) // check every 30 seconds

    return () => clearInterval(interval)
  }, [schedule, notifSettings])
}

export function getTodaySessions(sessions) {
  const todayDay = DAY_MAP[new Date().getDay()]
  return sessions
    .filter((s) => s.dayOfWeek === todayDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

export function getCurrentSession(sessions) {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const todayDay = DAY_MAP[now.getDay()]

  return sessions.find((s) => {
    if (s.dayOfWeek !== todayDay) return false
    const [sh, sm] = s.startTime.split(':').map(Number)
    const [eh, em] = s.endTime.split(':').map(Number)
    const start = sh * 60 + sm
    const end = eh * 60 + em
    return currentMinutes >= start && currentMinutes <= end
  })
}
