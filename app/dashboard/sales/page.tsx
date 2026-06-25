"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/admin/header'
import { useDataStore, VehicleSale, SaleStatus, SaleType } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Plus, 
  Search, 
  Pencil, 
  MoreHorizontal, 
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  Eye,
  Calendar,
  User,
  Car
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdminPagination } from '@/components/admin/pagination'

export default function SalesPage() {
  const { sales, vehicles, customers, users, brands, models, financingPlans, addSale, updateSale } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<VehicleSale | null>(null)
  const [viewingSale, setViewingSale] = useState<VehicleSale | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    final_price: 0,
    sale_type: 'cash' as SaleType,
    status: 'pending' as SaleStatus,
    id_user: 0,
    id_customer: 0,
    id_vehicle: 0,
    id_financing_plan: undefined as number | undefined,
  })

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const availableVehicles = vehicles.filter(v => v.status === 'available')

  const filteredSales = sales.filter(sale => {
    const customer = customers.find(c => c.id_customer === sale.id_customer)
    const vehicle = vehicles.find(v => v.id_vehicle === sale.id_vehicle)
    const brand = brands.find(b => b.id_brand === vehicle?.id_brand)
    const matchesSearch = 
      customer?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.license_plate.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage)
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalSales = sales.reduce((acc, s) => acc + s.final_price, 0)
  const paidSales = sales.filter(s => s.status === 'paid')
  const pendingSales = sales.filter(s => s.status === 'pending')

  const handleOpenDialog = (sale?: VehicleSale) => {
    if (sale) {
      setEditingSale(sale)
      setFormData({
        date: sale.date.split('T')[0],
        final_price: sale.final_price,
        sale_type: sale.sale_type,
        status: sale.status,
        id_user: sale.id_user,
        id_customer: sale.id_customer,
        id_vehicle: sale.id_vehicle,
        id_financing_plan: sale.id_financing_plan,
      })
    } else {
      setEditingSale(null)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        final_price: 0,
        sale_type: 'cash',
        status: 'pending',
        id_user: users[0]?.id_user || 0,
        id_customer: 0,
        id_vehicle: 0,
        id_financing_plan: undefined,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingSale) {
      updateSale(editingSale.id_vehicle_sale, formData)
    } else {
      addSale(formData)
    }
    setIsDialogOpen(false)
  }

  const handleView = (sale: VehicleSale) => {
    setViewingSale(sale)
    setIsViewDialogOpen(true)
  }

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id_vehicle === parseInt(vehicleId))
    if (vehicle) {
      setFormData({ 
        ...formData, 
        id_vehicle: vehicle.id_vehicle,
        final_price: vehicle.sale_price 
      })
    }
  }

  const getStatusBadge = (status: SaleStatus) => {
    const styles = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800',
      paid: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800',
      cancelled: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800',
    }
    const labels = {
      pending: 'Pendiente',
      paid: 'Completado',
      cancelled: 'Cancelado',
    }
    return (
      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Gestión de Ventas" 
        description="Administra las ventas de vehículos"
      />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#C9A961]/20 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-[#C9A961]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Ventas</p>
                <p className="text-2xl font-bold">{sales.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center dark:bg-green-950/20">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                <p className="text-2xl font-bold">${totalSales.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#8B1538]/20 flex items-center justify-center border border-[#8B1538]/10">
                <CheckCircle className="w-6 h-6 text-[#8B1538] dark:text-[#C9A961]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pagadas</p>
                <p className="text-2xl font-bold">{paidSales.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center dark:bg-yellow-950/20">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{pendingSales.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por cliente, vehículo o placa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="paid">Pagado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => handleOpenDialog()} className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] w-full md:w-auto font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Venta
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sales Card Grid */}
        {paginatedSales.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-lg font-medium">No se encontraron ventas</p>
              <p className="text-sm">Intenta buscar con otros términos.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedSales.map((sale) => {
                const customer = customers.find(c => c.id_customer === sale.id_customer)
                const vehicle = vehicles.find(v => v.id_vehicle === sale.id_vehicle)
                const brand = brands.find(b => b.id_brand === vehicle?.id_brand)
                const model = models.find(m => m.id_model === vehicle?.id_model)

                return (
                  <Card 
                    key={sale.id_vehicle_sale} 
                    className="bg-white/80 dark:bg-[#121215]/80 border border-border/50 hover:border-[#C9A961]/50 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                  >
                    <CardContent className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-foreground">
                              Venta #{sale.id_vehicle_sale.toString().padStart(4, '0')}
                            </span>
                            {getStatusBadge(sale.status)}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(sale.date).toLocaleDateString('es-ES')}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                            sale.sale_type === 'cash' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800' 
                              : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800'
                          }`}>
                            {sale.sale_type === 'cash' ? 'Contado' : 'Financiado'}
                          </span>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => handleView(sale)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenDialog(sale)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 pt-2.5 border-t border-border/40 text-sm">
                        <div className="flex items-start gap-2.5 text-muted-foreground">
                          <User className="w-4 h-4 text-[#C9A961] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-foreground leading-tight">
                              {customer ? `${customer.first_name} ${customer.last_name}` : 'Cliente Desconocido'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{customer?.document}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 text-muted-foreground">
                          <Car className="w-4 h-4 text-[#C9A961] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground leading-tight">
                              {brand ? `${brand.name} ${model?.name || ''}` : 'Vehículo'}
                            </p>
                            <p className="text-xs font-mono text-muted-foreground mt-0.5">{vehicle?.license_plate || 'Sin Placa'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Sale amount */}
                      <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Precio Final</span>
                        <span className="text-xl font-bold text-[#C9A961]">
                          ${sale.final_price.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Pagination */}
            <Card className="border-border/50 bg-white/40 dark:bg-[#121215]/40 backdrop-blur-sm">
              <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </Card>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingSale ? 'Editar Venta' : 'Nueva Venta'}
            </DialogTitle>
            <DialogDescription>
              {editingSale ? 'Modifica los datos de la venta' : 'Completa los datos para registrar una nueva venta'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_customer">Cliente</Label>
                <Select 
                  value={formData.id_customer.toString()} 
                  onValueChange={(v) => setFormData({ ...formData, id_customer: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id_customer} value={customer.id_customer.toString()}>
                        {customer.first_name} {customer.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_vehicle">Vehículo</Label>
                <Select 
                  value={formData.id_vehicle.toString()} 
                  onValueChange={handleVehicleSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map(vehicle => {
                      const brand = brands.find(b => b.id_brand === vehicle.id_brand)
                      const model = models.find(m => m.id_model === vehicle.id_model)
                      return (
                        <SelectItem key={vehicle.id_vehicle} value={vehicle.id_vehicle.toString()}>
                          {brand?.name} {model?.name} - {vehicle.license_plate}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale_type">Tipo de Venta</Label>
                <Select 
                  value={formData.sale_type} 
                  onValueChange={(v) => setFormData({ ...formData, sale_type: v as SaleType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Contado</SelectItem>
                    <SelectItem value="financed">Financiado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.sale_type === 'financed' && (
                <div className="space-y-2">
                  <Label htmlFor="id_financing_plan">Plan de Financiamiento</Label>
                  <Select 
                    value={formData.id_financing_plan?.toString() || ''} 
                    onValueChange={(v) => setFormData({ ...formData, id_financing_plan: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {financingPlans.map(plan => (
                        <SelectItem key={plan.id_financing_plan} value={plan.id_financing_plan.toString()}>
                          {plan.name} - {plan.interest_rate}% ({plan.number_installments} cuotas)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="final_price">Precio Final ($)</Label>
                <Input
                  id="final_price"
                  type="number"
                  value={formData.final_price}
                  onChange={(e) => setFormData({ ...formData, final_price: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData({ ...formData, status: v as SaleStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="paid">Pagado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D]">
                {editingSale ? 'Guardar Cambios' : 'Registrar Venta'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de la Venta</DialogTitle>
          </DialogHeader>
          {viewingSale && (() => {
            const customer = customers.find(c => c.id_customer === viewingSale.id_customer)
            const vehicle = vehicles.find(v => v.id_vehicle === viewingSale.id_vehicle)
            const brand = brands.find(b => b.id_brand === vehicle?.id_brand)
            const model = models.find(m => m.id_model === vehicle?.id_model)
            const user = users.find(u => u.id_user === viewingSale.id_user)
            const financingPlan = financingPlans.find(p => p.id_financing_plan === viewingSale.id_financing_plan)
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ID Venta</p>
                    <p className="font-mono font-medium">#{viewingSale.id_vehicle_sale.toString().padStart(4, '0')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    {getStatusBadge(viewingSale.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium">{new Date(viewingSale.date).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium">{viewingSale.sale_type === 'cash' ? 'Contado' : 'Financiado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">{customer?.first_name} {customer?.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vendedor</p>
                    <p className="font-medium">{user?.first_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vehículo</p>
                    <p className="font-medium">{brand?.name} {model?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Placa</p>
                    <p className="font-mono">{vehicle?.license_plate}</p>
                  </div>
                  {financingPlan && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Plan de Financiamiento</p>
                      <p className="font-medium">{financingPlan.name} - {financingPlan.number_installments} cuotas al {financingPlan.interest_rate}%</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Precio Final</p>
                    <p className="text-2xl font-bold text-[#C9A961]">${viewingSale.final_price.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
