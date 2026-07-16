"use client"

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Search, User, Settings, LogOut, Sun, Moon, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { NotificationsMenu } from './notifications-menu'

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  const { user, logout, sidebarCollapsed, setSidebarCollapsed } = useAuthStore()
  const router = useRouter()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
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

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-cream-light via-silver-light to-cream-light dark:from-[#0C0C0E] dark:via-[#121215] dark:to-[#0C0C0E] backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#0C0C0E]/60 border-b border-luxe-gold/20 dark:border-luxe-gold/10 shadow-sm print:hidden">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2 hover:bg-luxe-gold/5 flex-shrink-0"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6 text-luxe-gold" />
        </Button>

        {/* Title section */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-luxe-gold to-midnight-blue dark:to-[#F5F5F7] truncate" style={{ fontFamily: 'var(--font-playfair)' }}>
            {title}
          </h1>
          {description && (
            <p className="text-xs md:text-sm text-stainless-silver mt-1 truncate">{description}</p>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-6">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stainless-silver/50" />
            <Input
              placeholder="Buscar..."
              className="w-80 pl-9 bg-white/70 dark:bg-[#16161A]/80 border border-luxe-gold/20 dark:border-luxe-gold/30 text-midnight-blue dark:text-white placeholder:text-stainless-silver/40 focus:border-luxe-gold focus:ring-luxe-gold/20 transition-all shadow-sm"
            />
          </div>

          {/* Notifications */}
          <NotificationsMenu />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-lg border transition-all duration-300 ${
              isDark
                ? 'bg-[#18181C] hover:bg-[#222226] text-luxe-gold border-luxe-gold/30 shadow-md shadow-black/20'
                : 'bg-luxe-gold/10 hover:bg-luxe-gold/20 text-luxe-gold border-luxe-gold/20'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-luxe-gold/5 dark:hover:bg-luxe-gold/10 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-luxe-gold/20 to-luxe-gold/10 flex items-center justify-center border border-luxe-gold/30 group-hover:border-luxe-gold/50 transition-all">
                  <User className="w-5 h-5 text-luxe-gold" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-midnight-blue dark:text-[#ECEAE5] leading-none">{user?.first_name}</p>
                  <p className="text-xs text-stainless-silver capitalize mt-1">{user?.role?.name}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#121215] border border-luxe-gold/20 dark:border-luxe-gold/30 shadow-lg">
              <DropdownMenuLabel className="text-luxe-gold font-semibold">Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-luxe-gold/10 dark:bg-luxe-gold/20" />
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/settings')}
                className="text-midnight-blue dark:text-[#ECEAE5] hover:text-luxe-gold dark:hover:text-soft-gold hover:bg-luxe-gold/5 dark:hover:bg-luxe-gold/10 cursor-pointer transition-all"
              >
                <Settings className="w-4 h-4 mr-3 text-luxe-gold" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-luxe-gold/10 dark:bg-luxe-gold/20" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-accent-rouge hover:text-white hover:bg-accent-rouge/10 dark:hover:bg-accent-rouge/20 cursor-pointer transition-all"
              >
                <LogOut className="w-4 h-4 mr-3 text-luxe-gold" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
