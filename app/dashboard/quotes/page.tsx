"use client"

import { useState } from 'react'
import { Header } from '@/components/admin/header'
import { useDataStore, Quote, QuoteStatus } from '@/lib/store'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  AlertCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function QuotesPage() {
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
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      expired: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    const labels = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      rejected: 'Rechazada',
      expired: 'Expirada',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Gestión de Cotizaciones" 
        description="Administra las cotizaciones de vehículos"
      />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{pendingQuotes}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aprobadas</p>
                <p className="text-2xl font-bold">{approvedQuotes}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rechazadas</p>
                <p className="text-2xl font-bold">{rejectedQuotes}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-gray-600" />
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
              <Button onClick={() => handleOpenDialog()} className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cotización
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Precio Estimado</TableHead>
                  <TableHead>Validez</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No se encontraron cotizaciones
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuotes.map(quote => {
                    const customer = customers.find(c => c.id_customer === quote.id_customer)
                    const vehicle = vehicles.find(v => v.id_vehicle === quote.id_vehicle)
                    const brand = brands.find(b => b.id_brand === vehicle?.id_brand)
                    const model = models.find(m => m.id_model === vehicle?.id_model)
                    return (
                      <TableRow key={quote.id_quote} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#C9A961]" />
                            <span className="font-mono">#{quote.id_quote.toString().padStart(4, '0')}</span>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(quote.date).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{customer?.first_name} {customer?.last_name}</p>
                            <p className="text-sm text-muted-foreground">{customer?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{brand?.name} {model?.name}</p>
                            <p className="text-sm text-muted-foreground font-mono">{vehicle?.license_plate}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-[#C9A961]">
                          ${quote.estimated_price.toLocaleString()}
                        </TableCell>
                        <TableCell>{new Date(quote.validity_date).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>{getStatusBadge(quote.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
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
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
