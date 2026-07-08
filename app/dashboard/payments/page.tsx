"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/admin/header'
import { useDataStore, useAuthStore, Payment, SaleStatus, PaymentMethod } from '@/lib/store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FinancingPlansPage from '@/app/dashboard/financing-plans/page'
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
  CreditCard,
  DollarSign,
  Banknote,
  Building,
  Calendar,
  User,
  Car,
  FileText,
  Sparkles,
  CheckCircle2,
  Loader2,
  QrCode
} from 'lucide-react'
import { AdminPagination } from '@/components/admin/pagination'

export default function PaymentsPage() {
  const { payments, sales, customers, vehicles, brands, models, financingPlans, users, addPayment, installments } = useDataStore()
  const { user: currentUser } = useAuthStore()
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

  // Installment Control States
  const [selectedFinancedSaleId, setSelectedFinancedSaleId] = useState<string>('')
  const [isPayInstallmentDialogOpen, setIsPayInstallmentDialogOpen] = useState(false)
  const [activeInstallmentToPay, setActiveInstallmentToPay] = useState<any>(null)
  const [installmentPaymentMethod, setInstallmentPaymentMethod] = useState<PaymentMethod>('cash')
  const [isProcessingInstallmentPayment, setIsProcessingInstallmentPayment] = useState(false)

  const handlePayInstallment = async () => {
    if (!activeInstallmentToPay) return
    setIsProcessingInstallmentPayment(true)
    try {
      const payload = {
        date: new Date().toISOString(),
        amount: activeInstallmentToPay.amount,
        payment_method: installmentPaymentMethod,
        id_user: currentUser?.id_user || users[0]?.id_user || 1,
        id_vehicle_sale: activeInstallmentToPay.id_vehicle_sale,
        id_installment: activeInstallmentToPay.id_installment,
        status: 'paid' as SaleStatus
      }
      await addPayment(payload)
      setIsPayInstallmentDialogOpen(false)
      setActiveInstallmentToPay(null)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Error al procesar el pago de la cuota.')
    } finally {
      setIsProcessingInstallmentPayment(false)
    }
  }

  // Simulator states
  const [isSimDialogOpen, setIsSimDialogOpen] = useState(false)
  const [simStep, setSimStep] = useState<'select' | 'method' | 'simulating' | 'success'>('select')
  const [simSaleId, setSimSaleId] = useState<string>('')
  const [simMethod, setSimMethod] = useState<PaymentMethod>('card')
  const [simAmount, setSimAmount] = useState<number>(0)
  
  // Cash details
  const [simCashReceived, setSimCashReceived] = useState<number>(0)
  
  // Card details
  const [simCardNumber, setSimCardNumber] = useState('')
  const [simCardExpiry, setSimCardExpiry] = useState('')
  const [simCardCvv, setSimCardCvv] = useState('')
  const [simCardName, setSimCardName] = useState('')
  
  // Simulator UI loading text
  const [simLoadingText, setSimLoadingText] = useState('Iniciando pasarela...')

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

  const totalPayments = payments.reduce((acc, p) => acc + parseFloat(p.amount as any || 0), 0)
  const cashPayments = payments.filter(p => p.payment_method === 'cash').reduce((acc, p) => acc + parseFloat(p.amount as any || 0), 0)
  const cardPayments = payments.filter(p => p.payment_method === 'card').reduce((acc, p) => acc + parseFloat(p.amount as any || 0), 0)
  const transferPayments = payments.filter(p => p.payment_method === 'transfer').reduce((acc, p) => acc + parseFloat(p.amount as any || 0), 0)

  const handleOpenDialog = () => {
    setFormData({
      date: new Date().toISOString(),
      amount: 0,
      payment_method: 'cash',
      status: 'paid',
      id_user: currentUser?.id_user || users[0]?.id_user || 0,
      id_vehicle_sale: 0,
    })
    setIsDialogOpen(true)
  }

  const handleOpenSimDialog = () => {
    const eligibleSales = sales.filter(s => s.status !== 'cancelled').filter(sale => {
      const totalPaid = payments.filter(p => p.id_vehicle_sale === sale.id_vehicle_sale && p.status === 'paid').reduce((acc, p) => acc + parseFloat(p.amount as any || 0), 0)
      const pendingAmount = Math.max(0, parseFloat(sale.final_price as any || 0) - totalPaid)
      return pendingAmount > 0
    })
    
    const initialSale = eligibleSales[0]
    if (initialSale) {
      const totalPaid = payments.filter(p => p.id_vehicle_sale === initialSale.id_vehicle_sale && p.status === 'paid').reduce((acc, p) => acc + parseFloat(p.amount as any || 0), 0)
      const pending = Math.max(0, parseFloat(initialSale.final_price as any || 0) - totalPaid)
      
      setSimSaleId(initialSale.id_vehicle_sale.toString())
      setSimAmount(pending)
      setSimCashReceived(pending)
    } else {
      setSimSaleId('')
      setSimAmount(0)
      setSimCashReceived(0)
    }
    
    setSimStep('select')
    setSimMethod('card')
    setSimCardNumber('')
    setSimCardExpiry('')
    setSimCardCvv('')
    setSimCardName('')
    setIsSimDialogOpen(true)
  }

  const handleSimSaleChange = (saleIdStr: string) => {
    setSimSaleId(saleIdStr)
    const saleId = parseInt(saleIdStr)
    const sale = sales.find(s => s.id_vehicle_sale === saleId)
    if (sale) {
      const totalPaid = payments.filter(p => p.id_vehicle_sale === sale.id_vehicle_sale && p.status === 'paid').reduce((acc, p) => acc + parseFloat(p.amount as any || 0), 0)
      const pending = Math.max(0, parseFloat(sale.final_price as any || 0) - totalPaid)
      setSimAmount(pending)
      setSimCashReceived(pending)
    }
  }

  const runSimulation = async () => {
    setSimStep('simulating')
    
    if (simMethod === 'card') {
      setSimLoadingText('Estableciendo conexión encriptada de 256 bits...')
      await new Promise(r => setTimeout(r, 1000))
      setSimLoadingText('Validando fondos de la tarjeta con banco emisor...')
      await new Promise(r => setTimeout(r, 1000))
      setSimLoadingText('Procesando cobro y generando token de autorización...')
      await new Promise(r => setTimeout(r, 1000))
    } else if (simMethod === 'transfer') {
      setSimLoadingText('Escuchando eventos de la red SPEI (Banco Central)...')
      await new Promise(r => setTimeout(r, 1200))
      setSimLoadingText('Transferencia recibida de forma exitosa...')
      await new Promise(r => setTimeout(r, 800))
      setSimLoadingText('Verificando firmas digitales y saldo de referencia...')
      await new Promise(r => setTimeout(r, 1000))
    } else {
      setSimLoadingText('Abriendo caja registradora del distribuidor...')
      await new Promise(r => setTimeout(r, 800))
      setSimLoadingText('Registrando ingreso de efectivo físico...')
      await new Promise(r => setTimeout(r, 800))
    }
    
    try {
      await addPayment({
        date: new Date().toISOString(),
        amount: simAmount,
        payment_method: simMethod,
        status: 'paid',
        id_user: currentUser?.id_user || users[0]?.id_user || 0,
        id_vehicle_sale: parseInt(simSaleId)
      })
      setSimStep('success')
    } catch (err) {
      console.error(err)
      alert('Error al registrar el pago de la simulación.')
      setSimStep('select')
    }
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
        title="Facturación y Finanzas" 
        description="Administra los pagos y planes de crédito"
      />
      
      <div className="p-6">
        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="payments">Pagos / Recaudación</TabsTrigger>
            <TabsTrigger value="installments">Control de Cuotas</TabsTrigger>
            <TabsTrigger value="financing-plans">Planes de Financiamiento</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-6 mt-0">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#C9A961]/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#C9A961]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Recaudado</p>                 <p className="text-2xl font-bold">${formatPrice(totalPayments)}</p>
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
                <p className="text-2xl font-bold">${formatPrice(cashPayments)}</p>
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
                <p className="text-2xl font-bold">${formatPrice(cardPayments)}</p>
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
                <p className="text-2xl font-bold">${formatPrice(transferPayments)}</p>
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
              <div className="flex gap-2 w-full md:w-auto">
                <Button onClick={handleOpenSimDialog} variant="outline" className="border-[#C9A961]/40 text-[#C9A961] hover:bg-[#C9A961]/10 w-full md:w-auto font-semibold">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Simular Pago
                </Button>
                <Button onClick={handleOpenDialog} className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] w-full md:w-auto font-semibold">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Pago
                </Button>
              </div>
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
                          ${formatPrice(payment.amount)}
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
          </TabsContent>
          <TabsContent value="installments" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Financed Sales Sidebar */}
              <div className="space-y-4">
                <Card className="border-border/50 bg-white/40 dark:bg-[#121215]/40 backdrop-blur-sm">
                  <div className="p-4 border-b border-border/40">
                    <h3 className="font-bold text-sm text-[#C9A961] uppercase tracking-wider">Ventas Financiadas</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Selecciona una venta para gestionar sus cuotas.</p>
                  </div>
                  <CardContent className="p-2 max-h-[500px] overflow-y-auto space-y-1">
                    {sales.filter(s => s.sale_type === 'financed').map((sale) => {
                      const customer = customers.find(c => c.id_customer === sale.id_customer)
                      const vehicle = vehicles.find(v => v.id_vehicle === sale.id_vehicle)
                      const brand = brands.find(b => b.id_brand === vehicle?.id_brand)
                      const model = models.find(m => m.id_model === vehicle?.id_model)
                      const isSelected = selectedFinancedSaleId === sale.id_vehicle_sale.toString()
                      
                      const salePayments = payments.filter(p => p.id_vehicle_sale === sale.id_vehicle_sale)
                      const totalPaid = salePayments.reduce((acc, p) => acc + parseFloat(p.amount as any || 0), 0)
                      const pendingAmount = Math.max(0, parseFloat(sale.final_price as any || 0) - totalPaid)
                      
                      return (
                        <div
                          key={sale.id_vehicle_sale}
                          onClick={() => setSelectedFinancedSaleId(sale.id_vehicle_sale.toString())}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#C9A961]/10 border border-[#C9A961]/30'
                              : 'hover:bg-muted/50 border border-transparent'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-semibold text-sm">
                              {customer ? `${customer.first_name} ${customer.last_name}` : 'Cliente Desconocido'}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              sale.status === 'paid'
                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            }`}>
                              {sale.status === 'paid' ? 'Liquidado' : 'Financiado'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {brand?.name} {model?.name} — {vehicle?.license_plate}
                          </p>
                          <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-border/10">
                            <span className="text-muted-foreground">Restante:</span>
                            <span className="font-bold text-[#C9A961]">${formatPrice(pendingAmount)}</span>
                          </div>
                        </div>
                      )
                    })}
                    {sales.filter(s => s.sale_type === 'financed').length === 0 && (
                      <p className="text-center py-8 text-sm text-muted-foreground">No hay ventas financiadas activas.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Installments Table */}
              <div className="lg:col-span-2 space-y-4">
                {selectedFinancedSaleId ? (
                  (() => {
                    const sale = sales.find(s => s.id_vehicle_sale.toString() === selectedFinancedSaleId)
                    if (!sale) return null
                    const customer = customers.find(c => c.id_customer === sale.id_customer)
                    const vehicle = vehicles.find(v => v.id_vehicle === sale.id_vehicle)
                    const brand = brands.find(b => b.id_brand === vehicle?.id_brand)
                    const model = models.find(m => m.id_model === vehicle?.id_model)
                    const plan = financingPlans.find(p => p.id_financing_plan === sale.id_financing_plan)
                    
                    const saleInstallments = installments.filter(i => i.id_vehicle_sale === sale.id_vehicle_sale)
                    const paidInstallments = saleInstallments.filter(i => i.status === 'paid')
                    const pendingInstallments = saleInstallments.filter(i => i.status === 'pending')

                    return (
                      <Card className="border-border/50 bg-white/40 dark:bg-[#121215]/40 backdrop-blur-sm">
                        <div className="p-6 border-b border-border/40">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg">Amortización de Crédito</h3>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                Cliente: <span className="font-semibold text-foreground">{customer?.first_name} {customer?.last_name}</span> |
                                Auto: <span className="font-semibold text-foreground">{brand?.name} {model?.name} ({vehicle?.license_plate})</span>
                              </p>
                            </div>
                            {plan && (
                              <div className="text-right">
                                <span className="text-xs uppercase font-bold text-[#C9A961] bg-[#C9A961]/15 px-2.5 py-1 rounded">
                                  Plan: {plan.name}
                                </span>
                                <p className="text-xs text-muted-foreground mt-1">Interés: {plan.interest_rate}% | {plan.number_installments} cuotas</p>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <p className="text-xs text-muted-foreground">Cuotas Pagadas</p>
                              <p className="text-xl font-bold mt-1 text-green-500">{paidInstallments.length} / {saleInstallments.length}</p>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <p className="text-xs text-muted-foreground">Monto de Cuota</p>
                              <p className="text-xl font-bold mt-1 text-[#C9A961]">
                                ${formatPrice(saleInstallments[0]?.amount || 0)}
                              </p>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <p className="text-xs text-muted-foreground">Restante por Pagar</p>
                              <p className="text-xl font-bold mt-1 text-red-400">
                                ${formatPrice(pendingInstallments.reduce((acc, i) => acc + parseFloat(i.amount as any), 0))}
                              </p>
                            </div>
                          </div>
                        </div>

                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/40 text-left border-b border-border/40 text-muted-foreground">
                                <tr>
                                  <th className="p-4 font-semibold">Nº Cuota</th>
                                  <th className="p-4 font-semibold">Vencimiento</th>
                                  <th className="p-4 font-semibold text-right">Importe</th>
                                  <th className="p-4 font-semibold">Estado</th>
                                  <th className="p-4 font-semibold text-center">Acciones</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/20">
                                {saleInstallments.map((inst) => (
                                  <tr key={inst.id_installment} className="hover:bg-muted/10">
                                    <td className="p-4 font-medium">Cuota {inst.number}</td>
                                    <td className="p-4">
                                      {new Date(inst.due_date).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </td>
                                    <td className="p-4 text-right font-bold text-[#C9A961]">${formatPrice(inst.amount)}</td>
                                    <td className="p-4">
                                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                        inst.status === 'paid'
                                          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800'
                                          : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800'
                                      }`}>
                                        {inst.status === 'paid' ? 'Pagada' : 'Pendiente'}
                                      </span>
                                    </td>
                                    <td className="p-4 text-center">
                                      {inst.status === 'pending' ? (
                                        <Button
                                          size="sm"
                                          className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] font-bold"
                                          onClick={() => {
                                            setActiveInstallmentToPay(inst);
                                            setInstallmentPaymentMethod('cash');
                                            setIsPayInstallmentDialogOpen(true);
                                          }}
                                        >
                                          Registrar Pago
                                        </Button>
                                      ) : (
                                        <span className="text-green-500 font-bold inline-flex items-center gap-1">
                                          <CheckCircle2 className="w-4 h-4" /> Pagado
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                                {saleInstallments.length === 0 && (
                                  <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                      No se generaron cuotas para esta venta financiada.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })()
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/50 rounded-xl bg-white/10 dark:bg-zinc-950/10 h-64 text-center">
                    <QrCode className="w-12 h-12 text-[#C9A961] opacity-50 mb-3" />
                    <h4 className="font-bold text-lg">Sin Selección</h4>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      Por favor, selecciona una venta financiada de la lista lateral para visualizar sus cuotas.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="financing-plans" className="mt-0">
            <FinancingPlansPage hideHeader={true} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Pay Installment Dialog */}
      <Dialog open={isPayInstallmentDialogOpen} onOpenChange={setIsPayInstallmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago de Cuota</DialogTitle>
            <DialogDescription>
              Confirma los detalles del pago de la cuota seleccionada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {activeInstallmentToPay && (
              <div className="bg-muted/40 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Número de Cuota:</span>
                  <span className="font-bold">Cuota {activeInstallmentToPay.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monto de la Cuota:</span>
                  <span className="font-bold text-[#C9A961]">${formatPrice(activeInstallmentToPay.amount)}</span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <Select
                value={installmentPaymentMethod}
                onValueChange={(v) => setInstallmentPaymentMethod(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="card">Tarjeta de Crédito / Débito</SelectItem>
                  <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPayInstallmentDialogOpen(false)} disabled={isProcessingInstallmentPayment}>
              Cancelar
            </Button>
            <Button
              className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] font-bold"
              onClick={handlePayInstallment}
              disabled={isProcessingInstallmentPayment}
            >
              {isProcessingInstallmentPayment ? 'Procesando...' : 'Confirmar Pago'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                          Venta #{sale.id_vehicle_sale} - {customer?.first_name} {customer?.last_name} (${formatPrice(sale.final_price)})
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

      {/* Simulator Dialog */}
      <Dialog open={isSimDialogOpen} onOpenChange={setIsSimDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Sparkles className="w-5 h-5 text-[#C9A961]" />
              Simulador de Métodos de Pago
            </DialogTitle>
            <DialogDescription>
              Simula pagos en efectivo, tarjeta o transferencia SPEI en tiempo real.
            </DialogDescription>
          </DialogHeader>

          {simStep === 'select' && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Seleccionar Venta con Saldo Pendiente</Label>
                <Select value={simSaleId} onValueChange={handleSimSaleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar venta" />
                  </SelectTrigger>
                  <SelectContent>
                    {sales.filter(s => s.status !== 'cancelled').map(sale => {
                      const customer = customers.find(c => c.id_customer === sale.id_customer)
                      const totalPaid = payments.filter(p => p.id_vehicle_sale === sale.id_vehicle_sale && p.status === 'paid').reduce((acc, p) => acc + parseFloat(p.amount as any || 0), 0)
                      const pending = Math.max(0, parseFloat(sale.final_price as any || 0) - totalPaid)
                      if (pending <= 0) return null
                      return (
                        <SelectItem key={sale.id_vehicle_sale} value={sale.id_vehicle_sale.toString()}>
                          Venta #{sale.id_vehicle_sale} - {customer?.first_name} {customer?.last_name} (Pendiente: ${formatPrice(pending)})
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {simSaleId ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="simAmount">Monto a Pagar ($)</Label>
                    <Input
                      id="simAmount"
                      type="number"
                      value={simAmount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        setSimAmount(isNaN(val) ? 0 : val)
                      }}
                      required
                    />
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button onClick={() => setSimStep('method')} className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] font-semibold">
                      Siguiente
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center text-muted-foreground text-sm">
                  No hay ventas activas con saldo pendiente para realizar simulación.
                </div>
              )}
            </div>
          )}

          {simStep === 'method' && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Elige un método de pago a simular</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => { setSimMethod('cash'); setSimCashReceived(simAmount); }}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all hover:bg-[#C9A961]/5 ${
                      simMethod === 'cash' ? "border-[#C9A961] bg-[#C9A961]/10 text-[#C9A961]" : "border-border/50"
                    }`}
                  >
                    <Banknote className="w-6 h-6" />
                    <span className="text-xs font-semibold">Efectivo</span>
                  </button>
                  <button
                    onClick={() => setSimMethod('card')}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all hover:bg-[#C9A961]/5 ${
                      simMethod === 'card' ? "border-[#C9A961] bg-[#C9A961]/10 text-[#C9A961]" : "border-border/50"
                    }`}
                  >
                    <CreditCard className="w-6 h-6" />
                    <span className="text-xs font-semibold">Tarjeta</span>
                  </button>
                  <button
                    onClick={() => setSimMethod('transfer')}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all hover:bg-[#C9A961]/5 ${
                      simMethod === 'transfer' ? "border-[#C9A961] bg-[#C9A961]/10 text-[#C9A961]" : "border-border/50"
                    }`}
                  >
                    <Building className="w-6 h-6" />
                    <span className="text-xs font-semibold">SPEI</span>
                  </button>
                </div>
              </div>

              {simMethod === 'cash' && (
                <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/40">
                  <h4 className="text-sm font-semibold flex items-center gap-1.5"><Banknote className="w-4 h-4 text-green-600" /> Simulación de Caja</h4>
                  <div className="space-y-2">
                    <Label htmlFor="cashReceived">Efectivo Entregado por Cliente ($)</Label>
                    <Input
                      id="cashReceived"
                      type="number"
                      value={simCashReceived}
                      onChange={(e) => setSimCashReceived(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-muted-foreground">Cambio a devolver:</span>
                    <span className="font-bold text-green-600">
                      ${formatPrice(Math.max(0, simCashReceived - simAmount))}
                    </span>
                  </div>
                </div>
              )}

              {simMethod === 'card' && (
                <div className="space-y-4">
                  {/* Mock Credit Card Graphics */}
                  <div className="relative w-full h-44 rounded-xl bg-gradient-to-br from-[#1A1F3D] via-[#2F365F] to-[#1A1F3D] p-5 text-white shadow-xl flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-5 -mt-5" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-5 -mb-5" />
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-8 rounded-md bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 border border-yellow-200/50" />
                      <span className="text-lg font-bold tracking-widest text-[#C9A961]" style={{ fontFamily: 'var(--font-serif)' }}>CARLIZ</span>
                    </div>
                    <div className="text-lg font-mono tracking-widest my-2">
                      {simCardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-[9px] text-zinc-400 uppercase">Titular</div>
                        <div className="text-xs font-mono tracking-wider truncate max-w-[180px]">
                          {simCardName.toUpperCase() || 'TITULAR DE LA TARJETA'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-zinc-400 uppercase">Expira</div>
                        <div className="text-xs font-mono">
                          {simCardExpiry || 'MM/AA'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card input forms */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                      <Input
                        id="cardNumber"
                        placeholder="4111 1111 1111 1111"
                        value={simCardNumber}
                        onChange={(e) => setSimCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim())}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="cardExpiry">Vencimiento</Label>
                      <Input
                        id="cardExpiry"
                        placeholder="MM/AA"
                        value={simCardExpiry}
                        onChange={(e) => setSimCardExpiry(e.target.value.substring(0, 5))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="cardCvv">CVV</Label>
                      <Input
                        id="cardCvv"
                        type="password"
                        placeholder="•••"
                        value={simCardCvv}
                        onChange={(e) => setSimCardCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor="cardName">Nombre del Titular</Label>
                      <Input
                        id="cardName"
                        placeholder="JUAN PEREZ"
                        value={simCardName}
                        onChange={(e) => setSimCardName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {simMethod === 'transfer' && (
                <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/40">
                  <h4 className="text-sm font-semibold flex items-center gap-1.5"><QrCode className="w-4 h-4 text-purple-600" /> Transferencia Bancaria Directa (SPEI)</h4>
                  <div className="flex gap-4 items-center">
                    <div className="w-24 h-24 bg-white border border-border p-2 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <svg className="w-20 h-20 text-zinc-800" viewBox="0 0 100 100">
                        <rect x="10" y="10" width="20" height="20" fill="currentColor"/>
                        <rect x="15" y="15" width="10" height="10" fill="white"/>
                        <rect x="70" y="10" width="20" height="20" fill="currentColor"/>
                        <rect x="75" y="15" width="10" height="10" fill="white"/>
                        <rect x="10" y="70" width="20" height="20" fill="currentColor"/>
                        <rect x="15" y="75" width="10" height="10" fill="white"/>
                        <rect x="40" y="40" width="20" height="20" fill="currentColor"/>
                        <rect x="45" y="45" width="10" height="10" fill="white"/>
                        <rect x="40" y="15" width="10" height="15" fill="currentColor"/>
                        <rect x="15" y="45" width="15" height="10" fill="currentColor"/>
                        <rect x="70" y="45" width="15" height="15" fill="currentColor"/>
                        <rect x="45" y="70" width="20" height="10" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="text-xs space-y-1 font-mono text-muted-foreground flex-1">
                      <p><strong className="text-foreground">Banco:</strong> LuxeBank</p>
                      <p><strong className="text-foreground">CLABE:</strong> 0123 4567 8901 2345 67</p>
                      <p><strong className="text-foreground">Beneficiario:</strong> CARLIZ S.A.</p>
                      <p><strong className="text-foreground">Concepto/Ref:</strong> VTA-{simSaleId}</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Escanea el código QR desde tu app bancaria o realiza una transferencia a los datos indicados por el monto de <strong className="text-foreground">${formatPrice(simAmount)}</strong>.
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button onClick={() => setSimStep('select')} variant="outline">
                  Atrás
                </Button>
                <Button onClick={runSimulation} className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] font-semibold">
                  Iniciar Simulación
                </Button>
              </div>
            </div>
          )}

          {simStep === 'simulating' && (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="w-12 h-12 text-[#C9A961] animate-spin" />
              <div>
                <h4 className="font-semibold text-lg">Simulación en progreso...</h4>
                <p className="text-sm text-muted-foreground mt-1 max-w-[280px] mx-auto min-h-[40px]">
                  {simLoadingText}
                </p>
              </div>
            </div>
          )}

          {simStep === 'success' && (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 flex items-center justify-center text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-green-600 dark:text-green-400">¡Simulación Completada!</h4>
                <p className="text-sm text-muted-foreground mt-2 max-w-[320px]">
                  El pago por <strong className="text-foreground">${formatPrice(simAmount)}</strong> ha sido procesado de forma exitosa y registrado en el historial de transacciones.
                </p>
              </div>
              <Button onClick={() => setIsSimDialogOpen(false)} className="mt-4 bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] font-semibold">
                Finalizar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
