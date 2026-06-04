"use client"

import { useState } from 'react'
import { Header } from '@/components/admin/header'
import { useDataStore, FinancingPlan } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Plus, Search, Pencil, Trash2, MoreHorizontal, Percent, Landmark, Calendar, Scale } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

  const filteredPlans = financingPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
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
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Percent className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tasa Promedio</p>
                <p className="text-2xl font-bold">{avgInterestRate}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plazo Máximo</p>
                <p className="text-2xl font-bold">{maxInstallments} meses</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Scale className="w-6 h-6 text-purple-600" />
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
              <Button onClick={() => handleOpenDialog()} className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Plans Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Nombre del Plan</TableHead>
                  <TableHead>Tasa de Interés Anual</TableHead>
                  <TableHead>Cantidad de Cuotas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No se encontraron planes de financiamiento
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlans.map(plan => (
                    <TableRow key={plan.id_financing_plan} className="hover:bg-muted/30">
                      <TableCell className="font-mono">#{plan.id_financing_plan.toString().padStart(3, '0')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#C9A961]/20 flex items-center justify-center">
                            <Percent className="w-5 h-5 text-[#C9A961]" />
                          </div>
                          <span className="font-medium">{plan.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-blue-600 dark:text-blue-400">
                        {plan.interest_rate}%
                      </TableCell>
                      <TableCell>
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                          {plan.number_installments} cuotas
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(plan)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(plan.id_financing_plan)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
