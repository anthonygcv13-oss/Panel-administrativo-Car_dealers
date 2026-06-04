"use client"

import { useState } from 'react'
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
  CreditCard,
  DollarSign,
  Banknote,
  Building
} from 'lucide-react'

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

  const filteredPayments = payments.filter(payment => {
    const sale = sales.find(s => s.id_vehicle_sale === payment.id_vehicle_sale)
    const customer = customers.find(c => c.id_customer === sale?.id_customer)
    const matchesSearch = 
      customer?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMethod = methodFilter === 'all' || payment.payment_method === methodFilter
    return matchesSearch && matchesMethod
  })

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
      cash: 'bg-green-100 text-green-700 border-green-200',
      card: 'bg-blue-100 text-blue-700 border-blue-200',
      transfer: 'bg-purple-100 text-purple-700 border-purple-200',
    }
    const labels = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
    }
    const icons = {
      cash: <Banknote className="w-3 h-3" />,
      card: <CreditCard className="w-3 h-3" />,
      transfer: <Building className="w-3 h-3" />,
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${styles[method]}`}>
        {icons[method]}
        {labels[method]}
      </span>
    )
  }

  const getStatusBadge = (status: SaleStatus) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      paid: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    }
    const labels = {
      pending: 'Pendiente',
      paid: 'Completado',
      cancelled: 'Cancelado',
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
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Banknote className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Efectivo</p>
                <p className="text-2xl font-bold">${cashPayments.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tarjeta</p>
                <p className="text-2xl font-bold">${cardPayments.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building className="w-6 h-6 text-purple-600" />
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
              <Button onClick={handleOpenDialog} className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Pago
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
                  <TableHead>Venta</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron pagos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map(payment => {
                    const sale = sales.find(s => s.id_vehicle_sale === payment.id_vehicle_sale)
                    const customer = customers.find(c => c.id_customer === sale?.id_customer)
                    const vehicle = vehicles.find(v => v.id_vehicle === sale?.id_vehicle)
                    const brand = brands.find(b => b.id_brand === vehicle?.id_brand)
                    return (
                      <TableRow key={payment.id_payment} className="hover:bg-muted/30">
                        <TableCell className="font-mono">#{payment.id_payment.toString().padStart(4, '0')}</TableCell>
                        <TableCell>{new Date(payment.date).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{customer?.first_name} {customer?.last_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{brand?.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">Venta #{sale?.id_vehicle_sale}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getMethodBadge(payment.payment_method)}</TableCell>
                        <TableCell className="font-bold text-[#C9A961]">
                          ${payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
