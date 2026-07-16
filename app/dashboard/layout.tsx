"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, useDataStore } from '@/lib/store'
import { Sidebar } from '@/components/admin/sidebar'
import { io } from 'socket.io-client'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isHydrated, sidebarCollapsed, token } = useAuthStore()
  const { fetchInitialData, addLocalNotification } = useDataStore()

  useEffect(() => {
    if (!isHydrated) return

    if (!isAuthenticated) {
      router.push('/')
    } else {
      fetchInitialData()

      // Configurar conexión del WebSocket
      const socketUrl = process.env.NEXT_PUBLIC_API_URL 
        ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
        : 'http://localhost:3000'

      const socket = io(socketUrl, {
        auth: { token }
      })

      socket.on('connect', () => {
        console.log('🔌 Conectado a la red de WebSockets del servidor')
      })

      // Escuchar nuevas notificaciones
      socket.on('notification:created', (newNotification) => {
        addLocalNotification(newNotification)
        
        // Mostrar alerta visual instantánea en la interfaz
        toast(newNotification.title, {
          description: newNotification.message,
        })
      })

      socket.on('disconnect', () => {
        console.log('❌ Desconectado de WebSockets')
      })

      // Limpiar al desmontar o cuando cambie la autenticación
      return () => {
        socket.disconnect()
      }
    }
  }, [isAuthenticated, isHydrated, fetchInitialData, router, addLocalNotification, token])

  if (!isHydrated || !isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-light via-silver-light to-pure-white dark:from-[#09090B] dark:via-[#0C0C0E] dark:to-[#09090B] text-foreground transition-colors duration-300">
      <Sidebar />
      <main className={`${sidebarCollapsed ? 'ml-20' : 'ml-72'} transition-all duration-300`}>
        {children}
      </main>
      <Toaster />
    </div>
  )
}
