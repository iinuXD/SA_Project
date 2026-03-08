import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { loginWithGoogle } from '../api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { t } = useTranslation()
  const { user, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/')
  }, [user])

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const data = await loginWithGoogle(credentialResponse.credential)
      login(data.access_token, data.user)
      toast.success(`ยินดีต้อนรับ ${data.user.name}! 🎉`)
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.detail || t('auth.loginError')
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen bg-kku-light flex flex-col">
      {/* Hero */}
      <div className="relative h-64 bg-kku-red overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-kku-darkred/80 to-kku-red/60" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl">
            <span className="text-kku-red font-bold text-2xl">KKU</span>
          </div>
          <h1 className="text-2xl font-bold text-center">{t('auth.loginTitle')}</h1>
          <p className="text-sm text-white/80 text-center mt-1">{t('auth.loginSubtitle')}</p>
        </div>
      </div>

      {/* Login card */}
      <div className="flex-1 flex items-start justify-center pt-8 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <h2 className="text-lg font-bold text-gray-800 text-center mb-2">
            เข้าสู่ระบบ
          </h2>
          <p className="text-xs text-gray-500 text-center mb-6">{t('auth.loginNote')}</p>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error(t('auth.loginError'))}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              locale="th"
            />
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              ระบบจะตรวจสอบว่าเป็น KKU Mail เท่านั้น
            </p>
            <div className="flex justify-center gap-2 mt-2">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">@kkumail.com</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">@kku.ac.th</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
