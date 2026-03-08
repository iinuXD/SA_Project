import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: API_BASE })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginWithGoogle = (credential) =>
  api.post('/auth/google', { credential }).then((r) => r.data)

export const getMe = () => api.get('/auth/me').then((r) => r.data)

export const getMySettings = () => api.get('/auth/me/settings').then((r) => r.data)

export const updateLanguage = (languageCode) =>
  api.patch('/auth/me/settings', { languageCode }).then((r) => r.data)

// ── Map / Buildings ───────────────────────────────────────────────────────────
export const getBuildings = () => api.get('/map/buildings').then((r) => r.data)

export const getBuilding = (id) => api.get(`/map/buildings/${id}`).then((r) => r.data)

export const getRoomsByBuilding = (id) =>
  api.get(`/map/buildings/${id}/rooms`).then((r) => r.data)

export const getRoom = (id) => api.get(`/map/rooms/${id}`).then((r) => r.data)

export const searchBuildingsRooms = (q) =>
  api.get('/map/search', { params: { q } }).then((r) => r.data)

export const getSearchHistory = () => api.get('/map/search/history').then((r) => r.data)

// ── Schedule ──────────────────────────────────────────────────────────────────
export const importIcs = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/schedule/import', form).then((r) => r.data)
}

export const getMySchedule = () => api.get('/schedule/me').then((r) => r.data)

export const updateSession = (id, data) =>
  api.patch(`/schedule/session/${id}`, data).then((r) => r.data)

export const getNotificationSettings = () =>
  api.get('/schedule/notifications').then((r) => r.data)

export const updateNotificationSettings = (data) =>
  api.patch('/schedule/notifications', data).then((r) => r.data)

// ── Weather ───────────────────────────────────────────────────────────────────
export const getKKUWeather = () => api.get('/weather/kku').then((r) => r.data)

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminCreateBuilding = (data) =>
  api.post('/admin/buildings', data).then((r) => r.data)

export const adminUpdateBuilding = (id, data) =>
  api.put(`/admin/buildings/${id}`, data).then((r) => r.data)

export const adminDeleteBuilding = (id) =>
  api.delete(`/admin/buildings/${id}`).then((r) => r.data)

export const adminCreateRoom = (data) =>
  api.post('/admin/rooms', data).then((r) => r.data)

export const adminUpdateRoom = (id, data) =>
  api.put(`/admin/rooms/${id}`, data).then((r) => r.data)

export const adminDeleteRoom = (id) =>
  api.delete(`/admin/rooms/${id}`).then((r) => r.data)

export const adminCreateImage = (data) =>
  api.post('/admin/images', data).then((r) => r.data)

export const adminUpdateImage = (id, data) =>
  api.put(`/admin/images/${id}`, data).then((r) => r.data)

export const adminDeleteImage = (id) =>
  api.delete(`/admin/images/${id}`).then((r) => r.data)
