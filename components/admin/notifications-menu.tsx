'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useDataStore } from '@/lib/store'

export function NotificationsMenu() {
  const {
    notifications,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
  } = useDataStore()

  useEffect(() => {
    fetchNotifications() // Cargar al montar
  }, [fetchNotifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-600" />
      case 'info':
        return <Info className="w-4 h-4 text-blue-600" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (isNaN(date.getTime())) return ''
    if (minutes < 60) return `Hace ${minutes}m`
    if (hours < 24) return `Hace ${hours}h`
    return date.toLocaleDateString()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-stainless-silver hover:text-luxe-gold hover:bg-luxe-gold/5 transition-all">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-gradient-to-br from-accent-rouge to-[#FF6B9D] rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 bg-white border border-luxe-gold/20 shadow-lg">
        <div className="flex items-center justify-between pr-2">
          <DropdownMenuLabel className="text-luxe-gold font-bold">Notificaciones</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button 
              onClick={(e) => {
                e.preventDefault()
                markAllNotificationsAsRead()
              }} 
              className="text-xs text-luxe-gold hover:underline cursor-pointer font-medium"
            >
              Marcar todo como leído
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-luxe-gold/10" />
        
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-stainless-silver">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay notificaciones</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id_notification}
                className={`p-3 border-b border-luxe-gold/10 hover:bg-cream-light/50 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-luxe-gold/5' : ''
                }`}
                onClick={() => {
                  if (!notification.read) {
                    markNotificationAsRead(notification.id_notification)
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-midnight-blue truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-stainless-silver/70 line-clamp-2 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-stainless-silver/50 mt-2">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(notification.id_notification)
                    }}
                    className="text-stainless-silver/40 hover:text-accent-rouge transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <DropdownMenuSeparator className="bg-luxe-gold/10" />
        <DropdownMenuItem className="text-center text-luxe-gold cursor-pointer hover:bg-luxe-gold/5 flex justify-center">
          Ver todas las notificaciones
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
