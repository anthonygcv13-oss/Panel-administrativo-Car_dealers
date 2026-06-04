"use client"

import { Header } from '@/components/admin/header'
import { useDataStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Car,
  Users,
  FileText,
  Download,
  Calendar
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
  Cell,
  Legend
} from 'recharts'

const COLORS = ['#C9A961', '#8B1538', '#1A1F3D', '#B8B8B8', '#2D2D2D']

export default function ReportsPage() {
  const { vehicles, customers, sales, payments, brands, quotes } = useDataStore()
  const [period, setPeriod] = useState('month')

  // Calculate statistics
  const totalRevenue = sales.reduce((acc, s) => acc + s.final_price, 0)
  const totalPayments = payments.reduce((acc, p) => acc + p.amount, 0)
  const averageSalePrice = sales.length > 0 ? totalRevenue / sales.length : 0

  // Monthly sales data
  const monthlySalesData = [
    { month: 'Ene', ventas: 2, ingresos: 24000 },
    { month: 'Feb', ventas: 3, ingresos: 35000 },
    { month: 'Mar', ventas: 1, ingresos: 12000 },
    { month: 'Abr', ventas: 4, ingresos: 52000 },
    { month: 'May', ventas: 5, ingresos: 79000 },
    { month: 'Jun', ventas: 2, ingresos: 28000 },
  ]

  // Sales by type
  const salesByType = [
    { name: 'Contado', value: sales.filter(s => s.sale_type === 'cash').length },
    { name: 'Financiado', value: sales.filter(s => s.sale_type === 'financed').length },
  ]

  // Payment methods distribution
  const paymentMethodsData = [
    { name: 'Efectivo', value: payments.filter(p => p.payment_method === 'cash').length },
    { name: 'Tarjeta', value: payments.filter(p => p.payment_method === 'card').length },
    { name: 'Transferencia', value: payments.filter(p => p.payment_method === 'transfer').length },
  ]

  // Vehicle status data
  const vehicleStatusData = [
    { name: 'Disponible', value: vehicles.filter(v => v.status === 'available').length },
    { name: 'Vendido', value: vehicles.filter(v => v.status === 'sold').length },
    { name: 'Mantenimiento', value: vehicles.filter(v => v.status === 'maintenance').length },
  ]

  // Sales by brand
  const salesByBrand = brands.map(brand => {
    const brandVehicles = vehicles.filter(v => v.id_brand === brand.id_brand)
    const brandSales = sales.filter(s => brandVehicles.some(v => v.id_vehicle === s.id_vehicle))
    const revenue = brandSales.reduce((acc, s) => acc + s.final_price, 0)
    return {
      name: brand.name,
      ventas: brandSales.length,
      ingresos: revenue
    }
  }).filter(b => b.ventas > 0)

  // Quote conversion rate
  const approvedQuotes = quotes.filter(q => q.status === 'approved').length
  const conversionRate = quotes.length > 0 ? ((approvedQuotes / quotes.length) * 100).toFixed(1) : 0

  const kpiCards = [
    { 
      title: 'Ingresos Totales', 
      value: `$${totalRevenue.toLocaleString()}`, 
      icon: DollarSign,
      color: 'bg-[#C9A961]/20 text-[#C9A961]',
      change: '+15%'
    },
    { 
      title: 'Total Ventas', 
      value: sales.length, 
      icon: BarChart3,
      color: 'bg-[#8B1538]/20 text-[#8B1538]',
      change: '+8%'
    },
    { 
      title: 'Precio Promedio', 
      value: `$${averageSalePrice.toLocaleString()}`, 
      icon: TrendingUp,
      color: 'bg-[#1A1F3D]/20 text-[#1A1F3D]',
      change: '+3%'
    },
    { 
      title: 'Tasa de Conversión', 
      value: `${conversionRate}%`, 
      icon: FileText,
      color: 'bg-green-100 text-green-600',
      change: '+5%'
    },
  ]

  return (
    <div className="min-h-screen">
      <Header 
        title="Reportes y Estadísticas" 
        description="Análisis detallado del rendimiento del negocio"
      />
      
      <div className="p-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-48">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mes</SelectItem>
                <SelectItem value="quarter">Este Trimestre</SelectItem>
                <SelectItem value="year">Este Año</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D]">
            <Download className="w-4 h-4 mr-2" />
            Exportar Reporte
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((kpi, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="text-3xl font-bold mt-1">{kpi.value}</p>
                    <p className="text-sm text-green-600 mt-1">{kpi.change} vs periodo anterior</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${kpi.color} flex items-center justify-center`}>
                    <kpi.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#C9A961]" />
                Tendencia de Ingresos
              </CardTitle>
              <CardDescription>Ingresos mensuales por ventas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlySalesData}>
                    <defs>
                      <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C9A961" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#C9A961" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis dataKey="month" stroke="#6B6B6B" fontSize={12} />
                    <YAxis stroke="#6B6B6B" fontSize={12} tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #E5E5E5',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="ingresos" 
                      stroke="#C9A961" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorIngresos)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sales by Brand */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5 text-[#C9A961]" />
                Ventas por Marca
              </CardTitle>
              <CardDescription>Distribución de ventas e ingresos por marca</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByBrand}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis dataKey="name" stroke="#6B6B6B" fontSize={12} />
                    <YAxis stroke="#6B6B6B" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #E5E5E5',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="ventas" fill="#C9A961" name="Ventas" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sales by Type */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Tipo de Venta</CardTitle>
              <CardDescription>Contado vs Financiado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {salesByType.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4">
                {salesByType.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Métodos de Pago</CardTitle>
              <CardDescription>Distribución por método</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {paymentMethodsData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-3">
                {paymentMethodsData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Inventory */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Estado del Inventario</CardTitle>
              <CardDescription>Vehículos por estado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {vehicleStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-3">
                {vehicleStatusData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Car className="w-4 h-4 text-[#C9A961]" />
                Resumen de Inventario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Vehículos</span>
                  <span className="font-medium">{vehicles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Disponibles</span>
                  <span className="font-medium text-green-600">{vehicles.filter(v => v.status === 'available').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor del Inventario</span>
                  <span className="font-medium text-[#C9A961]">
                    ${vehicles.filter(v => v.status === 'available').reduce((acc, v) => acc + v.sale_price, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4 text-[#C9A961]" />
                Resumen de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Clientes</span>
                  <span className="font-medium">{customers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clientes Nuevos (Mes)</span>
                  <span className="font-medium text-green-600">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clientes con Compras</span>
                  <span className="font-medium">{new Set(sales.map(s => s.id_customer)).size}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4 text-[#C9A961]" />
                Resumen de Cotizaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Cotizaciones</span>
                  <span className="font-medium">{quotes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pendientes</span>
                  <span className="font-medium text-yellow-600">{quotes.filter(q => q.status === 'pending').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tasa de Éxito</span>
                  <span className="font-medium text-green-600">{conversionRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
