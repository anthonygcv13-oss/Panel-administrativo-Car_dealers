'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Sun, Moon } from 'lucide-react'

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000/api'
  }

  return 'https://car-dealership-03qc.onrender.com/api'
}

const API_URL = getApiUrl()

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('carliz-theme')
    if (savedTheme) {
      const isDarkTheme = savedTheme === 'dark'
      setIsDark(isDarkTheme)
      if (isDarkTheme) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(prefersDark)
      if (prefersDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [])

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    localStorage.setItem('carliz-theme', nextDark ? 'dark' : 'light')
    if (nextDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setSuccess(true)
      } else {
        setError(data.error || 'Error al procesar la solicitud')
      }
    } catch {
      setError('Error de conexión con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-[#08080A] via-[#0E0E12] to-[#08080A]'
          : 'bg-gradient-to-br from-cream-light via-silver-light to-pure-white'
      }`}
    >
      <button
        onClick={toggleTheme}
        className={`absolute top-8 right-8 z-50 p-3 rounded-full transition-all duration-300 border ${
          isDark
            ? 'bg-[#18181C] hover:bg-[#222226] text-luxe-gold border-luxe-gold/30 shadow-lg shadow-black/30'
            : 'bg-luxe-gold/10 hover:bg-luxe-gold/20 text-luxe-gold border-luxe-gold/20'
        }`}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

      <div className="w-full max-w-md p-8">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            {isDark ? (
              <div className="w-24 h-24 rounded-full bg-white border-2 border-luxe-gold flex items-center justify-center p-2 shadow-lg shadow-black/30 overflow-hidden">
                <img src="/carliz-logo.png" alt="CARLIZ Logo" className="h-16 w-auto object-contain" />
              </div>
            ) : (
              <img src="/carliz-logo.png" alt="CARLIZ Logo" className="h-24 w-auto animate-fade-in" />
            )}
          </div>
          <h1
            className={`text-4xl font-bold tracking-wider transition-colors duration-300 ${
              isDark
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-soft-gold to-luxe-gold'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-luxe-gold to-midnight-blue'
            }`}
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            CARLIZ
          </h1>
        </div>

        <Card
          className={`border-2 transition-all duration-300 ${
            isDark
              ? 'bg-[#121215]/90 border-luxe-gold/30 shadow-2xl shadow-black/80'
              : 'bg-white/95 border-luxe-gold/40 shadow-xl'
          }`}
        >
          <div className="h-2 bg-gradient-to-r from-luxe-gold via-soft-gold to-luxe-gold" />

          <CardHeader
            className={`pb-6 transition-colors duration-300 ${
              isDark ? 'border-b border-luxe-gold/20' : 'border-b border-luxe-gold/15'
            }`}
          >
            <CardTitle
              className={`text-2xl text-center transition-colors duration-300 ${
                isDark ? 'text-soft-gold' : 'text-midnight-blue'
              }`}
            >
              Recuperar Contraseña
            </CardTitle>
            <CardDescription
              className={`text-center mt-2 transition-colors duration-300 ${
                isDark ? 'text-stainless-silver/70' : 'text-stainless-silver'
              }`}
            >
              {success
                ? 'Revisa tu bandeja de entrada'
                : 'Ingresa tu email y te enviaremos instrucciones'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8 pb-8">
            {success ? (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className={`p-4 rounded-full ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                    <CheckCircle className={`w-12 h-12 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                </div>
                <p className={`text-sm ${isDark ? 'text-stainless-silver/70' : 'text-stainless-silver'}`}>
                  Si el email está registrado, recibirás un enlace para restablecer tu contraseña.
                </p>
                <Link
                  href="/"
                  className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
                    isDark ? 'text-luxe-gold hover:text-soft-gold' : 'text-luxe-gold hover:text-midnight-blue'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio de sesión
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className={`text-sm font-semibold transition-colors duration-300 ${
                      isDark ? 'text-[#ECEAE5]' : 'text-midnight-blue'
                    }`}
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`border-2 pl-10 transition-all duration-300 ${
                        isDark
                          ? 'bg-[#16161A] border-luxe-gold/20 text-[#F5F5F7] placeholder:text-[#9E9E9E]/40 focus:border-luxe-gold focus:ring-0'
                          : 'bg-white border-luxe-gold/20 text-midnight-blue placeholder:text-stainless-silver/40 focus:border-luxe-gold focus:ring-0'
                      }`}
                    />
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                      isDark ? 'text-stainless-silver/40' : 'text-stainless-silver/50'
                    }`} />
                  </div>
                </div>

                {error && (
                  <div
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-300 ${
                      isDark
                        ? 'bg-accent-rouge/15 border-accent-rouge/30'
                        : 'bg-accent-rouge/10 border-accent-rouge/30'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 text-accent-rouge flex-shrink-0" />
                    <span className="text-sm text-accent-rouge/80">{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-gradient-to-r from-luxe-gold to-soft-gold hover:from-soft-gold hover:to-luxe-gold text-white font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    'Enviar instrucciones'
                  )}
                </Button>

                <div className="text-center">
                  <Link
                    href="/"
                    className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
                      isDark ? 'text-luxe-gold hover:text-soft-gold' : 'text-luxe-gold hover:text-midnight-blue'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio de sesión
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p
          className={`text-center text-xs mt-6 transition-colors duration-300 ${
            isDark ? 'text-stainless-silver/40' : 'text-stainless-silver/60'
          }`}
        >
          &copy; 2026 CARLIZ. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
