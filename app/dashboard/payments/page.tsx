"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/admin/header'
import { useDataStore, Payment, SaleStatus, PaymentMethod } from '@/lib/store'
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
  CreditCard,
  DollarSign,
  Banknote,
  Building,
  Calendar,
  User,
  Car,
  FileText
} from 'lucide-react'
import { AdminPagination } from '@/components/admin/pagination'

export default function PaymentsPage() {
  const { payments, sales, customers, vehicles, brands, users, addPayment } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString(),
    amount: 0,
    payment_method: 'cash' as PaymentMethod,
    status: 'paid' as SaleStatus,
    id_user: 0,
    id_vehicle_sale: 0,
  })

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, methodFilter])

  const filteredPayments = payments.filter(payment => {
    const sale = sales.find(s => s.id_vehicle_sale === payment.id_vehicle_sale)
    const customer = customers.find(c => c.id_customer === sale?.id_customer)
    const matchesSearch = 
      customer?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMethod = methodFilter === 'all' || payment.payment_method === methodFilter
    return matchesSearch && matchesMethod
  })

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPayments = payments.reduce((acc, p) => acc + p.amount, 0)
  const cashPayments = payments.filter(p => p.payment_method === 'cash').reduce((acc, p) => acc + p.amount, 0)
  const cardPayments = payments.filter(p => p.payment_method === 'card').reduce((acc, p) => acc + p.amount, 0)
  const transferPayments = payments.filter(p => p.payment_method === 'transfer').reduce((acc, p) => acc + p.amount, 0)

  const handleOpenDialog = () => {
    setFormData({
      date: new Date().toISOString(),
      amount: 0,
      payment_method: 'cash',
      status: 'paid',
      id_user: users[0]?.id_user || 0,
      id_vehicle_sale: 0,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addPayment(formData)
    setIsDialogOpen(false)
  }

  const getMethodBadge = (method: PaymentMethod) => {
    const styles = {
      cash: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800',
      card: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800',
      transfer: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800',
    }
    const labels = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
    }
    const icons = {
      cash: <Banknote className="w-3.5 h-3.5" />,
      card: <CreditCard className="w-3.5 h-3.5" />,
      transfer: <Building className="w-3.5 h-3.5" />,
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[method]}`}>
        {icons[method]}
        {labels[method]}
      </span>
    )
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
        title="Gestión de Pagos" 
        description="Administra los pagos recibidos"
      />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#C9A961]/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#C9A961]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Recaudado</p>
                <p className="text-2xl font-bold">${totalPayments.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center dark:bg-green-950/20">
                <Banknote className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Efectivo</p>
                <p className="text-2xl font-bold">${cashPayments.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center dark:bg-blue-950/20">
                <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tarjeta</p>
                <p className="text-2xl font-bold">${cardPayments.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center dark:bg-purple-950/20">
                <Building className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transferencia</p>
                <p className="text-2xl font-bold">${transferPayments.toLocaleString()}</p>
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
                    placeholder="Buscar por cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los métodos</SelectItem>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleOpenDialog} className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] w-full md:w-auto font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Pago
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments Card Grid */}
        {paginatedPayments.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Banknote className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-lg font-medium">No se encontraron pagos</p>
              <p className="text-sm">Intenta buscar con otros términos.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPayments.map((payment) => {
                const sale = sales.find(s => s.id_vehicle_sale === payment.id_vehicle_sale)
                const customer = customers.find(c => c.id_customer === sale?.id_customer)
                const vehicle = vehicles.find(v => v.id_vehicle === sale?.id_vehicle)
                const brand = brands.find(b => b.id_brand === vehicle?.id_brand)
                const model = useDataStore.getState().models?.find(m => m.id_model === vehicle?.id_model)

                return (
                  <Card 
                    key={payment.id_payment} 
                    className="bg-white/80 dark:bg-[#121215]/80 border border-border/50 hover:border-[#C9A961]/50 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                  >
                    <CardContent className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-foreground">
                              Pago #{payment.id_payment.toString().padStart(4, '0')}
                            </span>
                            {getStatusBadge(payment.status)}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(payment.date).toLocaleDateString('es-ES')}</span>
                          </div>
                        </div>
                        {getMethodBadge(payment.payment_method)}
                      </div>

                      {/* Customer Details */}
                      <div className="space-y-1.5 pt-2 border-t border-border/40 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="w-4 h-4 text-[#C9A961] flex-shrink-0" />
                          <span className="font-medium text-foreground">
                            {customer ? `${customer.first_name} ${customer.last_name}` : 'Cliente Desconocido'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Car className="w-4 h-4 text-[#C9A961] flex-shrink-0" />
                          <span className="truncate">
                            {brand ? `${brand.name} ${model?.name || ''}` : 'Vehículo'} ({vehicle?.license_plate || 'Sin Placa'})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="w-4 h-4 text-[#C9A961] flex-shrink-0" />
                          <span className="font-mono text-xs">Venta #{payment.id_vehicle_sale}</span>
                        </div>
                      </div>

                      {/* Payment Amount */}
                      <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Monto Pagado</span>
                        <span className="text-xl font-bold text-[#C9A961]">
                          ${payment.amount.toLocaleString()}
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

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Pago</DialogTitle>
            <DialogDescription>
              Registra un nuevo pago para una venta
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="id_vehicle_sale">Venta</Label>
                <Select 
                  value={formData.id_vehicle_sale.toString()} 
                  onValueChange={(v) => setFormData({ ...formData, id_vehicle_sale: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar venta" />
                  </SelectTrigger>
                  <SelectContent>
                    {sales.filter(s => s.status !== 'cancelled').map(sale => {
                      const customer = customers.find(c => c.id_customer === sale.id_customer)
                      return (
                        <SelectItem key={sale.id_vehicle_sale} value={sale.id_vehicle_sale.toString()}>
                          Venta #{sale.id_vehicle_sale} - {customer?.first_name} {customer?.last_name} (${sale.final_price.toLocaleString()})
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Monto ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_method">Método de Pago</Label>
                <Select 
                  value={formData.payment_method} 
                  onValueChange={(v) => setFormData({ ...formData, payment_method: v as PaymentMethod })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D]">
                Registrar Pago
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
