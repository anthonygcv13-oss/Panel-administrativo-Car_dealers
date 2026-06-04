"use client"

import { Header } from '@/components/admin/header'
import { useDataStore } from '@/lib/store'
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

const COLORS = ['#C9A961', '#8B1538', '#1A1F3D', '#B8B8B8', '#2D2D2D']

export default function DashboardPage() {
  const { vehicles, customers, sales, quotes, payments, brands } = useDataStore()

  // Calculate stats
  const availableVehicles = vehicles.filter(v => v.status === 'available').length
  const totalSalesAmount = sales.reduce((acc, s) => acc + s.final_price, 0)
  const paidSales = sales.filter(s => s.status === 'paid')
  const pendingQuotes = quotes.filter(q => q.status === 'pending').length
  const totalPayments = payments.reduce((acc, p) => acc + p.amount, 0)

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

  const stats = [
    {
      title: 'Vehículos Disponibles',
      value: availableVehicles,
      total: vehicles.length,
      icon: Car,
      trend: '+12%',
      trendUp: true,
      color: 'bg-[#C9A961]'
    },
    {
      title: 'Clientes Registrados',
      value: customers.length,
      icon: Users,
      trend: '+8%',
      trendUp: true,
      color: 'bg-[#1A1F3D]'
    },
    {
      title: 'Ventas Totales',
      value: `$${totalSalesAmount.toLocaleString()}`,
      icon: ShoppingCart,
      trend: '+23%',
      trendUp: true,
      color: 'bg-[#8B1538]'
    },
    {
      title: 'Cotizaciones Pendientes',
      value: pendingQuotes,
      icon: FileText,
      trend: '-5%',
      trendUp: false,
      color: 'bg-[#B8B8B8]'
    },
  ]

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
              className="relative overflow-hidden bg-white/80 border border-luxe-gold/20 hover:border-luxe-gold/50 transition-all duration-300 group backdrop-blur-sm shadow-sm hover:shadow-lg"
            >
              {/* Gradient background accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-luxe-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stainless-silver/80 tracking-wide uppercase">{stat.title}</p>
                    <p className="text-4xl font-bold mt-3 text-transparent bg-clip-text bg-gradient-to-r from-luxe-gold to-midnight-blue">{stat.value}</p>
                    {stat.total && (
                      <p className="text-xs text-stainless-silver/60 mt-2">de {stat.total} total</p>
                    )}
                  </div>
                  <div className={`${stat.color} p-4 rounded-xl shadow-sm opacity-90 group-hover:opacity-100 transition-all`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-luxe-gold/10">
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
          <Card className="lg:col-span-2 bg-white/80 border border-luxe-gold/20 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-luxe-gold/10 pb-4 bg-gradient-to-r from-cream-light to-white">
              <CardTitle className="flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-luxe-gold to-midnight-blue text-xl">
                <DollarSign className="w-6 h-6 text-luxe-gold" />
                Resumen de Ventas
              </CardTitle>
              <CardDescription className="text-stainless-silver/70">Ventas y pagos de los últimos 6 meses</CardDescription>
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
                        <stop offset="5%" stopColor="#1A1F3D" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#1A1F3D" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E5E0" opacity={0.5} />
                    <XAxis dataKey="month" stroke="#9E9E9E" fontSize={12} />
                    <YAxis stroke="#9E9E9E" fontSize={12} tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        border: '2px solid #C9A961',
                        borderRadius: '12px',
                        color: '#1A1A1A'
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
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
                      stroke="#1A1F3D" 
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
          <Card className="bg-white/80 border border-luxe-gold/20 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-luxe-gold/10 pb-4 bg-gradient-to-r from-cream-light to-white">
              <CardTitle className="flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-luxe-gold to-midnight-blue text-xl">
                <Car className="w-6 h-6 text-luxe-gold" />
                Estado del Inventario
              </CardTitle>
              <CardDescription className="text-stainless-silver/70">Distribución de vehículos por estado</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
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
                        backgroundColor: '#2D2D2D', 
                        border: '2px solid #C9A961',
                        borderRadius: '12px',
                        color: '#C9A961'
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
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sales */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#C9A961]" />
                Ventas Recientes
              </CardTitle>
              <CardDescription>Últimas transacciones realizadas</CardDescription>
            </CardHeader>
            <CardContent>
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
                        ${sale.final_price.toLocaleString()}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        sale.status === 'paid' 
                          ? 'bg-green-100 text-green-700' 
                          : sale.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {sale.status === 'paid' ? 'Pagado' : sale.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sales by Brand */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#C9A961]" />
                Ventas por Marca
              </CardTitle>
              <CardDescription>Distribución de ventas por fabricante</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByBrand} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis type="number" stroke="#6B6B6B" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#6B6B6B" fontSize={12} width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #E5E5E5',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" fill="#C9A961" radius={[0, 4, 4, 0]} name="Ventas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#C9A961]" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => window.location.href = '/dashboard/vehicles'} 
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-[#C9A961]/10 transition-colors group cursor-pointer"
              >
                <Car className="w-8 h-8 text-muted-foreground group-hover:text-[#C9A961] transition-colors" />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Nuevo Vehículo</span>
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard/customers'} 
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-[#C9A961]/10 transition-colors group cursor-pointer"
              >
                <Users className="w-8 h-8 text-muted-foreground group-hover:text-[#C9A961] transition-colors" />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Nuevo Cliente</span>
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard/sales'} 
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-[#C9A961]/10 transition-colors group cursor-pointer"
              >
                <ShoppingCart className="w-8 h-8 text-muted-foreground group-hover:text-[#C9A961] transition-colors" />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Nueva Venta</span>
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard/quotes'} 
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-[#C9A961]/10 transition-colors group cursor-pointer"
              >
                <FileText className="w-8 h-8 text-muted-foreground group-hover:text-[#C9A961] transition-colors" />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Nueva Cotización</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
