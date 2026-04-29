import { LogOut, Globe } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Lang } from '../i18n/translations'

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'uz', label: 'UZ', flag: '🇺🇿' },
  { code: 'it', label: 'IT', flag: '🇮🇹' },
]

export default function Navbar() {
  const { lang, setLang, t } = useLanguage()
  const { isAuthenticated, logout, email } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <span className="font-semibold text-lg bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent select-none">
          {t('appName')}
        </span>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 glass rounded-lg px-2 py-1">
            <Globe size={14} className="text-violet-400 mr-1" />
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                  lang === l.code
                    ? 'bg-violet-600/60 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>

          {isAuthenticated && (
            <>
              {email && (
                <span className="text-xs text-slate-500 hidden sm:block truncate max-w-[140px]">
                  {email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors glass rounded-lg px-3 py-1.5"
              >
                <LogOut size={13} />
                {t('logout')}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
