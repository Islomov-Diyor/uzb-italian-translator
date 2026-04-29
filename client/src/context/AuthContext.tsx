import React, { createContext, useContext, useState, useCallback } from 'react'

interface AuthContextValue {
  token: string | null
  email: string | null
  login: (token: string, email: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  )
  const [email, setEmail] = useState<string | null>(
    () => localStorage.getItem('email')
  )

  const login = useCallback((t: string, e: string) => {
    localStorage.setItem('token', t)
    localStorage.setItem('email', e)
    setToken(t)
    setEmail(e)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    setToken(null)
    setEmail(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, email, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
