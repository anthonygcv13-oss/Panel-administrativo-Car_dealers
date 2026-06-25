"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/admin/header'
import { useDataStore, FinancingPlan } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Search, Pencil, Trash2, MoreHorizontal, Percent, Landmark, Calendar, Scale } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdminPagination } from '@/components/admin/pagination'

export default function FinancingPlansPage() {
  const { financingPlans, addFinancingPlan, updateFinancingPlan, deleteFinancingPlan } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<FinancingPlan | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    interest_rate: 0,
    number_installments: 1,
  })

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const filteredPlans = financingPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage)
  const paginatedPlans = filteredPlans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Statistics calculations
  const totalPlans = financingPlans.length
  const avgInterestRate = totalPlans > 0
    ? (financingPlans.reduce((acc, p) => acc + Number(p.interest_rate), 0) / totalPlans).toFixed(2)
    : '0.00'
  
  const installmentsList = financingPlans.map(p => p.number_installments)
  const maxInstallments = installmentsList.length > 0 ? Math.max(...installmentsList) : 0
  const minInstallments = installmentsList.length > 0 ? Math.min(...installmentsList) : 0

  const handleOpenDialog = (plan?: FinancingPlan) => {
    setErrorMessage(null)
    if (plan) {
      setEditingPlan(plan)
      setFormData({
        name: plan.name,
        interest_rate: Number(plan.interest_rate),
        number_installments: plan.number_installments,
      })
    } else {
      setEditingPlan(null)
      setFormData({
        name: '',
        interest_rate: 0,
        number_installments: 12,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    try {
      if (editingPlan) {
        await updateFinancingPlan(editingPlan.id_financing_plan, formData)
      } else {
        await addFinancingPlan(formData)
      }
      setIsDialogOpen(false)
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocurrió un error al guardar el plan de financiamiento.')
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este plan de financiamiento?')) {
      try {
        await deleteFinancingPlan(id)
      } catch (err: any) {
        alert(err.message || 'No se pudo eliminar el plan de financiamiento. Es posible que esté asociado a una o más ventas activas.')
      }
    }
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Planes de Financiamiento" 
        description="Administra los planes y opciones de crédito para los clientes"
      />
      
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#C9A961]/20 flex items-center justify-center">
                <Landmark className="w-6 h-6 text-[#C9A961]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Planes</p>
                <p className="text-2xl font-bold">{totalPlans}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center dark:bg-blue-950/20">
                <Percent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tasa Promedio</p>
                <p className="text-2xl font-bold">{avgInterestRate}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center dark:bg-green-950/20">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plazo Máximo</p>
                <p className="text-2xl font-bold">{maxInstallments} meses</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center dark:bg-purple-950/20">
                <Scale className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plazo Mínimo</p>
                <p className="text-2xl font-bold">{totalPlans > 0 ? minInstallments : 0} meses</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Action Button */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar plan por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => handleOpenDialog()} className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] w-full md:w-auto font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Plans Card Grid */}
        {paginatedPlans.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Landmark className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-lg font-medium">No se encontraron planes de financiamiento</p>
              <p className="text-sm">Intenta buscar con otros términos.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPlans.map((plan) => (
                <Card 
                  key={plan.id_financing_plan} 
                  className="bg-white/80 dark:bg-[#121215]/80 border border-border/50 hover:border-[#C9A961]/50 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#C9A961]/10 dark:bg-[#C9A961]/20 flex items-center justify-center border border-[#C9A961]/20 group-hover:scale-105 transition-transform">
                          <Percent className="w-6 h-6 text-[#C9A961]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-foreground group-hover:text-[#C9A961] transition-colors">
                            {plan.name}
                          </h3>
                          <span className="text-xs font-mono text-muted-foreground">ID: #{plan.id_financing_plan.toString().padStart(3, '0')}</span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleOpenDialog(plan)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(plan.id_financing_plan)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Rates and installments */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/40 text-center">
                      <div className="bg-muted/30 dark:bg-muted/10 p-3 rounded-xl border border-border/20">
                        <span className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Tasa Anual</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {plan.interest_rate}%
                        </span>
                      </div>
                      <div className="bg-muted/30 dark:bg-muted/10 p-3 rounded-xl border border-border/20">
                        <span className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Plazo</span>
                        <span className="text-lg font-bold text-foreground">
                          {plan.number_installments} cuotas
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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

      {/* Dialog for Create/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Editar Plan de Financiamiento' : 'Nuevo Plan de Financiamiento'}
            </DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Modifica las condiciones del plan de financiamiento.' : 'Registra las condiciones para un nuevo plan de financiamiento.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {errorMessage && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                  {errorMessage}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Plan</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Plan Clásico 24 meses"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interest_rate">Tasa de Interés (%)</Label>
                  <Input
                    id="interest_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.interest_rate}
                    onChange={(e) => setFormData({ ...formData, interest_rate: parseFloat(e.target.value) || 0 })}
                    placeholder="Ej. 12.5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number_installments">Número de Cuotas</Label>
                  <Input
                    id="number_installments"
                    type="number"
                    min="1"
                    value={formData.number_installments}
                    onChange={(e) => setFormData({ ...formData, number_installments: parseInt(e.target.value) || 1 })}
                    placeholder="Ej. 24"
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D]">
                {editingPlan ? 'Guardar Cambios' : 'Crear Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
