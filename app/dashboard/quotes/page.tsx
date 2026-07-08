"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/admin/header'
import { useDataStore, Quote, QuoteStatus } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
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
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
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

export default function QuotesPage({ hideHeader = false }: { hideHeader?: boolean } = {}) {
  const { quotes, vehicles, customers, brands, models, addQuote, updateQuote } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString(),
    estimated_price: 0,
    validity_date: '',
    status: 'pending' as QuoteStatus,
    id_vehicle: 0,
    id_customer: 0,
  })

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const availableVehicles = vehicles.filter(v => v.status === 'available')

  const filteredQuotes = quotes.filter(quote => {
    const customer = customers.find(c => c.id_customer === quote.id_customer)
    const vehicle = vehicles.find(v => v.id_vehicle === quote.id_vehicle)
    const brand = brands.find(b => b.id_brand === vehicle?.id_brand)
    const matchesSearch = 
      customer?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage)
  const paginatedQuotes = filteredQuotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const pendingQuotes = quotes.filter(q => q.status === 'pending').length
  const approvedQuotes = quotes.filter(q => q.status === 'approved').length
  const rejectedQuotes = quotes.filter(q => q.status === 'rejected').length
  const expiredQuotes = quotes.filter(q => q.status === 'expired').length

  const handleOpenDialog = (quote?: Quote) => {
    if (quote) {
      setEditingQuote(quote)
      setFormData({
        date: quote.date,
        estimated_price: quote.estimated_price,
        validity_date: quote.validity_date,
        status: quote.status,
        id_vehicle: quote.id_vehicle,
        id_customer: quote.id_customer,
      })
    } else {
      setEditingQuote(null)
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      setFormData({
        date: new Date().toISOString(),
        estimated_price: 0,
        validity_date: nextWeek.toISOString().split('T')[0],
        status: 'pending',
        id_vehicle: 0,
        id_customer: 0,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingQuote) {
      updateQuote(editingQuote.id_quote, formData)
    } else {
      addQuote(formData)
    }
    setIsDialogOpen(false)
  }

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id_vehicle === parseInt(vehicleId))
    if (vehicle) {
      setFormData({ 
        ...formData, 
        id_vehicle: vehicle.id_vehicle,
        estimated_price: vehicle.sale_price 
      })
    }
  }

  const getStatusBadge = (status: QuoteStatus) => {
    const styles = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800',
      approved: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800',
      rejected: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800',
      expired: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
    }
    const labels = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      rejected: 'Rechazada',
      expired: 'Expirada',
    }
    return (
      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  return (
    <div className={hideHeader ? "" : "min-h-screen"}>
      {!hideHeader && (
        <Header 
          title="Gestión de Cotizaciones" 
          description="Administra las cotizaciones de vehículos"
        />
      )}
      
      <div className={hideHeader ? "space-y-6" : "p-6 space-y-6"}>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center dark:bg-yellow-950/20">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{pendingQuotes}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center dark:bg-green-950/20">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aprobadas</p>
                <p className="text-2xl font-bold">{approvedQuotes}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center dark:bg-red-950/20">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rechazadas</p>
                <p className="text-2xl font-bold">{rejectedQuotes}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center dark:bg-zinc-800">
                <AlertCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiradas</p>
                <p className="text-2xl font-bold">{expiredQuotes}</p>
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
                    placeholder="Buscar por cliente o vehículo..."
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
                    <SelectItem value="approved">Aprobada</SelectItem>
                    <SelectItem value="rejected">Rechazada</SelectItem>
                    <SelectItem value="expired">Expirada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => handleOpenDialog()} className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] w-full md:w-auto font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cotización
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quotes Card Grid */}
        {paginatedQuotes.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-lg font-medium">No se encontraron cotizaciones</p>
              <p className="text-sm">Intenta buscar con otros términos.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedQuotes.map((quote) => {
                const customer = customers.find(c => c.id_customer === quote.id_customer)
                const vehicle = vehicles.find(v => v.id_vehicle === quote.id_vehicle)
                const brand = brands.find(b => b.id_brand === vehicle?.id_brand)
                const model = models.find(m => m.id_model === vehicle?.id_model)

                return (
                  <Card 
                    key={quote.id_quote} 
                    className="bg-white/80 dark:bg-[#121215]/80 border border-border/50 hover:border-[#C9A961]/50 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                  >
                    <CardContent className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-foreground">
                              Cotización #{quote.id_quote.toString().padStart(4, '0')}
                            </span>
                            {getStatusBadge(quote.status)}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Emitida: {new Date(quote.date).toLocaleDateString('es-ES')}</span>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => handleOpenDialog(quote)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>

                            {quote.status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => updateQuote(quote.id_quote, { status: 'approved' })}>
                                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                  Aprobar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateQuote(quote.id_quote, { status: 'rejected' })}>
                                  <XCircle className="w-4 h-4 mr-2 text-red-600" />
                                  Rechazar
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 pt-2.5 border-t border-border/40 text-sm">
                        <div className="flex items-start gap-2.5 text-muted-foreground">
                          <User className="w-4 h-4 text-[#C9A961] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-foreground leading-tight">
                              {customer ? `${customer.first_name} ${customer.last_name}` : 'Cliente Desconocido'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{customer?.email}</p>
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

                      {/* Estimation and validity */}
                      <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          <span className="block uppercase tracking-wider font-semibold">Precio Estimado</span>
                          <span className="text-lg font-bold text-[#C9A961]">
                            ${formatPrice(quote.estimated_price)}
                          </span>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <span className="block font-medium">Validez</span>
                          <span className="text-foreground font-semibold">
                            {new Date(quote.validity_date).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>

                      {/* Botones de Aceptar / Rechazar para cotizaciones pendientes */}
                      {quote.status === 'pending' && (
                        <div className="pt-3 border-t border-border/40 flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20"
                            onClick={() => updateQuote(quote.id_quote, { status: 'rejected' })}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Rechazar
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center"
                            onClick={() => updateQuote(quote.id_quote, { status: 'approved' })}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Aceptar
                          </Button>
                        </div>
                      )}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingQuote ? 'Editar Cotización' : 'Nueva Cotización'}
            </DialogTitle>
            <DialogDescription>
              {editingQuote ? 'Modifica los datos de la cotización' : 'Completa los datos para crear una nueva cotización'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
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
                <Label htmlFor="estimated_price">Precio Estimado ($)</Label>
                <Input
                  id="estimated_price"
                  type="number"
                  value={formData.estimated_price}
                  onChange={(e) => setFormData({ ...formData, estimated_price: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validity_date">Fecha de Validez</Label>
                <Input
                  id="validity_date"
                  type="date"
                  value={formData.validity_date}
                  onChange={(e) => setFormData({ ...formData, validity_date: e.target.value })}
                  required
                />
              </div>
              {editingQuote && (
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(v) => setFormData({ ...formData, status: v as QuoteStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="approved">Aprobada</SelectItem>
                      <SelectItem value="rejected">Rechazada</SelectItem>
                      <SelectItem value="expired">Expirada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D]">
                {editingQuote ? 'Guardar Cambios' : 'Crear Cotización'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
