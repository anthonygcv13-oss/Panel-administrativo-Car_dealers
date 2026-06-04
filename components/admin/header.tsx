"use client"

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
import { Bell, Search, User, Settings, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { NotificationsMenu } from './notifications-menu'

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-cream-light via-silver-light to-cream-light backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 border-b border-luxe-gold/20 shadow-sm">
      <div className="flex items-center justify-between h-16 px-8">
        {/* Title section */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-luxe-gold to-midnight-blue" style={{ fontFamily: 'var(--font-playfair)' }}>
            {title}
          </h1>
          {description && (
            <p className="text-sm text-stainless-silver mt-1">{description}</p>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-6">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stainless-silver/50" />
            <Input
              placeholder="Buscar..."
              className="w-80 pl-9 bg-white/70 border border-luxe-gold/20 text-midnight-blue placeholder:text-stainless-silver/40 focus:border-luxe-gold focus:ring-luxe-gold/20 transition-all shadow-sm"
            />
          </div>

          {/* Notifications */}
          <NotificationsMenu />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-luxe-gold/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-luxe-gold/20 to-luxe-gold/10 flex items-center justify-center border border-luxe-gold/30 group-hover:border-luxe-gold/50 transition-all">
                  <User className="w-5 h-5 text-luxe-gold" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-midnight-blue leading-none">{user?.first_name}</p>
                  <p className="text-xs text-stainless-silver capitalize mt-1">{user?.role?.name}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-luxe-gold/20 shadow-lg">
              <DropdownMenuLabel className="text-luxe-gold font-semibold">Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-luxe-gold/10" />
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/settings')}
                className="text-midnight-blue hover:text-luxe-gold hover:bg-luxe-gold/5 cursor-pointer transition-all"
              >
                <Settings className="w-4 h-4 mr-3 text-luxe-gold" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-luxe-gold/10" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-accent-rouge hover:text-white hover:bg-accent-rouge/10 cursor-pointer transition-all"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
