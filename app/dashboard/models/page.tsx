"use client"

import { useState } from 'react'
import { Header } from '@/components/admin/header'
import { useDataStore, Model, GeneralStatus, FuelType, TransmissionType, BodyType } from '@/lib/store'
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
import { Plus, Search, Pencil, Trash2, MoreHorizontal, Building2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function ModelsPage() {
  const { models, brands, addModel, updateModel, deleteModel } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [brandFilter, setBrandFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<Model | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    id_brand: 0,
    description: '',
    launch_year: new Date().getFullYear(),
    fuel_type: 'gasoline' as FuelType,
    engine_displacement: 0,
    transmission: 'automatic' as TransmissionType,
    number_doors: 4,
    passenger_capacity: 5,
    body_type: 'sedan' as BodyType,
    status: 'active' as GeneralStatus,
  })

  const filteredModels = models.filter(model => {
    const brand = brands.find(b => b.id_brand === model.id_brand)
    const matchesSearch = 
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBrand = brandFilter === 'all' || model.id_brand.toString() === brandFilter
    return matchesSearch && matchesBrand
  })

  const handleOpenDialog = (model?: Model) => {
    if (model) {
      setEditingModel(model)
      setFormData({
        name: model.name,
        id_brand: model.id_brand,
        description: model.description,
        launch_year: model.launch_year,
        fuel_type: model.fuel_type,
        engine_displacement: model.engine_displacement,
        transmission: model.transmission,
        number_doors: model.number_doors,
        passenger_capacity: model.passenger_capacity,
        body_type: model.body_type,
        status: model.status,
      })
    } else {
      setEditingModel(null)
      setFormData({
        name: '',
        id_brand: 0,
        description: '',
        launch_year: new Date().getFullYear(),
        fuel_type: 'gasoline',
        engine_displacement: 0,
        transmission: 'automatic',
        number_doors: 4,
        passenger_capacity: 5,
        body_type: 'sedan',
        status: 'active',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingModel) {
      updateModel(editingModel.id_model, formData)
    } else {
      addModel(formData)
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este modelo?')) {
      deleteModel(id)
    }
  }

  const fuelTypeLabels: Record<FuelType, string> = {
    gasoline: 'Gasolina',
    diesel: 'Diésel',
    electric: 'Eléctrico',
    hybrid: 'Híbrido',
    gas: 'Gas',
  }

  const transmissionLabels: Record<TransmissionType, string> = {
    manual: 'Manual',
    automatic: 'Automático',
    cvt: 'CVT',
  }

  const bodyTypeLabels: Record<BodyType, string> = {
    sedan: 'Sedán',
    hatchback: 'Hatchback',
    suv: 'SUV',
    pickup: 'Pickup',
    coupe: 'Coupé',
    convertible: 'Convertible',
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Gestión de Modelos" 
        description="Administra los modelos de vehículos"
      />
      
      <div className="p-6 space-y-6">
        {/* Search and Actions */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={brandFilter} onValueChange={setBrandFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Marca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las marcas</SelectItem>
                    {brands.map(brand => (
                      <SelectItem key={brand.id_brand} value={brand.id_brand.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => handleOpenDialog()} className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Modelo
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
                  <TableHead>Modelo</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Combustible</TableHead>
                  <TableHead>Transmisión</TableHead>
                  <TableHead>Año</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron modelos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredModels.map(model => {
                    const brand = brands.find(b => b.id_brand === model.id_brand)
                    return (
                      <TableRow key={model.id_model} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#1A1F3D]/20 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-[#1A1F3D]" />
                            </div>
                            <span className="font-medium">{model.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{brand?.name}</TableCell>
                        <TableCell>{bodyTypeLabels[model.body_type]}</TableCell>
                        <TableCell>{fuelTypeLabels[model.fuel_type]}</TableCell>
                        <TableCell>{transmissionLabels[model.transmission]}</TableCell>
                        <TableCell>{model.launch_year}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDialog(model)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(model.id_model)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingModel ? 'Editar Modelo' : 'Nuevo Modelo'}
            </DialogTitle>
            <DialogDescription>
              {editingModel ? 'Modifica los datos del modelo' : 'Completa los datos para registrar un nuevo modelo'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_brand">Marca</Label>
                <Select 
                  value={formData.id_brand.toString()} 
                  onValueChange={(v) => setFormData({ ...formData, id_brand: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(brand => (
                      <SelectItem key={brand.id_brand} value={brand.id_brand.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body_type">Tipo de Carrocería</Label>
                <Select 
                  value={formData.body_type} 
                  onValueChange={(v) => setFormData({ ...formData, body_type: v as BodyType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(bodyTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuel_type">Tipo de Combustible</Label>
                <Select 
                  value={formData.fuel_type} 
                  onValueChange={(v) => setFormData({ ...formData, fuel_type: v as FuelType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(fuelTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transmission">Transmisión</Label>
                <Select 
                  value={formData.transmission} 
                  onValueChange={(v) => setFormData({ ...formData, transmission: v as TransmissionType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(transmissionLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="launch_year">Año de Lanzamiento</Label>
                <Input
                  id="launch_year"
                  type="number"
                  value={formData.launch_year}
                  onChange={(e) => setFormData({ ...formData, launch_year: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number_doors">Número de Puertas</Label>
                <Input
                  id="number_doors"
                  type="number"
                  value={formData.number_doors}
                  onChange={(e) => setFormData({ ...formData, number_doors: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passenger_capacity">Capacidad de Pasajeros</Label>
                <Input
                  id="passenger_capacity"
                  type="number"
                  value={formData.passenger_capacity}
                  onChange={(e) => setFormData({ ...formData, passenger_capacity: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D]">
                {editingModel ? 'Guardar Cambios' : 'Crear Modelo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
