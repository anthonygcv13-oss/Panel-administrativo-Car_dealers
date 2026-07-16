"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Car,
  Users,
  ShoppingCart,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  Tag,
  Truck,
  BarChart3,
  UserCog,
  Percent
} from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Car, label: 'Inventario', href: '/dashboard/vehicles' },
  { icon: ShoppingCart, label: 'Ventas', href: '/dashboard/sales' },
  { icon: CreditCard, label: 'Facturación', href: '/dashboard/payments' },
  { icon: Users, label: 'Directorio', href: '/dashboard/customers' },
  { icon: Settings, label: 'Configuración', href: '/dashboard/settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, sidebarCollapsed, setSidebarCollapsed } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-silver-light via-cream-light to-pure-white dark:from-[#121215] dark:via-[#09090B] dark:to-[#0C0C0E] border-r border-luxe-gold/20 dark:border-luxe-gold/10 transition-all duration-300 flex flex-col shadow-lg print:hidden",
      sidebarCollapsed ? "-translate-x-full md:translate-x-0 w-20" : "translate-x-0 w-72"
    )}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-luxe-gold via-soft-gold to-luxe-gold" />

      <div className="flex items-center justify-between p-4 border-b border-luxe-gold/15 dark:border-luxe-gold/10 mt-1">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white border-2 border-luxe-gold flex items-center justify-center p-1 shadow-md">
              <img src="/carliz-logo.png" alt="CARLIZ" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-luxe-gold to-midnight-blue dark:to-[#F5F5F7] tracking-wider" style={{ fontFamily: 'var(--font-playfair)' }}>
                CARLIZ
              </div>
              <div className="text-xs text-luxe-gold/70 tracking-widest font-medium">ADMIN</div>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-11 h-11 mx-auto rounded-full bg-white border-2 border-luxe-gold flex items-center justify-center p-1 shadow-md">
            <img src="/carliz-logo.png" alt="CARLIZ" className="w-6 h-6 object-contain" />
          </div>
        )}
      </div>

      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-gradient-to-br from-luxe-gold to-soft-gold text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-50"
      >
        {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative",
                    isActive
                      ? "bg-gradient-to-r from-luxe-gold/20 to-luxe-gold/10 dark:from-luxe-gold/25 dark:to-luxe-gold/15 text-midnight-blue dark:text-white border-l-2 border-luxe-gold shadow-sm sidebar-active-link"
                      : "text-stainless-silver hover:bg-luxe-gold/5 hover:text-midnight-blue dark:hover:text-[#ECEAE5] hover:translate-x-1"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 shrink-0 transition-all", isActive ? "text-luxe-gold" : "group-hover:text-luxe-gold")} />
                  {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  {isActive && !sidebarCollapsed && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-luxe-gold to-soft-gold shadow-md" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-luxe-gold/15 dark:border-luxe-gold/10 bg-gradient-to-t from-white/50 dark:from-transparent to-transparent">
        {!sidebarCollapsed && user && (
          <div className="mb-4 px-3 py-3 rounded-lg bg-luxe-gold/8 dark:bg-luxe-gold/10 border border-luxe-gold/20 dark:border-luxe-gold/30">
            <p className="text-sm font-semibold text-midnight-blue dark:text-[#ECEAE5] truncate">{user.first_name}</p>
            <p className="text-xs text-stainless-silver truncate mt-1">{user.role?.name || 'Usuario'}</p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full text-stainless-silver hover:text-accent-rouge hover:bg-accent-rouge/5 transition-all",
            sidebarCollapsed ? "px-0 justify-center" : "justify-start"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!sidebarCollapsed && <span className="ml-3 text-sm">Cerrar Sesión</span>}
        </Button>
      </div>
    </aside>
  )
}
