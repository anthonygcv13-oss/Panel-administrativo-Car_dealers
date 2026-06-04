'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, AlertCircle, Sun, Moon } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const success = await login(email, password)
    if (success) {
      router.push('/dashboard')
    } else {
      setError('Credenciales incorrectas. Por favor, verifica tu email y contraseña.')
    }
    setIsLoading(false)
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-br from-cream-light via-silver-light to-pure-white'
      }`}
    >
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsDark(!isDark)}
        className={`absolute top-8 right-8 z-50 p-3 rounded-full transition-all duration-300 ${
          isDark
            ? 'bg-midnight-blue/20 hover:bg-midnight-blue/40 text-soft-gold'
            : 'bg-luxe-gold/10 hover:bg-luxe-gold/20 text-luxe-gold'
        }`}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

      {/* Main Container */}
      <div className="w-full min-h-screen flex flex-col md:flex-row overflow-auto md:overflow-hidden">
        {/* Left Side - Form */}
        <div
          className={`w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 transition-colors duration-300 ${
            isDark ? 'bg-slate-800/50 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'
          }`}
        >
          {/* Decorative Elements - Top Left */}
          <div
            className={`absolute top-12 left-12 w-24 h-24 rounded-full opacity-10 transition-colors duration-300 ${
              isDark ? 'bg-soft-gold' : 'bg-luxe-gold'
            }`}
          />
          <div
            className={`absolute top-20 left-20 w-12 h-12 rounded-full opacity-20 transition-colors duration-300 ${
              isDark ? 'bg-midnight-blue' : 'bg-midnight-blue/30'
            }`}
          />

          <div className="relative w-full max-w-md z-10">
            {/* Logo Section */}
            <div className="text-center mb-10">
              <div className="flex justify-center mb-6">
                <img src="/carliz-logo.png" alt="CARLIZ Logo" className="h-24 w-auto" />
              </div>
              <h1
                className={`text-4xl md:text-5xl font-bold tracking-wider transition-colors duration-300 ${
                  isDark
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-soft-gold to-luxe-gold'
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-luxe-gold to-midnight-blue'
                }`}
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                CARLIZ
              </h1>
              <p
                className={`mt-2 text-sm tracking-widest transition-colors duration-300 ${
                  isDark ? 'text-stainless-silver/60' : 'text-midnight-blue/70'
                }`}
              >
                Every Second Counts
              </p>
            </div>

            {/* Form Card */}
            <Card
              className={`border-2 transition-all duration-300 ${
                isDark
                  ? 'bg-slate-700/50 border-luxe-gold/30 shadow-2xl shadow-black/50'
                  : 'bg-white/95 border-luxe-gold/40 shadow-xl'
              }`}
            >
              {/* Top Accent Bar */}
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
                  Acceso
                </CardTitle>
                <CardDescription
                  className={`text-center mt-2 transition-colors duration-300 ${
                    isDark ? 'text-stainless-silver/70' : 'text-stainless-silver'
                  }`}
                >
                  Administración CARLIZ
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className={`text-sm font-semibold transition-colors duration-300 ${
                        isDark ? 'text-luxe-gold' : 'text-midnight-blue'
                      }`}
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@carliz.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`border-2 transition-all duration-300 ${
                        isDark
                          ? 'bg-slate-600/50 border-luxe-gold/20 text-white placeholder:text-stainless-silver/40 focus:border-luxe-gold focus:ring-0'
                          : 'bg-white border-luxe-gold/20 text-midnight-blue placeholder:text-stainless-silver/40 focus:border-luxe-gold focus:ring-0'
                      }`}
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className={`text-sm font-semibold transition-colors duration-300 ${
                        isDark ? 'text-luxe-gold' : 'text-midnight-blue'
                      }`}
                    >
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={`border-2 pr-10 transition-all duration-300 ${
                          isDark
                            ? 'bg-slate-600/50 border-luxe-gold/20 text-white placeholder:text-stainless-silver/40 focus:border-luxe-gold focus:ring-0'
                            : 'bg-white border-luxe-gold/20 text-midnight-blue placeholder:text-stainless-silver/40 focus:border-luxe-gold focus:ring-0'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                          isDark
                            ? 'text-stainless-silver/60 hover:text-luxe-gold'
                            : 'text-stainless-silver/50 hover:text-luxe-gold'
                        }`}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <a
                      href="#"
                      className={`text-xs font-semibold transition-colors duration-300 ${
                        isDark
                          ? 'text-luxe-gold hover:text-soft-gold'
                          : 'text-luxe-gold hover:text-midnight-blue'
                      }`}
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-300 ${
                        isDark
                          ? 'bg-accent-rouge/15 border-accent-rouge/40'
                          : 'bg-accent-rouge/10 border-accent-rouge/30'
                      }`}
                    >
                      <AlertCircle className="w-4 h-4 text-accent-rouge flex-shrink-0" />
                      <span className="text-sm text-accent-rouge/80">{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 mt-6 bg-gradient-to-r from-luxe-gold to-soft-gold hover:from-soft-gold hover:to-luxe-gold text-white font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verificando...</span>
                      </div>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className={`flex items-center gap-3 my-6 ${isDark ? 'opacity-50' : ''}`}>
                  <div
                    className={`flex-1 h-px transition-colors duration-300 ${
                      isDark ? 'bg-luxe-gold/20' : 'bg-luxe-gold/15'
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold transition-colors duration-300 ${
                      isDark ? 'text-stainless-silver/50' : 'text-stainless-silver/60'
                    }`}
                  >
                    DEMO
                  </span>
                  <div
                    className={`flex-1 h-px transition-colors duration-300 ${
                      isDark ? 'bg-luxe-gold/20' : 'bg-luxe-gold/15'
                    }`}
                  />
                </div>

                {/* Demo Credentials */}
                <div
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    isDark
                      ? 'bg-slate-600/30 border-midnight-blue/40'
                      : 'bg-luxe-gold/5 border-luxe-gold/20'
                  }`}
                >
                  <div className="text-center space-y-2">
                    <p
                      className={`text-xs font-bold tracking-wider transition-colors duration-300 ${
                        isDark ? 'text-soft-gold' : 'text-midnight-blue'
                      }`}
                    >
                      alex@gmail.com
                    </p>
                    <p
                      className={`text-xs font-bold transition-colors duration-300 ${
                        isDark ? 'text-soft-gold' : 'text-midnight-blue'
                      }`}
                    >
                      1234
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <p
              className={`text-center text-xs mt-6 transition-colors duration-300 ${
                isDark ? 'text-stainless-silver/40' : 'text-stainless-silver/60'
              }`}
            >
              &copy; 2026 CARLIZ. Todos los derechos reservados.
            </p>
          </div>
        </div>

        {/* Right Side - Decorative */}
        <div
          className={`hidden md:flex w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden transition-colors duration-300 ${
            isDark
              ? 'bg-gradient-to-br from-midnight-blue to-slate-700'
              : 'bg-gradient-to-br from-luxe-gold to-soft-gold'
          }`}
        >
          {/* Decorative Elements */}
          <div
            className={`absolute top-12 right-12 w-32 h-32 rounded-full opacity-20 transition-colors duration-300 ${
              isDark ? 'bg-soft-gold' : 'bg-white'
            }`}
          />
          <div
            className={`absolute bottom-12 left-12 w-40 h-40 rounded-full opacity-15 transition-colors duration-300 ${
              isDark ? 'bg-soft-gold' : 'bg-white'
            }`}
          />

          {/* Center Content */}
          <div className="relative z-10 text-center">
            <div
              className={`mb-8 inline-flex items-center justify-center w-24 h-24 rounded-2xl transition-colors duration-300 ${
                isDark
                  ? 'bg-white/10 border-2 border-white/30'
                  : 'bg-white/20 border-2 border-white/40'
              }`}
            >
              <img
                src="/carliz-logo.png"
                alt="CARLIZ"
                className="w-16 h-16 opacity-80"
              />
            </div>
            <h2
              className={`text-3xl font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-white'
              }`}
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Bienvenido
            </h2>
            <p
              className={`mt-4 text-lg transition-colors duration-300 ${
                isDark ? 'text-white/80' : 'text-white/90'
              }`}
            >
              Sistema de Gestión Administrativa
            </p>
            <p
              className={`mt-6 text-sm max-w-xs transition-colors duration-300 ${
                isDark ? 'text-white/60' : 'text-white/70'
              }`}
            >
              Accede a tu panel de control para gestionar el inventario y ventas de CARLIZ
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
