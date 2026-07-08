"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/admin/header'
import { useDataStore, useAuthStore, VehicleSale, SaleStatus, SaleType } from '@/lib/store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import QuotesPage from '@/app/dashboard/quotes/page'
import ReportsPage from '@/app/dashboard/reports/page'
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
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  Eye,
  Calendar,
  User,
  Car,
  UserPlus,
  Receipt,
  Printer,
  QrCode,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Check
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdminPagination } from '@/components/admin/pagination'

export default function SalesPage() {
  const { sales, vehicles, customers, users, brands, models, financingPlans, addSale, updateSale, addCustomer } = useDataStore()
  const { user: currentUser } = useAuthStore()
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

  // Simulator States
  const [simStep, setSimStep] = useState(1)
  const [simCustomerType, setSimCustomerType] = useState<'existing' | 'new'>('existing')
  const [simSelectedCustomerId, setSimSelectedCustomerId] = useState<string>('')
  const [simNewCustomer, setSimNewCustomer] = useState({
    first_name: '',
    last_name: '',
    document: '',
    phone: '',
    email: '',
    address: '',
  })
  const [simSelectedVehicleId, setSimSelectedVehicleId] = useState<string>('')
  const [simSaleType, setSimSaleType] = useState<'cash' | 'financed'>('cash')
  const [simFinancingPlanId, setSimFinancingPlanId] = useState<string>('')
  const [simPaymentMethod, setSimPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash')
  const [simFinalPrice, setSimFinalPrice] = useState<number>(0)
  const [simInvoiceCreated, setSimInvoiceCreated] = useState<any>(null)
  const [simIsLoading, setSimIsLoading] = useState(false)
  const [simSearchCedula, setSimSearchCedula] = useState('')

  const resetSimulator = () => {
    setSimStep(1)
    setSimCustomerType('existing')
    setSimSelectedCustomerId('')
    setSimSearchCedula('')
    setSimNewCustomer({
      first_name: '',
      last_name: '',
      document: '',
      phone: '',
      email: '',
      address: '',
    })
    setSimSelectedVehicleId('')
    setSimSaleType('cash')
    setSimFinancingPlanId('')
    setSimPaymentMethod('cash')
    setSimFinalPrice(0)
    setSimInvoiceCreated(null)
  }

  const handleSimulatePurchase = async () => {
    setSimIsLoading(true)
    try {
      let customerId = parseInt(simSelectedCustomerId)

      // 1. Si el cliente es nuevo, registrarlo primero
      if (simCustomerType === 'new') {
        if (!simNewCustomer.first_name || !simNewCustomer.last_name || !simNewCustomer.document) {
          alert('Por favor complete los campos obligatorios del cliente (Nombre, Apellido, Cédula).')
          setSimIsLoading(false)
          return
        }
        const newCust = await addCustomer(simNewCustomer)
        customerId = newCust.id_customer
      } else {
        if (!customerId) {
          alert('Por favor seleccione un cliente existente.')
          setSimIsLoading(false)
          return
        }
      }

      // 2. Validar vehículo
      const vehicleId = parseInt(simSelectedVehicleId)
      if (!vehicleId) {
        alert('Por favor seleccione un vehículo de la lista.')
        setSimIsLoading(false)
        return
      }

      const vehicle = vehicles.find(v => v.id_vehicle === vehicleId)
      if (!vehicle) {
        alert('El vehículo seleccionado no es válido.')
        setSimIsLoading(false)
        return
      }

      // 3. Crear el payload de la venta
      const finalPriceToUse = simFinalPrice > 0 ? simFinalPrice : vehicle.sale_price
      const salePayload = {
        date: new Date().toISOString().split('T')[0],
        final_price: finalPriceToUse,
        sale_type: simSaleType as SaleType,
        status: (simSaleType === 'cash' ? 'paid' : 'pending') as SaleStatus, // Al contado se marca pagada directo
        id_user: currentUser?.id_user || users[0]?.id_user || 1,
        id_customer: customerId,
        id_vehicle: vehicleId,
        id_financing_plan: simSaleType === 'financed' ? parseInt(simFinancingPlanId) : undefined
      }

      // Validar plan de financiamiento si es financiado
      if (simSaleType === 'financed' && !simFinancingPlanId) {
        alert('Por favor seleccione un plan de financiamiento.')
        setSimIsLoading(false)
        return
      }

      // 4. Guardar la venta en la base de datos
      const newSale = await addSale(salePayload)

      // 5. Si la venta fue de contado, registrar el pago de una vez
      if (simSaleType === 'cash') {
        const paymentPayload = {
          date: new Date().toISOString(),
          amount: finalPriceToUse,
          payment_method: simPaymentMethod,
          id_user: currentUser?.id_user || users[0]?.id_user || 1,
          id_vehicle_sale: newSale.id_vehicle_sale,
          id_installment: undefined,
          status: 'paid' as SaleStatus
        }
        await useDataStore.getState().addPayment(paymentPayload)
      }

      // 6. Guardar los datos de la factura generada para visualizarla
      setSimInvoiceCreated({
        sale: newSale,
        customer: customers.find(c => c.id_customer === customerId) || { ...simNewCustomer, id_customer: customerId },
        vehicle,
        plan: financingPlans.find(p => p.id_financing_plan === parseInt(simFinancingPlanId))
      })

      // 7. Avanzar al paso del certificado
      setSimStep(5)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Ocurrió un error al procesar la simulación.')
    } finally {
      setSimIsLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const availableVehicles = vehicles.filter(v => 
    v.status === 'available' || (editingSale && v.id_vehicle === editingSale.id_vehicle)
  )

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

  const totalSales = sales.reduce((acc, s) => acc + parseFloat(s.final_price as any || 0), 0)
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
        id_user: currentUser?.id_user || users[0]?.id_user || 0,
        id_customer: 0,
        id_vehicle: 0,
        id_financing_plan: undefined,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clean and parse payload data to guarantee correct types are sent
    const parsedPrice = typeof formData.final_price === 'number' 
      ? formData.final_price 
      : parseFloat(formData.final_price as any || '0')

    const payload = {
      ...formData,
      final_price: isNaN(parsedPrice) ? 0 : parsedPrice,
      id_customer: parseInt(formData.id_customer as any) || 0,
      id_vehicle: parseInt(formData.id_vehicle as any) || 0,
      id_user: parseInt(formData.id_user as any) || currentUser?.id_user || 0,
      id_financing_plan: formData.sale_type === 'cash' 
        ? undefined 
        : (formData.id_financing_plan ? parseInt(formData.id_financing_plan as any) : undefined)
    }
    
    // Front-end validations
    if (payload.id_customer === 0) {
      alert("Por favor, selecciona un cliente.");
      return;
    }
    if (payload.id_vehicle === 0) {
      alert("Por favor, selecciona un vehículo.");
      return;
    }
    if (payload.sale_type === 'financed' && !payload.id_financing_plan) {
      alert("Por favor, selecciona un plan de financiamiento.");
      return;
    }
    if (payload.final_price <= 0) {
      alert("El precio final debe ser un número positivo.");
      return;
    }

    try {
      if (editingSale) {
        await updateSale(editingSale.id_vehicle_sale, payload)
      } else {
        await addSale(payload)
      }
      setIsDialogOpen(false)
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Error al registrar la venta.")
    }
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
        title="Ventas y Negocios" 
        description="Administra las ventas, cotizaciones y reportes"
      />
      
      <div className="p-6">
        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="sales">Ventas Registradas</TabsTrigger>
            <TabsTrigger value="quotes">Cotizaciones</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
            <TabsTrigger value="simulator">Simulador de Compra</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-6 mt-0">
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
                <p className="text-2xl font-bold">${formatPrice(totalSales)}</p>
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
                          ${formatPrice(sale.final_price)}
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
          <TabsContent value="quotes" className="mt-0">
            <QuotesPage hideHeader={true} />
          </TabsContent>
          <TabsContent value="reports" className="mt-0">
            <ReportsPage hideHeader={true} />
          </TabsContent>
          <TabsContent value="simulator" className="mt-0 space-y-6">
            <Card className="border-border/50 bg-white/40 dark:bg-[#121215]/40 backdrop-blur-sm">
              <CardContent className="p-6">
                {/* Wizard Step Progress */}
                {simStep <= 4 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between max-w-xl mx-auto">
                      {[
                        { step: 1, label: 'Comprador' },
                        { step: 2, label: 'Vehículo' },
                        { step: 3, label: 'Pago' },
                        { step: 4, label: 'Confirmar' }
                      ].map((item) => (
                        <div key={item.step} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border transition-all duration-300 ${
                              simStep === item.step
                                ? 'bg-[#C9A961] text-[#2D2D2D] border-[#C9A961] shadow-lg shadow-[#C9A961]/20 scale-110'
                                : simStep > item.step
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}>
                              {simStep > item.step ? <Check className="w-5 h-5" /> : item.step}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${
                              simStep === item.step ? 'text-[#C9A961]' : 'text-muted-foreground'
                            }`}>{item.label}</span>
                          </div>
                          {item.step < 4 && (
                            <div className={`h-0.5 flex-1 mx-4 transition-colors duration-300 ${
                              simStep > item.step ? 'bg-green-500' : 'bg-border'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 1: CLIENTE */}
                {simStep === 1 && (
                  <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in-50 duration-300">
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold">Identificación del Comprador</h3>
                      <p className="text-sm text-muted-foreground">Registra un nuevo cliente o busca uno existente en el directorio.</p>
                    </div>

                    <div className="flex justify-center gap-4">
                      <Button
                        type="button"
                        variant={simCustomerType === 'existing' ? 'default' : 'outline'}
                        className={simCustomerType === 'existing' ? 'bg-[#C9A961] text-[#2D2D2D] hover:bg-[#D4B978]' : ''}
                        onClick={() => setSimCustomerType('existing')}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Cliente Registrado
                      </Button>
                      <Button
                        type="button"
                        variant={simCustomerType === 'new' ? 'default' : 'outline'}
                        className={simCustomerType === 'new' ? 'bg-[#C9A961] text-[#2D2D2D] hover:bg-[#D4B978]' : ''}
                        onClick={() => setSimCustomerType('new')}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Nuevo Registro
                      </Button>
                    </div>

                    {simCustomerType === 'existing' ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="simSearchCedula">Cédula / Documento del Cliente</Label>
                          <Input
                            id="simSearchCedula"
                            placeholder="Introduce la cédula a buscar (ej: 12345678)"
                            value={simSearchCedula}
                            onChange={(e) => {
                              const val = e.target.value
                              setSimSearchCedula(val)
                              const found = customers.find(c => c.document.trim().toLowerCase() === val.trim().toLowerCase())
                              if (found) {
                                setSimSelectedCustomerId(found.id_customer.toString())
                              } else {
                                setSimSelectedCustomerId('')
                              }
                            }}
                          />
                          {/* Auto-suggest dropdown of matching clients */}
                          {(() => {
                            const matches = simSearchCedula.trim() !== ''
                              ? customers.filter(c => c.document.toLowerCase().includes(simSearchCedula.trim().toLowerCase()))
                              : []
                            if (matches.length === 0 || simSelectedCustomerId) return null
                            return (
                              <div className="border border-border/60 rounded-lg bg-white dark:bg-zinc-950 shadow-lg max-h-40 overflow-y-auto divide-y divide-border/20 mt-1">
                                {matches.map((c) => (
                                  <div
                                    key={c.id_customer}
                                    onClick={() => {
                                      setSimSearchCedula(c.document)
                                      setSimSelectedCustomerId(c.id_customer.toString())
                                    }}
                                    className="p-2.5 hover:bg-[#C9A961]/10 cursor-pointer text-xs flex justify-between items-center transition-colors"
                                  >
                                    <div>
                                      <p className="font-bold text-foreground">{c.first_name} {c.last_name}</p>
                                      <p className="text-muted-foreground text-[10px]">Cédula: {c.document}</p>
                                    </div>
                                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-semibold">
                                      Seleccionar
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )
                          })()}
                        </div>

                        {simSelectedCustomerId && (() => {
                          const foundCust = customers.find(c => c.id_customer.toString() === simSelectedCustomerId)
                          if (!foundCust) return null
                          return (
                            <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/5 animate-in fade-in duration-300 space-y-2">
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-bold text-sm">Cliente Encontrado</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-muted-foreground">Nombre:</p>
                                  <p className="font-bold text-sm text-foreground">{foundCust.first_name} {foundCust.last_name}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Documento:</p>
                                  <p className="font-bold text-sm text-foreground">{foundCust.document}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Teléfono:</p>
                                  <p className="font-medium text-foreground">{foundCust.phone || 'Sin teléfono'}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Correo:</p>
                                  <p className="font-medium text-foreground truncate">{foundCust.email || 'Sin correo'}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })()}

                        {simSearchCedula && !simSelectedCustomerId && (
                          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-center">
                            <p className="text-sm text-red-500 dark:text-red-400 font-semibold">Cédula no registrada en el directorio.</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Por favor, utiliza la opción <span className="font-bold text-foreground">"Nuevo Registro"</span> para registrarlo.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nombre(s) *</Label>
                          <Input
                            placeholder="Juan"
                            value={simNewCustomer.first_name}
                            onChange={(e) => setSimNewCustomer({ ...simNewCustomer, first_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Apellido(s) *</Label>
                          <Input
                            placeholder="Gómez"
                            value={simNewCustomer.last_name}
                            onChange={(e) => setSimNewCustomer({ ...simNewCustomer, last_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Documento / Cédula *</Label>
                          <Input
                            placeholder="12345678"
                            value={simNewCustomer.document}
                            onChange={(e) => setSimNewCustomer({ ...simNewCustomer, document: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Teléfono</Label>
                          <Input
                            placeholder="+58 412 1234567"
                            value={simNewCustomer.phone}
                            onChange={(e) => setSimNewCustomer({ ...simNewCustomer, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            placeholder="juan.gomez@email.com"
                            value={simNewCustomer.email}
                            onChange={(e) => setSimNewCustomer({ ...simNewCustomer, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label>Dirección</Label>
                          <Input
                            placeholder="Av. Francisco de Miranda, Caracas"
                            value={simNewCustomer.address}
                            onChange={(e) => setSimNewCustomer({ ...simNewCustomer, address: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-4">
                      <Button
                        className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D]"
                        onClick={() => {
                          if (simCustomerType === 'existing' && !simSelectedCustomerId) {
                            alert('Por favor seleccione un cliente.');
                            return;
                          }
                          if (simCustomerType === 'new' && (!simNewCustomer.first_name || !simNewCustomer.last_name || !simNewCustomer.document)) {
                            alert('Por favor complete los campos obligatorios (*).');
                            return;
                          }
                          setSimStep(2);
                        }}
                      >
                        Continuar
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: VEHÍCULO */}
                {simStep === 2 && (
                  <div className="space-y-6 animate-in fade-in-50 duration-300">
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold">Selección del Vehículo</h3>
                      <p className="text-sm text-muted-foreground">Selecciona el vehículo disponible del catálogo.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
                      {availableVehicles.map((vehicle) => {
                        const brandObj = brands.find(b => b.id_brand === vehicle.id_brand)
                        const modelObj = models.find(m => m.id_model === vehicle.id_model)
                        const isSelected = simSelectedVehicleId === vehicle.id_vehicle.toString()
                        return (
                          <div
                            key={vehicle.id_vehicle}
                            onClick={() => {
                              setSimSelectedVehicleId(vehicle.id_vehicle.toString());
                              setSimFinalPrice(parseFloat(vehicle.sale_price as any) || 0); // Prefill final price
                            }}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between ${
                              isSelected
                                ? 'border-[#C9A961] bg-[#C9A961]/10 shadow-lg shadow-[#C9A961]/5'
                                : 'border-border/50 bg-white/5 dark:bg-[#121215]/5 hover:border-border'
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                                  {vehicle.license_plate}
                                </span>
                                {isSelected && (
                                  <span className="w-5 h-5 rounded-full bg-[#C9A961] flex items-center justify-center text-[#2D2D2D]">
                                    <Check className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-lg mt-2 text-foreground">
                                {brandObj?.name} {modelObj?.name}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Año: {vehicle.year} | Color: {vehicle.color}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                VIN: {vehicle.vehicle_serial}
                              </p>
                            </div>
                            <div className="pt-4 border-t border-border/40 mt-4 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground uppercase font-semibold">Precio</span>
                              <span className="font-extrabold text-[#C9A961]">
                                ${formatPrice(vehicle.sale_price)}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-border/40">
                      <Button variant="outline" onClick={() => setSimStep(1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Atrás
                      </Button>
                      <Button
                        className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D]"
                        onClick={() => {
                          if (!simSelectedVehicleId) {
                            alert('Por favor selecciona un vehículo.');
                            return;
                          }
                          setSimStep(3);
                        }}
                      >
                        Continuar
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: PAGO */}
                {simStep === 3 && (
                  <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in-50 duration-300">
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold">Método y Condiciones de Pago</h3>
                      <p className="text-sm text-muted-foreground">Configura los términos financieros de la transacción.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div
                        onClick={() => setSimSaleType('cash')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center space-y-2 ${
                          simSaleType === 'cash'
                            ? 'border-[#C9A961] bg-[#C9A961]/10'
                            : 'border-border/50 bg-white/5 dark:bg-[#121215]/5 hover:border-border'
                        }`}
                      >
                        <h4 className="font-bold text-lg">De Contado</h4>
                        <p className="text-xs text-muted-foreground">Pago total al momento de la entrega.</p>
                      </div>
                      <div
                        onClick={() => setSimSaleType('financed')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center space-y-2 ${
                          simSaleType === 'financed'
                            ? 'border-[#C9A961] bg-[#C9A961]/10'
                            : 'border-border/50 bg-white/5 dark:bg-[#121215]/5 hover:border-border'
                        }`}
                      >
                        <h4 className="font-bold text-lg">Financiado</h4>
                        <p className="text-xs text-muted-foreground">Pago diferido estructurado en cuotas mensuales.</p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="simFinalPrice">Precio de Venta Acordado ($)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                          <Input
                            id="simFinalPrice"
                            type="number"
                            className="pl-7"
                            value={simFinalPrice || ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value)
                              setSimFinalPrice(isNaN(val) ? 0 : val)
                            }}
                          />
                        </div>
                        <p className="text-xs text-[#C9A961] font-semibold mt-1">
                          Equivale a: ${formatPrice(simFinalPrice)} USD
                        </p>
                      </div>

                      {simSaleType === 'cash' ? (
                        <div className="space-y-2">
                          <Label>Forma de Pago</Label>
                          <Select
                            value={simPaymentMethod}
                            onValueChange={(v) => setSimPaymentMethod(v as any)}
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
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Plan de Financiamiento</Label>
                            <Select
                              value={simFinancingPlanId}
                              onValueChange={setSimFinancingPlanId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar un plan..." />
                              </SelectTrigger>
                              <SelectContent>
                                {financingPlans.map((plan) => (
                                  <SelectItem key={plan.id_financing_plan} value={plan.id_financing_plan.toString()}>
                                    {plan.name} — {plan.interest_rate}% de interés ({plan.number_installments} meses)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Live Financial Plan Estimate Card */}
                          {simFinancingPlanId && (
                            (() => {
                              const plan = financingPlans.find(p => p.id_financing_plan.toString() === simFinancingPlanId)
                              if (!plan) return null
                              const principal = simFinalPrice
                              const interest = parseFloat(plan.interest_rate as any)
                              const totalFinanced = principal * (1 + interest / 100)
                              const monthlyQuote = totalFinanced / plan.number_installments
                              return (
                                <div className="bg-gradient-to-br from-[#C9A961]/15 to-transparent border border-[#C9A961]/30 rounded-xl p-4 space-y-3">
                                  <h5 className="font-bold text-sm text-[#C9A961] uppercase tracking-wider">Simulación del Crédito</h5>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="text-muted-foreground text-xs">Monto Base</p>
                                      <p className="font-semibold">${formatPrice(principal)}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground text-xs">Tasa Ajustada</p>
                                      <p className="font-semibold text-red-400">+{plan.interest_rate}% interés simple</p>
                                    </div>
                                    <div className="border-t border-border/40 pt-2 col-span-2 flex justify-between items-center">
                                      <div>
                                        <p className="text-muted-foreground text-xs">Monto Total Financiado</p>
                                        <p className="text-base font-bold text-[#C9A961]">${formatPrice(totalFinanced)}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-muted-foreground text-xs">Cuota Mensual ({plan.number_installments} meses)</p>
                                        <p className="text-lg font-extrabold text-green-500">${formatPrice(monthlyQuote)}/mes</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })()
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-border/40">
                      <Button variant="outline" onClick={() => setSimStep(2)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Atrás
                      </Button>
                      <Button
                        className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D]"
                        onClick={() => {
                          if (simSaleType === 'financed' && !simFinancingPlanId) {
                            alert('Por favor seleccione un plan de financiamiento.');
                            return;
                          }
                          if (simFinalPrice <= 0) {
                            alert('El precio debe ser mayor a 0.');
                            return;
                          }
                          setSimStep(4);
                        }}
                      >
                        Continuar
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 4: CONFIRMACIÓN */}
                {simStep === 4 && (
                  <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in-50 duration-300">
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold">Resumen de la Transacción</h3>
                      <p className="text-sm text-muted-foreground">Valida los detalles antes de registrar la compra en la base de datos.</p>
                    </div>

                    <div className="divide-y divide-border/40 border border-border/50 rounded-xl bg-white/5 dark:bg-[#121215]/5 overflow-hidden">
                      <div className="p-4 flex items-start gap-4">
                        <div className="w-10 h-10 rounded bg-[#C9A961]/20 flex items-center justify-center text-[#C9A961] flex-shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">Comprador</p>
                          <p className="font-bold text-foreground mt-0.5">
                            {simCustomerType === 'existing'
                              ? (() => {
                                  const c = customers.find(x => x.id_customer.toString() === simSelectedCustomerId)
                                  return c ? `${c.first_name} ${c.last_name} (${c.document})` : 'Desconocido'
                                })()
                              : `${simNewCustomer.first_name} ${simNewCustomer.last_name} (${simNewCustomer.document})`
                            }
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {simCustomerType === 'existing'
                              ? customers.find(x => x.id_customer.toString() === simSelectedCustomerId)?.email
                              : simNewCustomer.email || 'Sin correo electrónico'
                            }
                          </p>
                        </div>
                      </div>

                      <div className="p-4 flex items-start gap-4">
                        <div className="w-10 h-10 rounded bg-[#C9A961]/20 flex items-center justify-center text-[#C9A961] flex-shrink-0">
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">Vehículo Seleccionado</p>
                          {(() => {
                            const vehicle = vehicles.find(v => v.id_vehicle.toString() === simSelectedVehicleId)
                            const brandObj = brands.find(b => b.id_brand === vehicle?.id_brand)
                            const modelObj = models.find(m => m.id_model === vehicle?.id_model)
                            return (
                              <>
                                <p className="font-bold text-foreground mt-0.5">
                                  {brandObj?.name} {modelObj?.name} — {vehicle?.year}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                  Placa: {vehicle?.license_plate} | Serial/VIN: {vehicle?.vehicle_serial}
                                </p>
                              </>
                            )
                          })()}
                        </div>
                      </div>

                      <div className="p-4 flex items-start gap-4">
                        <div className="w-10 h-10 rounded bg-[#C9A961]/20 flex items-center justify-center text-[#C9A961] flex-shrink-0">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div className="flex-1 flex justify-between items-center">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Términos de Pago</p>
                            <p className="font-bold text-foreground mt-0.5">
                              {simSaleType === 'cash'
                                ? `Contado (${simPaymentMethod === 'cash' ? 'Efectivo' : simPaymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'})`
                                : `Financiamiento (${financingPlans.find(p => p.id_financing_plan.toString() === simFinancingPlanId)?.name})`
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Importe Final</p>
                            <p className="text-2xl font-extrabold text-[#C9A961]">${formatPrice(simFinalPrice)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-border/40">
                      <Button variant="outline" onClick={() => setSimStep(3)} disabled={simIsLoading}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Atrás
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                        onClick={handleSimulatePurchase}
                        disabled={simIsLoading}
                      >
                        {simIsLoading ? (
                          <>Procesando...</>
                        ) : (
                          <>
                            Completar Compra y Generar Factura
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 5: CERTIFICADO DE COMPRA / FACTURA */}
                {simStep === 5 && simInvoiceCreated && (
                  <div className="space-y-6 animate-in scale-in duration-300">
                    <div className="text-center space-y-2 print:hidden">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 mx-auto flex items-center justify-center mb-2">
                        <Check className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-extrabold text-foreground">¡Transacción Exitosa!</h3>
                      <p className="text-sm text-muted-foreground">La compra se ha procesado y registrado con éxito en el sistema.</p>
                    </div>

                    {/* OFFICIAL INVOICE CARD */}
                    <div className="border border-border/60 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-xl p-8 max-w-xl mx-auto shadow-xl print:shadow-none print:border-none print:bg-white print:text-black space-y-6 font-sans">
                      {/* Logo and Header */}
                      <div className="flex justify-between items-start border-b border-zinc-200 dark:border-zinc-800 pb-4">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#C9A961] font-black text-xl tracking-wider">CARLIZ</span>
                            <span className="text-xs uppercase bg-[#C9A961]/15 text-[#C9A961] px-1.5 py-0.5 rounded font-bold">Dealership</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1">Caracas, Venezuela. RIF: J-12345678-9</p>
                          <p className="text-[10px] text-zinc-500">contacto@carliz.com | +58 412-1234567</p>
                        </div>
                        <div className="text-right">
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#C9A961]">Certificado de Compra</h4>
                          <p className="text-xs font-mono text-zinc-400 mt-1">Doc. Nº: CLZ-00{simInvoiceCreated.sale.id_vehicle_sale}</p>
                          <p className="text-xs text-zinc-400">Fecha: {simInvoiceCreated.sale.date}</p>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <h5 className="font-bold text-zinc-400 uppercase text-[9px] tracking-wide mb-1">Comprador</h5>
                          <p className="font-bold text-sm">{simInvoiceCreated.customer.first_name} {simInvoiceCreated.customer.last_name}</p>
                          <p className="text-zinc-500 mt-0.5">ID/Doc: {simInvoiceCreated.customer.document}</p>
                          <p className="text-zinc-500">{simInvoiceCreated.customer.phone || 'Sin Teléfono'}</p>
                          <p className="text-zinc-500 truncate">{simInvoiceCreated.customer.email || 'Sin Email'}</p>
                        </div>
                        <div>
                          <h5 className="font-bold text-zinc-400 uppercase text-[9px] tracking-wide mb-1">Vendido por</h5>
                          <p className="font-bold text-sm">CARLIZ Dealership S.A.</p>
                          <p className="text-zinc-500 mt-0.5">Asesor: {currentUser?.first_name || 'Agente de Ventas'}</p>
                        </div>
                      </div>

                      {/* Vehicle specifications table */}
                      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden text-xs">
                        <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-2.5 font-bold flex justify-between">
                          <span>Vehículo Adquirido</span>
                          <span className="font-mono">{simInvoiceCreated.vehicle.license_plate}</span>
                        </div>
                        <div className="p-3 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Marca / Modelo:</span>
                            <span className="font-semibold">{brands.find(b => b.id_brand === simInvoiceCreated.vehicle.id_brand)?.name} {models.find(m => m.id_model === simInvoiceCreated.vehicle.id_model)?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Año de Fabricación / Color:</span>
                            <span className="font-semibold">{simInvoiceCreated.vehicle.year} — {simInvoiceCreated.vehicle.color}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Serial del Motor (VIN):</span>
                            <span className="font-mono text-zinc-600 dark:text-zinc-400 text-[11px]">{simInvoiceCreated.vehicle.vehicle_serial}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Breakdown & Total */}
                      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Tipo de Negocio:</span>
                          <span className="font-semibold capitalize">
                            {simInvoiceCreated.sale.sale_type === 'cash' ? 'Venta de Contado' : 'Crédito Financiado'}
                          </span>
                        </div>
                        {simInvoiceCreated.sale.sale_type === 'financed' && simInvoiceCreated.plan && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Plan de Financiación:</span>
                              <span className="font-semibold">{simInvoiceCreated.plan.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Tasa de Recargo:</span>
                              <span className="font-semibold text-red-500">{simInvoiceCreated.plan.interest_rate}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Estructuración de Plazo:</span>
                              <span className="font-semibold">{simInvoiceCreated.plan.number_installments} Cuotas Mensuales</span>
                            </div>
                          </>
                        )}
                        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2 flex justify-between items-center">
                          <span className="font-bold text-sm">Total Acordado:</span>
                          <span className="font-black text-lg text-[#C9A961]">${formatPrice(simInvoiceCreated.sale.final_price)}</span>
                        </div>
                      </div>

                      {/* Certifications and signatures */}
                      <div className="pt-6 grid grid-cols-2 gap-8 text-center text-[10px] text-zinc-400">
                        <div className="space-y-1">
                          <div className="h-10 flex items-end justify-center border-b border-zinc-200 dark:border-zinc-800">
                            <span className="font-mono text-[9px] text-[#C9A961] opacity-75">CARLIZ DIGITAL STAMP</span>
                          </div>
                          <p>Sello de Autorización</p>
                        </div>
                        <div className="space-y-1">
                          <div className="h-10 flex items-end justify-center border-b border-zinc-200 dark:border-zinc-800">
                            <span className="font-mono text-zinc-300 dark:text-zinc-700 text-[10px]">{simInvoiceCreated.customer.first_name} {simInvoiceCreated.customer.last_name}</span>
                          </div>
                          <p>Firma del Adquiriente</p>
                        </div>
                      </div>

                      {/* Stamp with QR */}
                      <div className="flex justify-between items-center text-[9px] text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                        <div className="flex items-center gap-1.5">
                          <QrCode className="w-8 h-8 text-[#C9A961]" />
                          <div>
                            <p className="font-bold">Certificado Homologado por CARLIZ</p>
                            <p>Escanea para comprobar validez de la firma digital.</p>
                          </div>
                        </div>
                        <p className="font-mono">UUID: CLZ-FS-{simInvoiceCreated.sale.id_vehicle_sale}-1A9C</p>
                      </div>
                    </div>

                    {/* PRINT ACTIONS */}
                    <div className="flex justify-center gap-4 print:hidden">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetSimulator}
                      >
                        Nueva Simulación
                      </Button>
                      <Button
                        type="button"
                        className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] font-bold"
                        onClick={() => window.print()}
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir Certificado
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
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
                  value={formData.id_customer === 0 ? "" : formData.id_customer.toString()} 
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
                  value={formData.id_vehicle === 0 ? "" : formData.id_vehicle.toString()} 
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
        <DialogContent className="sm:max-w-lg">
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
                    <p className="text-2xl font-bold text-[#C9A961]">${formatPrice(viewingSale.final_price)}</p>
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
