import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { t } = useTranslation()
  const { user, logout, changeLanguage } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
        ${location.pathname === to
          ? 'bg-white/20 text-white'
          : 'text-white/80 hover:text-white hover:bg-white/10'}`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="bg-kku-red shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-kku-red font-bold text-xs">KKU</span>
            </div>
            <span className="text-white font-bold text-sm hidden sm:block">
              Where is My Classroom
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navLink('/', t('nav.home'))}
            {user && navLink('/schedule', t('nav.schedule'))}
            {navLink('/buildings', t('nav.faculties'))}
            {user?.role === 'admin' && navLink('/admin', t('nav.admin'))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={() => changeLanguage(document.documentElement.lang === 'th' ? 'en' : 'th')}
              className="text-white/80 hover:text-white text-xs px-2 py-1 border border-white/30 rounded"
              title="Toggle language"
              onClick={() => {
                const currentLang = localStorage.getItem('lang') || 'th'
                changeLanguage(currentLang === 'th' ? 'en' : 'th')
              }}
            >
              {(localStorage.getItem('lang') || 'th') === 'th' ? 'EN' : 'TH'}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-kku-gold rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-white/70 hover:text-white text-xs"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-white text-sm hover:underline">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
