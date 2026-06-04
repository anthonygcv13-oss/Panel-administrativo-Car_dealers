"use client"

import { useState } from 'react'
import { Header } from '@/components/admin/header'
import { useDataStore, Vehicle, VehicleStatus } from '@/lib/store'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Car,
  Filter,
  MoreHorizontal,
  Eye,
  Image,
  Star
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function VehiclesPage() {
  const { 
    vehicles, 
    brands, 
    models, 
    suppliers, 
    vehicleImages,
    addVehicle, 
    updateVehicle, 
    deleteVehicle,
    addVehicleImage,
    updateVehicleImage,
    deleteVehicleImage
  } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [brandFilter, setBrandFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isImagesDialogOpen, setIsImagesDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null)
  const [selectedVehicleForImages, setSelectedVehicleForImages] = useState<Vehicle | null>(null)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [formData, setFormData] = useState({
    license_plate: '',
    vehicle_serial: '',
    engine_serial: '',
    body_serial: '',
    manufacture_date: '',
    purchase_date: '',
    mileage: 0,
    color: '',
    id_model: 0,
    id_brand: 0,
    year: new Date().getFullYear(),
    status: 'available' as VehicleStatus,
    purchase_price: 0,
    sale_price: 0,
    id_supplier: 0,
  })

  const filteredVehicles = vehicles.filter(vehicle => {
    const brand = brands.find(b => b.id_brand === vehicle.id_brand)
    const model = models.find(m => m.id_model === vehicle.id_model)
    const matchesSearch = 
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.color.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter
    const matchesBrand = brandFilter === 'all' || vehicle.id_brand.toString() === brandFilter
    return matchesSearch && matchesStatus && matchesBrand
  })

  const handleOpenDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle)
      setFormData({
        license_plate: vehicle.license_plate,
        vehicle_serial: vehicle.vehicle_serial,
        engine_serial: vehicle.engine_serial,
        body_serial: vehicle.body_serial,
        manufacture_date: vehicle.manufacture_date,
        purchase_date: vehicle.purchase_date,
        mileage: vehicle.mileage,
        color: vehicle.color,
        id_model: vehicle.id_model,
        id_brand: vehicle.id_brand,
        year: vehicle.year,
        status: vehicle.status,
        purchase_price: vehicle.purchase_price,
        sale_price: vehicle.sale_price,
        id_supplier: vehicle.id_supplier || 0,
      })
    } else {
      setEditingVehicle(null)
      setFormData({
        license_plate: '',
        vehicle_serial: '',
        engine_serial: '',
        body_serial: '',
        manufacture_date: '',
        purchase_date: '',
        mileage: 0,
        color: '',
        id_model: 0,
        id_brand: 0,
        year: new Date().getFullYear(),
        status: 'available',
        purchase_price: 0,
        sale_price: 0,
        id_supplier: 0,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingVehicle) {
      updateVehicle(editingVehicle.id_vehicle, formData)
    } else {
      addVehicle(formData)
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este vehículo?')) {
      deleteVehicle(id)
    }
  }

  const handleView = (vehicle: Vehicle) => {
    setViewingVehicle(vehicle)
    setIsViewDialogOpen(true)
  }

  const handleOpenImagesDialog = (vehicle: Vehicle) => {
    setSelectedVehicleForImages(vehicle)
    setNewImageUrl('')
    setIsImagesDialogOpen(true)
  }

  const handleSetPrimaryImage = async (img: any) => {
    try {
      await updateVehicleImage(img.id_vehicle_image, { is_primary: true })
      
      const siblingImages = vehicleImages.filter(i => i.id_vehicle === img.id_vehicle && i.id_vehicle_image !== img.id_vehicle_image)
      for (const sibling of siblingImages) {
        if (sibling.is_primary) {
          await updateVehicleImage(sibling.id_vehicle_image, { is_primary: false })
        }
      }
    } catch (error) {
      console.error("Error setting primary image:", error)
    }
  }

  const getStatusBadge = (status: VehicleStatus) => {
    const styles = {
      available: 'bg-green-100 text-green-700 border-green-200',
      sold: 'bg-red-100 text-red-700 border-red-200',
      maintenance: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    }
    const labels = {
      available: 'Disponible',
      sold: 'Vendido',
      maintenance: 'Mantenimiento',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const filteredModels = models.filter(m => m.id_brand === formData.id_brand)

  return (
    <div className="min-h-screen">
      <Header 
        title="Gestión de Vehículos" 
        description="Administra el inventario de vehículos"
      />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Car className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disponibles</p>
                <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'available').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <Car className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendidos</p>
                <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'sold').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Car className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Mantenimiento</p>
                <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'maintenance').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#C9A961]/20 flex items-center justify-center">
                <Car className="w-6 h-6 text-[#C9A961]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{vehicles.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </CardTitle>
              <Button onClick={() => handleOpenDialog()} className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D]">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Vehículo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por placa, marca, modelo o color..."
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
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="sold">Vendido</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
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
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Placa</TableHead>
                  <TableHead>Marca / Modelo</TableHead>
                  <TableHead>Año</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Kilometraje</TableHead>
                  <TableHead>Precio Venta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No se encontraron vehículos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map(vehicle => {
                    const brand = brands.find(b => b.id_brand === vehicle.id_brand)
                    const model = models.find(m => m.id_model === vehicle.id_model)
                    
                    const primaryImg = vehicleImages.find(img => img.id_vehicle === vehicle.id_vehicle && img.is_primary)
                    const fallbackImg = vehicleImages.find(img => img.id_vehicle === vehicle.id_vehicle)
                    const vehicleImg = primaryImg || fallbackImg

                    return (
                      <TableRow key={vehicle.id_vehicle} className="hover:bg-muted/30">
                        <TableCell className="font-mono font-medium">{vehicle.license_plate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {vehicleImg ? (
                              <img src={vehicleImg.url} alt="Vehículo" className="w-12 h-12 rounded-lg object-cover bg-muted border border-border" />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-[#C9A961]/10 flex items-center justify-center border border-[#C9A961]/20">
                                <Car className="w-6 h-6 text-[#C9A961]" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{brand?.name}</p>
                              <p className="text-sm text-muted-foreground">{model?.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{vehicle.year}</TableCell>
                        <TableCell>{vehicle.color}</TableCell>
                        <TableCell>{vehicle.mileage.toLocaleString()} km</TableCell>
                        <TableCell className="font-medium text-[#C9A961]">
                          ${vehicle.sale_price.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(vehicle)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenImagesDialog(vehicle)}>
                                <Image className="w-4 h-4 mr-2" />
                                Gestionar imágenes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenDialog(vehicle)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(vehicle.id_vehicle)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
            </DialogTitle>
            <DialogDescription>
              {editingVehicle ? 'Modifica los datos del vehículo' : 'Completa los datos para registrar un nuevo vehículo'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="license_plate">Placa</Label>
                <Input
                  id="license_plate"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_brand">Marca</Label>
                <Select 
                  value={formData.id_brand.toString()} 
                  onValueChange={(v) => setFormData({ ...formData, id_brand: parseInt(v), id_model: 0 })}
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
              <div className="space-y-2">
                <Label htmlFor="id_model">Modelo</Label>
                <Select 
                  value={formData.id_model.toString()} 
                  onValueChange={(v) => setFormData({ ...formData, id_model: parseInt(v) })}
                  disabled={!formData.id_brand}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredModels.map(model => (
                      <SelectItem key={model.id_model} value={model.id_model.toString()}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Año</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Kilometraje</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_serial">Serial del Vehículo</Label>
                <Input
                  id="vehicle_serial"
                  value={formData.vehicle_serial}
                  onChange={(e) => setFormData({ ...formData, vehicle_serial: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="engine_serial">Serial del Motor</Label>
                <Input
                  id="engine_serial"
                  value={formData.engine_serial}
                  onChange={(e) => setFormData({ ...formData, engine_serial: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body_serial">Serial de Carrocería</Label>
                <Input
                  id="body_serial"
                  value={formData.body_serial}
                  onChange={(e) => setFormData({ ...formData, body_serial: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacture_date">Fecha de Fabricación</Label>
                <Input
                  id="manufacture_date"
                  type="date"
                  value={formData.manufacture_date}
                  onChange={(e) => setFormData({ ...formData, manufacture_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase_date">Fecha de Compra</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_supplier">Proveedor</Label>
                <Select 
                  value={formData.id_supplier.toString()} 
                  onValueChange={(v) => setFormData({ ...formData, id_supplier: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id_supplier} value={supplier.id_supplier.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase_price">Precio de Compra ($)</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale_price">Precio de Venta ($)</Label>
                <Input
                  id="sale_price"
                  type="number"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData({ ...formData, status: v as VehicleStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="sold">Vendido</SelectItem>
                    <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D]">
                {editingVehicle ? 'Guardar Cambios' : 'Crear Vehículo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles del Vehículo</DialogTitle>
          </DialogHeader>
          {viewingVehicle && (() => {
            const currentVehicleImages = vehicleImages.filter(img => img.id_vehicle === viewingVehicle.id_vehicle)
            const primaryImage = currentVehicleImages.find(img => img.is_primary) || currentVehicleImages[0]
            const remainingImages = currentVehicleImages.filter(img => img.id_vehicle_image !== primaryImage?.id_vehicle_image)
            return (
              <div className="space-y-6">
                {/* Image Gallery */}
                {currentVehicleImages.length > 0 && (
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border">
                      <img 
                        src={primaryImage.url} 
                        alt="Vista principal" 
                        className="w-full h-full object-cover" 
                      />
                      {primaryImage.is_primary && (
                        <span className="absolute top-3 left-3 bg-[#C9A961] text-[#2D2D2D] px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm">
                          Principal
                        </span>
                      )}
                    </div>
                    {remainingImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {remainingImages.map(img => (
                          <div key={img.id_vehicle_image} className="aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                            <img src={img.url} alt="Vista adicional" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">Placa</p>
                    <p className="font-mono font-medium">{viewingVehicle.license_plate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    {getStatusBadge(viewingVehicle.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Marca</p>
                    <p className="font-medium">{brands.find(b => b.id_brand === viewingVehicle.id_brand)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Modelo</p>
                    <p className="font-medium">{models.find(m => m.id_model === viewingVehicle.id_model)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Año</p>
                    <p className="font-medium">{viewingVehicle.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Color</p>
                    <p className="font-medium">{viewingVehicle.color}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kilometraje</p>
                    <p className="font-medium">{viewingVehicle.mileage.toLocaleString()} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Precio de Venta</p>
                    <p className="font-medium text-[#C9A961]">${viewingVehicle.sale_price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Serial Vehículo</p>
                    <p className="font-mono text-sm">{viewingVehicle.vehicle_serial}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Serial Motor</p>
                    <p className="font-mono text-sm">{viewingVehicle.engine_serial}</p>
                  </div>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Manage Images Dialog */}
      <Dialog open={isImagesDialogOpen} onOpenChange={setIsImagesDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestionar Imágenes del Vehículo</DialogTitle>
            <DialogDescription>
              Añade, elimina o selecciona la imagen principal del vehículo con placa{' '}
              <span className="font-mono font-bold text-foreground">
                {selectedVehicleForImages?.license_plate}
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Form to Add New Image URL */}
            <form 
              onSubmit={async (e) => {
                e.preventDefault()
                if (!newImageUrl.trim() || !selectedVehicleForImages) return
                setIsImageLoading(true)
                try {
                  const siblingImages = vehicleImages.filter(img => img.id_vehicle === selectedVehicleForImages.id_vehicle)
                  const isPrimary = siblingImages.length === 0
                  await addVehicleImage({
                    id_vehicle: selectedVehicleForImages.id_vehicle,
                    url: newImageUrl.trim(),
                    is_primary: isPrimary,
                    display_order: siblingImages.length
                  })
                  setNewImageUrl('')
                } catch (error) {
                  console.error("Error adding vehicle image:", error)
                } finally {
                  setIsImageLoading(false)
                }
              }}
              className="flex gap-2 items-end"
            >
              <div className="flex-1 space-y-2">
                <Label htmlFor="new_image_url">Nueva URL de Imagen</Label>
                <Input
                  id="new_image_url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isImageLoading} 
                className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] font-medium"
              >
                {isImageLoading ? 'Añadiendo...' : 'Añadir'}
              </Button>
            </form>

            {/* List of Current Images */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Imágenes actuales</h3>
              {selectedVehicleForImages && vehicleImages.filter(img => img.id_vehicle === selectedVehicleForImages.id_vehicle).length === 0 ? (
                <div className="text-center py-8 rounded-xl border border-dashed border-border text-muted-foreground text-sm">
                  Este vehículo aún no tiene imágenes asociadas
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pr-1">
                  {selectedVehicleForImages && 
                    vehicleImages
                      .filter(img => img.id_vehicle === selectedVehicleForImages.id_vehicle)
                      .map((img) => (
                        <div 
                          key={img.id_vehicle_image} 
                          className={`relative group rounded-xl overflow-hidden border bg-muted transition-all duration-300 ${
                            img.is_primary 
                              ? 'border-[#C9A961] ring-2 ring-[#C9A961]/20 shadow-md' 
                              : 'border-border hover:border-muted-foreground'
                          }`}
                        >
                          <img 
                            src={img.url} 
                            alt="Imagen del vehículo" 
                            className="aspect-video w-full object-cover" 
                          />
                          {/* Image Actions Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {!img.is_primary && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-[#C9A961] hover:text-[#D4B978] hover:bg-white/10"
                                onClick={() => handleSetPrimaryImage(img)}
                                title="Establecer como principal"
                              >
                                <Star className="h-4 w-4 text-[#C9A961]" />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-white/10"
                              onClick={async () => {
                                if (confirm('¿Estás seguro de eliminar esta imagen?')) {
                                  try {
                                    await deleteVehicleImage(img.id_vehicle_image)
                                    if (img.is_primary) {
                                      const remaining = vehicleImages.filter(
                                        i => i.id_vehicle === img.id_vehicle && i.id_vehicle_image !== img.id_vehicle_image
                                      )
                                      if (remaining.length > 0) {
                                        await updateVehicleImage(remaining[0].id_vehicle_image, { is_primary: true })
                                      }
                                    }
                                  } catch (error) {
                                    console.error("Error deleting image:", error)
                                  }
                                }
                              }}
                              title="Eliminar imagen"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {img.is_primary && (
                            <span className="absolute top-2 left-2 bg-[#C9A961] text-[#2D2D2D] px-2 py-0.5 rounded-full text-[10px] font-bold">
                              Principal
                            </span>
                          )}
                        </div>
                      ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsImagesDialogOpen(false)} className="bg-muted hover:bg-muted/80 text-foreground border border-border">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
