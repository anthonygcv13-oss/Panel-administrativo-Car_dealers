"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, useDataStore } from '@/lib/store'
import { Sidebar } from '@/components/admin/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { fetchInitialData } = useDataStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    } else {
      fetchInitialData()
    }
  }, [isAuthenticated, fetchInitialData, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-light via-silver-light to-pure-white">
      <Sidebar />
      <main className="ml-72 transition-all duration-300">
        {children}
      </main>
    </div>
  )
}
