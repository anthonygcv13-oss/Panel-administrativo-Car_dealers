"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/admin/header'
import { useDataStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Car, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Clock
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const LIGHT_COLORS = ['#C9A961', '#8B1538', '#1A1F3D', '#B8B8B8', '#2D2D2D']
const DARK_COLORS = ['#C9A961', '#E11D48', '#9E9E9E', '#D4B978', '#2D2D2D']

export default function DashboardPage() {
  const { vehicles, customers, sales, quotes, payments, brands } = useDataStore()
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsDark(document.documentElement.classList.contains('dark'))
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS

  // Calculate stats
  const availableVehicles = vehicles.filter(v => v.status === 'available').length
  const totalSalesAmount = sales.reduce((acc, s) => acc + parseFloat(s.final_price as any || 0), 0)
  const paidSales = sales.filter(s => s.status === 'paid')
  const pendingQuotes = quotes.filter(q => q.status === 'pending').length
  const totalPayments = payments.reduce((acc, p) => acc + parseFloat(p.amount as any || 0), 0)

  // Monthly sales data (mock)
  const monthlySalesData = [
    { month: 'Ene', ventas: 15000, pagos: 12000 },
    { month: 'Feb', ventas: 22000, pagos: 18000 },
    { month: 'Mar', ventas: 18000, pagos: 20000 },
    { month: 'Abr', ventas: 35000, pagos: 30000 },
    { month: 'May', ventas: 28000, pagos: 25000 },
    { month: 'Jun', ventas: 42000, pagos: 38000 },
  ]

  // Sales by brand
  const salesByBrand = brands.map(brand => {
    const brandVehicles = vehicles.filter(v => v.id_brand === brand.id_brand)
    const brandSales = sales.filter(s => brandVehicles.some(v => v.id_vehicle === s.id_vehicle))
    return {
      name: brand.name,
      value: brandSales.length
    }
  }).filter(b => b.value > 0)

  // Vehicle status distribution
  const vehicleStatusData = [
    { name: 'Disponible', value: vehicles.filter(v => v.status === 'available').length },
    { name: 'Vendido', value: vehicles.filter(v => v.status === 'sold').length },
    { name: 'Mantenimiento', value: vehicles.filter(v => v.status === 'maintenance').length },
  ]

  // Recent sales
  const recentSales = sales.slice(0, 5).map(sale => {
    const vehicle = vehicles.find(v => v.id_vehicle === sale.id_vehicle)
    const customer = customers.find(c => c.id_customer === sale.id_customer)
    const brand = brands.find(b => b.id_brand === vehicle?.id_brand)
    return { ...sale, vehicle, customer, brand }
  })

  // Dynamic trend calculations
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-indexed

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
  const prevMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999)

  const isSameMonthYear = (dateStr: string | Date | null | undefined, year: number, month: number) => {
    if (!dateStr) return false
    const d = new Date(dateStr)
    return d.getFullYear() === year && d.getMonth() === month
  }

  // 1. Vehículos Disponibles Trend
  const availableNow = availableVehicles
  const availablePrev = vehicles.filter(v => {
    const purchDate = v.purchase_date ? new Date(v.purchase_date) : null
    if (!purchDate || purchDate > prevMonthEnd) return false
    if (v.status === 'available') return true
    if (v.status === 'sold') {
      const sale = sales.find(s => s.id_vehicle === v.id_vehicle)
      if (sale && sale.date && new Date(sale.date) > prevMonthEnd) {
        return true
      }
    }
    return false
  }).length

  const getTrend = (current: number, previous: number) => {
    if (previous === 0) {
      return { trend: current > 0 ? '+100%' : '0%', trendUp: true }
    }
    const pct = ((current - previous) / previous) * 100
    const trendUp = pct >= 0
    const sign = trendUp ? '+' : ''
    return {
      trend: `${sign}${Math.round(pct)}%`,
      trendUp
    }
  }

  const vehiclesTrend = getTrend(availableNow, availablePrev)

  // 2. Clientes Registrados Trend
  const getCustomerRegDate = (cId: number) => {
    const customerSales = sales.filter(s => s.id_customer === cId)
    const customerQuotes = quotes.filter(q => q.id_customer === cId)
    const dates = [
      ...customerSales.map(s => s.date ? new Date(s.date) : null),
      ...customerQuotes.map(q => q.date || q.created_at ? new Date((q.date || q.created_at) as string) : null)
    ].filter((d): d is Date => d !== null)

    if (dates.length > 0) {
      return new Date(Math.min(...dates.map(d => d.getTime())))
    }
    return new Date(2025, 0, 1) // default fallback
  }

  const customersNow = customers.length
  const customersPrev = customers.filter(c => {
    const regDate = getCustomerRegDate(c.id_customer)
    return regDate <= prevMonthEnd
  }).length
  const customersTrend = getTrend(customersNow, customersPrev)

  // 3. Ventas Totales Trend
  const salesCurrentMonth = sales
    .filter(s => isSameMonthYear(s.date, currentYear, currentMonth))
    .reduce((acc, s) => acc + parseFloat(s.final_price as any || 0), 0)
  const salesPrevMonth = sales
    .filter(s => isSameMonthYear(s.date, prevYear, prevMonth))
    .reduce((acc, s) => acc + parseFloat(s.final_price as any || 0), 0)
  const salesTrend = getTrend(salesCurrentMonth, salesPrevMonth)

  // 4. Cotizaciones Pendientes Trend
  const quotesCurrentMonth = quotes.filter(q => q.status === 'pending' && isSameMonthYear(q.date || q.created_at, currentYear, currentMonth)).length
  const quotesPrevMonth = quotes.filter(q => q.status === 'pending' && isSameMonthYear(q.date || q.created_at, prevYear, prevMonth)).length
  const quotesTrend = getTrend(quotesCurrentMonth, quotesPrevMonth)

  const stats = [
    {
      title: 'Vehículos Disponibles',
      value: availableVehicles,
      total: vehicles.length,
      icon: Car,
      trend: vehiclesTrend.trend,
      trendUp: vehiclesTrend.trendUp,
      color: 'bg-[#C9A961]'
    },
    {
      title: 'Clientes Registrados',
      value: customers.length,
      icon: Users,
      trend: customersTrend.trend,
      trendUp: customersTrend.trendUp,
      color: 'bg-[#1A1F3D]'
    },
    {
      title: 'Ventas Totales',
      value: `$${formatPrice(totalSalesAmount)}`,
      icon: ShoppingCart,
      trend: salesTrend.trend,
      trendUp: salesTrend.trendUp,
      color: 'bg-[#8B1538]'
    },
    {
      title: 'Cotizaciones Pendientes',
      value: pendingQuotes,
      icon: FileText,
      trend: quotesTrend.trend,
      trendUp: quotesTrend.trendUp,
      color: 'bg-[#B8B8B8]'
    },
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-light via-silver-light to-pure-white">
        <Header 
          title="Dashboard" 
          description="Bienvenido al panel de administración de CARLIZ"
        />
        <div className="p-8 space-y-8 animate-pulse">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card 
                key={i} 
                className="bg-white/80 dark:bg-transparent border border-luxe-gold/20 p-5 xl:p-6 rounded-xl min-h-[180px] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="h-4 bg-stainless-silver/20 dark:bg-stainless-silver/10 rounded w-2/3"></div>
                    <div className="w-10 h-10 bg-stainless-silver/20 dark:bg-stainless-silver/10 rounded-lg"></div>
                  </div>
                  <div className="h-8 bg-stainless-silver/30 dark:bg-stainless-silver/25 rounded w-1/2 mt-4"></div>
                </div>
                <div className="h-3 bg-stainless-silver/20 dark:bg-stainless-silver/10 rounded w-1/3 mt-4 border-t border-luxe-gold/10 pt-4"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-light via-silver-light to-pure-white">
      <Header 
        title="Dashboard" 
        description="Bienvenido al panel de administración de CARLIZ"
      />
      
      <div className="p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden bg-white/80 dark:bg-transparent premium-dark-card border border-luxe-gold/20 hover:border-luxe-gold/50 transition-all duration-300 group backdrop-blur-sm shadow-sm hover:shadow-lg shadow-black/40 dark:shadow-black/70 flex flex-col justify-between"
            >
              {/* Gradient background accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-luxe-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <CardContent className="p-5 xl:p-6 flex flex-col justify-between h-full min-h-[170px]">
                <div>
                  {/* Top Row: Title and Icon */}
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs xl:text-sm font-medium text-stainless-silver/80 tracking-wide uppercase truncate">{stat.title}</p>
                    <div className={`${stat.color} p-2.5 rounded-lg shadow-sm opacity-90 group-hover:opacity-100 transition-all flex-shrink-0`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  {/* Middle Row: Value */}
                  <div className="mt-3">
                    <p className="text-2xl xl:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-luxe-gold to-midnight-blue dark:to-white whitespace-nowrap overflow-hidden text-ellipsis">{stat.value}</p>
                    {stat.total && (
                      <p className="text-xs text-stainless-silver/60 mt-1">de {stat.total} total</p>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Trend */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-luxe-gold/10">
                  {stat.trendUp ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-accent-rouge" />
                  )}
                  <span className={`text-sm font-semibold ${stat.trendUp ? 'text-green-600' : 'text-accent-rouge'}`}>
                    {stat.trend}
                  </span>
                  <span className="text-xs text-stainless-silver/50">vs mes anterior</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart */}
          <Card className="lg:col-span-2 bg-white/80 dark:bg-transparent premium-dark-card border border-luxe-gold/20 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow shadow-black/40 dark:shadow-black/70">
            <CardHeader className="border-b border-luxe-gold/10 dark:border-luxe-gold/20 pb-4 bg-gradient-to-r from-cream-light to-white dark:from-[#18181C] dark:to-[#121215]">
              <CardTitle className="flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-luxe-gold to-midnight-blue dark:to-white text-xl">
                <DollarSign className="w-6 h-6 text-luxe-gold" />
                Resumen de Ventas
              </CardTitle>
              <CardDescription className="text-stainless-silver/70 dark:text-stainless-silver/60">Ventas y pagos de los últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlySalesData}>
                    <defs>
                      <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C9A961" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#C9A961" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPagos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isDark ? '#9E9E9E' : '#1A1F3D'} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={isDark ? '#9E9E9E' : '#1A1F3D'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#222226' : '#E8E5E0'} opacity={0.5} />
                    <XAxis dataKey="month" stroke="#9E9E9E" fontSize={12} />
                    <YAxis stroke="#9E9E9E" fontSize={12} tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#121215' : '#FFFFFF', 
                        border: isDark ? '2px solid #222226' : '2px solid #C9A961',
                        borderRadius: '12px',
                        color: isDark ? '#F5F5F7' : '#1A1A1A'
                      }}
                      formatter={(value: number) => [`$${formatPrice(value)}`, '']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="ventas" 
                      stroke="#C9A961" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorVentas)" 
                      name="Ventas"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pagos" 
                      stroke={isDark ? '#9E9E9E' : '#1A1F3D'} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorPagos)" 
                      name="Pagos"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Status Pie Chart */}
          <Card className="bg-white/80 dark:bg-transparent premium-dark-card border border-luxe-gold/20 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow shadow-black/40 dark:shadow-black/70">
            <CardHeader className="border-b border-luxe-gold/10 dark:border-luxe-gold/20 pb-4 bg-gradient-to-r from-cream-light to-white dark:from-[#18181C] dark:to-[#121215]">
              <CardTitle className="flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-luxe-gold to-midnight-blue dark:to-white text-xl">
                <Car className="w-6 h-6 text-luxe-gold" />
                Estado del Inventario
              </CardTitle>
              <CardDescription className="text-stainless-silver/70 dark:text-stainless-silver/60">Distribución de vehículos por estado</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {vehicles.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-[#C9A961]/10 flex items-center justify-center mb-3">
                    <Car className="w-6 h-6 text-[#C9A961]/70" />
                  </div>
                  <p className="text-sm font-medium text-stainless-silver/80 dark:text-stainless-silver/80">
                    Inventario vacío
                  </p>
                  <p className="text-xs text-stainless-silver/50 dark:text-stainless-silver/40 mt-1 max-w-[260px]">
                    No hay vehículos registrados en el sistema actualmente.
                  </p>
                </div>
              ) : (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={vehicleStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {vehicleStatusData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: isDark ? '#121215' : '#2D2D2D', 
                            border: isDark ? '2px solid #222226' : '2px solid #C9A961',
                            borderRadius: '12px',
                            color: isDark ? '#F5F5F7' : '#C9A961'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                    {vehicleStatusData.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sales */}
          <Card className="bg-white/80 dark:bg-transparent premium-dark-card border border-luxe-gold/20 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 shadow-black/40 dark:shadow-black/70">
            <CardHeader className="border-b border-luxe-gold/10 dark:border-luxe-gold/20 pb-4 bg-gradient-to-r from-cream-light to-white dark:from-[#18181C] dark:to-[#121215]">
              <CardTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-luxe-gold to-midnight-blue dark:to-white">
                <ShoppingCart className="w-5 h-5 text-[#C9A961]" />
                Ventas Recientes
              </CardTitle>
              <CardDescription className="text-stainless-silver/70 dark:text-stainless-silver/60">Últimas transacciones realizadas</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {recentSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#C9A961]/10 flex items-center justify-center mb-3">
                    <ShoppingCart className="w-6 h-6 text-[#C9A961]/70" />
                  </div>
                  <p className="text-sm font-medium text-stainless-silver/80 dark:text-stainless-silver/80">
                    No hay ventas recientes
                  </p>
                  <p className="text-xs text-stainless-silver/50 dark:text-stainless-silver/40 mt-1 max-w-[260px]">
                    Las últimas transacciones aparecerán aquí una vez que se registren nuevas ventas.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSales.map((sale) => (
                    <div key={sale.id_vehicle_sale} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#C9A961]/20 flex items-center justify-center">
                          <Car className="w-5 h-5 text-[#C9A961]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {sale.brand?.name} - {sale.vehicle?.color}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {sale.customer?.first_name} {sale.customer?.last_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#C9A961]">
                          ${formatPrice(sale.final_price)}
                        </p>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                          sale.status === 'paid' 
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' 
                            : sale.status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                        }`}>
                          {sale.status === 'paid' ? 'Pagado' : sale.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sales by Brand */}
          <Card className="bg-white/80 dark:bg-transparent premium-dark-card border border-luxe-gold/20 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 shadow-black/40 dark:shadow-black/70">
            <CardHeader className="border-b border-luxe-gold/10 dark:border-luxe-gold/20 pb-4 bg-gradient-to-r from-cream-light to-white dark:from-[#18181C] dark:to-[#121215]">
              <CardTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-luxe-gold to-midnight-blue dark:to-white">
                <TrendingUp className="w-5 h-5 text-[#C9A961]" />
                Ventas por Marca
              </CardTitle>
              <CardDescription className="text-stainless-silver/70 dark:text-stainless-silver/60">Distribución de ventas por fabricante</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                {salesByBrand.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-[#C9A961]/10 flex items-center justify-center mb-3">
                      <TrendingUp className="w-6 h-6 text-[#C9A961]/70" />
                    </div>
                    <p className="text-sm font-medium text-stainless-silver/80 dark:text-stainless-silver/80">
                      Sin datos de distribución
                    </p>
                    <p className="text-xs text-stainless-silver/50 dark:text-stainless-silver/40 mt-1 max-w-[260px]">
                      Registra ventas de vehículos para ver la distribución por fabricante en este gráfico.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesByBrand} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#222226' : '#E5E5E5'} />
                      <XAxis type="number" stroke="#6B6B6B" fontSize={12} />
                      <YAxis dataKey="name" type="category" stroke="#6B6B6B" fontSize={12} width={80} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? '#121215' : '#fff', 
                          border: isDark ? '1px solid #222226' : '1px solid #E5E5E5',
                          borderRadius: '8px',
                          color: isDark ? '#F5F5F7' : '#1A1A1A'
                        }}
                      />
                      <Bar dataKey="value" fill="#C9A961" radius={[0, 4, 4, 0]} name="Ventas" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
