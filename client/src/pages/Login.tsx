import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import Background3D from '../components/Background3D'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Login() {
  const { t } = useLanguage()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error(t('fieldRequired'))
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      login(data.token, data.email)
      toast.success(t('loginSuccess'))
      navigate('/translate')
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } }).response?.status
      if (status === 401) toast.error(t('loginError'))
      else toast.error(t('networkError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Background3D />
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="glass-strong rounded-2xl p-8 shadow-2xl shadow-violet-900/20">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-1">
                {t('login')}
              </h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('email')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/60 focus:bg-white/8 transition-all"
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('password')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/60 focus:bg-white/8 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-violet-900/40"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    {t('login')}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">
              {t('noAccount')}{' '}
              <Link to="/signup" className="text-violet-400 hover:text-violet-300 transition-colors">
                {t('signup')}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
