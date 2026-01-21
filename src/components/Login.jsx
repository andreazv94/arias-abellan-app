import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { signIn } from '../lib/supabase'

// Logo Component
const Logo = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <path d="M50 12 L32 24 L26 50 L32 76 L50 88" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M50 12 L68 24 L74 50 L68 76 L50 88" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <ellipse cx="50" cy="50" rx="14" ry="32" stroke="currentColor" strokeWidth="2.5" fill="none"/>
  </svg>
)

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await signIn(email, password)
      
      if (error) {
        if (error.message.includes('Invalid login')) {
          setError('Email o contraseña incorrectos')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Por favor, confirma tu email antes de iniciar sesión')
        } else {
          setError(error.message)
        }
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="text-white mb-3">
        <Logo className="w-20 h-20" />
      </div>
      
      {/* Nombre */}
      <h1 className="text-white text-2xl font-light tracking-widest uppercase mb-1">
        Arias Abellán
      </h1>
      <p className="text-neutral-500 text-sm tracking-widest uppercase mb-10">
        Nutrición
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-neutral-400 text-xs uppercase tracking-wider mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition"
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-neutral-400 text-xs uppercase tracking-wider mb-2">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-4 pl-12 pr-12 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-neutral-900 rounded-xl py-4 font-semibold hover:bg-neutral-100 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-neutral-400 border-t-neutral-900 rounded-full animate-spin"></div>
              Iniciando sesión...
            </span>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </form>

      <p className="text-neutral-600 text-xs mt-12">
        © 2025 Arias Abellán Nutrición
      </p>
    </div>
  )
}
