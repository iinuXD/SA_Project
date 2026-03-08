import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getKKUWeather } from '../api'

export default function WeatherWidget() {
  const { t, i18n } = useTranslation()
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getKKUWeather()
      .then(setWeather)
      .catch(() => setWeather(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div className="bg-white rounded-xl shadow p-4 animate-pulse h-20" />
    )

  if (!weather) return null

  const desc = i18n.language === 'th' ? weather.description_th : weather.description_en

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-blue-100">{t('home.weather')}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl">{weather.icon}</span>
            <div>
              <span className="text-2xl font-bold">{Math.round(weather.temperature)}°C</span>
              <p className="text-sm text-blue-100">{desc}</p>
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-blue-100 space-y-1">
          <p>💧 {weather.humidity}%</p>
          <p>💨 {Math.round(weather.windspeed)} km/h</p>
          <p className="text-blue-200">มข. ขอนแก่น</p>
        </div>
      </div>
    </div>
  )
}
