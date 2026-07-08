"use client"

import { useState, useEffect } from 'react'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Search, Pencil, Trash2, MoreHorizontal, Building2, Calendar, Fuel, Cog, Car } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdminPagination } from '@/components/admin/pagination'

export default function ModelsPage({ hideHeader = false }: { hideHeader?: boolean } = {}) {
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, brandFilter])

  const filteredModels = models.filter(model => {
    const brand = brands.find(b => b.id_brand === model.id_brand)
    const matchesSearch = 
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBrand = brandFilter === 'all' || model.id_brand.toString() === brandFilter
    return matchesSearch && matchesBrand
  })

  const totalPages = Math.ceil(filteredModels.length / itemsPerPage)
  const paginatedModels = filteredModels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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

  const getStatusBadge = (status: GeneralStatus) => {
    return status === 'active' ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
        Activo
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
        Inactivo
      </span>
    )
  }

  return (
    <div className={hideHeader ? "" : "min-h-screen"}>
      {!hideHeader && (
        <Header 
          title="Gestión de Modelos" 
          description="Administra los modelos de vehículos"
        />
      )}
      
      <div className={hideHeader ? "space-y-6" : "p-6 space-y-6"}>
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
              <Button onClick={() => handleOpenDialog()} className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] w-full md:w-auto font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Modelo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card Grid */}
        {paginatedModels.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Building2 className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-lg font-medium">No se encontraron modelos</p>
              <p className="text-sm">Intenta buscar con otros términos.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedModels.map((model) => {
                const brand = brands.find(b => b.id_brand === model.id_brand)
                return (
                  <Card 
                    key={model.id_model} 
                    className="bg-white/80 dark:bg-[#121215]/80 border border-border/50 hover:border-[#C9A961]/50 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                  >
                    <CardContent className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#1A1F3D]/10 dark:bg-[#C9A961]/25 flex items-center justify-center border border-[#1A1F3D]/20 group-hover:scale-105 transition-transform">
                            <Building2 className="w-6 h-6 text-[#1A1F3D] dark:text-[#C9A961]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-foreground group-hover:text-[#C9A961] transition-colors">
                              {model.name}
                            </h3>
                            <span className="text-xs text-muted-foreground font-medium">{brand?.name || 'Sin marca'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusBadge(model.status)}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => handleOpenDialog(model)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(model.id_model)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Description */}
                      {model.description && (
                        <p className="text-sm text-muted-foreground/80 line-clamp-2 bg-muted/20 dark:bg-muted/10 p-3 rounded-lg border border-border/20">
                          {model.description}
                        </p>
                      )}

                      {/* Specs info */}
                      <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 pt-3 border-t border-border/40 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Car className="w-4 h-4 text-[#C9A961] flex-shrink-0" />
                          <span>{bodyTypeLabels[model.body_type]}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Fuel className="w-4 h-4 text-[#C9A961] flex-shrink-0" />
                          <span>{fuelTypeLabels[model.fuel_type]}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Cog className="w-4 h-4 text-[#C9A961] flex-shrink-0" />
                          <span>{transmissionLabels[model.transmission]}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4 text-[#C9A961] flex-shrink-0" />
                          <span>Lanzamiento: {model.launch_year}</span>
                        </div>
                      </div>

                      {/* Specs: capacity and engine */}
                      <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground/80 border-t border-border/20">
                        <span>Cilindrada: {model.engine_displacement}L</span>
                        <span>{model.number_doors}p / {model.passenger_capacity} asientos</span>
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
        <DialogContent className="sm:max-w-xl">
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
