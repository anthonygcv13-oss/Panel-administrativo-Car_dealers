"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/admin/header'
import { useDataStore, Vehicle, VehicleStatus } from '@/lib/store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BrandsPage from '@/app/dashboard/brands/page'
import ModelsPage from '@/app/dashboard/models/page'
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
  Star,
  Video,
  Play
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdminPagination } from '@/components/admin/pagination'

const getYoutubeEmbedUrl = (url: string) => {
  if (!url) return ''
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=1`
  }
  return ''
}

const isYoutubeUrl = (url: string) => {
  return getYoutubeEmbedUrl(url) !== ''
}

export default function VehiclesPage() {
  const { 
    vehicles, 
    brands, 
    models, 
    suppliers, 
    vehicleImages,
    vehicleVideos,
    addVehicle, 
    updateVehicle, 
    deleteVehicle,
    addVehicleImage,
    updateVehicleImage,
    deleteVehicleImage,
    addVehicleVideo,
    updateVehicleVideo,
    deleteVehicleVideo
  } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [brandFilter, setBrandFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isImagesDialogOpen, setIsImagesDialogOpen] = useState(false)
  const [isVideosDialogOpen, setIsVideosDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null)
  const [selectedVehicleForImages, setSelectedVehicleForImages] = useState<Vehicle | null>(null)
  const [selectedVehicleForVideos, setSelectedVehicleForVideos] = useState<Vehicle | null>(null)
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [newImagePreview, setNewImagePreview] = useState('')
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [isVideoLoading, setIsVideoLoading] = useState(false)
  const [playingVideoId, setPlayingVideoId] = useState<number | null>(null)
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, brandFilter])

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

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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
    setNewImageFile(null)
    setNewImagePreview('')
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

  const handleOpenVideosDialog = (vehicle: Vehicle) => {
    setSelectedVehicleForVideos(vehicle)
    setNewVideoUrl('')
    setPlayingVideoId(null)
    setIsVideosDialogOpen(true)
  }

  const handleSetPrimaryVideo = async (vid: any) => {
    try {
      await updateVehicleVideo(vid.id_vehicle_video, { is_primary: true })
      
      const siblingVideos = vehicleVideos.filter(i => i.id_vehicle === vid.id_vehicle && i.id_vehicle_video !== vid.id_vehicle_video)
      for (const sibling of siblingVideos) {
        if (sibling.is_primary) {
          await updateVehicleVideo(sibling.id_vehicle_video, { is_primary: false })
        }
      }
    } catch (error) {
      console.error("Error setting primary video:", error)
    }
  }

  const getStatusBadge = (status: VehicleStatus) => {
    const styles = {
      available: 'bg-green-55 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800',
      sold: 'bg-red-55 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800',
      maintenance: 'bg-yellow-55 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800',
    }
    const labels = {
      available: 'Disponible',
      sold: 'Vendido',
      maintenance: 'Mantenimiento',
    }
    return (
      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const filteredModels = models.filter(m => m.id_brand === formData.id_brand)

  return (
    <div className="min-h-screen">
      <Header 
        title="Inventario y Catálogo" 
        description="Administra los vehículos, modelos y marcas"
      />
      
      <div className="p-6">
        <Tabs defaultValue="vehicles" className="space-y-6">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="vehicles">Vehículos / Stock</TabsTrigger>
            <TabsTrigger value="models">Modelos</TabsTrigger>
            <TabsTrigger value="brands">Marcas</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="space-y-6 mt-0">
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

        {/* Vehicles Card Grid */}
        {paginatedVehicles.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Car className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-lg font-medium">No se encontraron vehículos</p>
              <p className="text-sm">Intenta buscar con otros términos o filtros.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedVehicles.map((vehicle) => {
                const brand = brands.find(b => b.id_brand === vehicle.id_brand)
                const model = models.find(m => m.id_model === vehicle.id_model)
                
                const primaryImg = vehicleImages.find(img => img.id_vehicle === vehicle.id_vehicle && img.is_primary)
                const fallbackImg = vehicleImages.find(img => img.id_vehicle === vehicle.id_vehicle)
                const vehicleImg = primaryImg || fallbackImg

                return (
                  <Card 
                    key={vehicle.id_vehicle} 
                    className="bg-white/80 dark:bg-[#121215]/80 border border-border/50 hover:border-[#C9A961]/50 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Card Image Area */}
                      <div className="relative aspect-video w-full overflow-hidden bg-muted border-b border-border/40">
                        {vehicleImg ? (
                          <img 
                            src={vehicleImg.url} 
                            alt="Vehículo" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/30 flex items-center justify-center">
                            <Car className="w-12 h-12 text-[#C9A961]/30 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                        )}
                        
                        {/* Badges on image */}
                        <span className="absolute top-3 left-3 bg-[#1A1F3D]/90 dark:bg-[#121215]/95 text-[#C9A961] px-2.5 py-0.5 rounded text-xs font-mono font-bold shadow-md border border-[#C9A961]/35 uppercase">
                          {vehicle.license_plate}
                        </span>
                        <div className="absolute top-3 right-3">
                          {getStatusBadge(vehicle.status)}
                        </div>
                      </div>

                      <CardContent className="p-5 space-y-4">
                        {/* Title & Actions */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg text-foreground group-hover:text-[#C9A961] transition-colors leading-tight">
                              {brand?.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5 font-medium">{model?.name}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted flex-shrink-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => handleView(vehicle)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenImagesDialog(vehicle)}>
                                <Image className="w-4 h-4 mr-2" />
                                Gestionar imágenes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenVideosDialog(vehicle)}>
                                <Video className="w-4 h-4 mr-2" />
                                Gestionar videos
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenDialog(vehicle)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(vehicle.id_vehicle)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Vehicle Details */}
                        <div className="grid grid-cols-2 gap-3 text-sm pt-2.5 border-t border-border/40">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Año / Color</span>
                            <span className="font-medium text-foreground truncate mt-0.5">{vehicle.year} • {vehicle.color}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Kilometraje</span>
                            <span className="font-medium text-foreground mt-0.5">{vehicle.mileage.toLocaleString()} km</span>
                          </div>
                        </div>

                        {/* Price section */}
                        <div className="pt-2.5 border-t border-border/40 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Precio Venta</span>
                          <span className="text-xl font-bold text-[#C9A961]">${formatPrice(vehicle.sale_price)}</span>
                        </div>
                      </CardContent>
                    </div>
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
          <TabsContent value="models" className="mt-0">
            <ModelsPage hideHeader={true} />
          </TabsContent>
          <TabsContent value="brands" className="mt-0">
            <BrandsPage hideHeader={true} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
                    <p className="font-medium text-[#C9A961]">${formatPrice(viewingVehicle.sale_price)}</p>
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
                if (!newImageFile || !selectedVehicleForImages) return
                setIsImageLoading(true)
                try {
                  const siblingImages = vehicleImages.filter(img => img.id_vehicle === selectedVehicleForImages.id_vehicle)
                  const isPrimary = siblingImages.length === 0
                  await addVehicleImage({
                    id_vehicle: selectedVehicleForImages.id_vehicle,
                    image: newImageFile,
                    url: '',
                    is_primary: isPrimary,
                    display_order: siblingImages.length
                  })
                  setNewImageFile(null)
                  setNewImagePreview('')
                  if (typeof document !== 'undefined') {
                    const fileInput = document.getElementById('new_image_file') as HTMLInputElement | null
                    if (fileInput) fileInput.value = ''
                  }
                } catch (error) {
                  console.error("Error adding vehicle image:", error)
                } finally {
                  setIsImageLoading(false)
                }
              }}
              className="flex gap-2 items-end"
            >
              <div className="flex-1 space-y-2">
                <Label htmlFor="new_image_file">Nueva Imagen</Label>
                <Input
                  id="new_image_file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    setNewImageFile(file)
                    setNewImagePreview(file ? URL.createObjectURL(file) : '')
                  }}
                  required
                />
                {newImagePreview && (
                  <div className="rounded-lg border border-border overflow-hidden bg-muted/20">
                    <img src={newImagePreview} alt="Vista previa" className="h-24 w-full object-cover" />
                  </div>
                )}
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
      {/* Manage Videos Dialog */}
      <Dialog open={isVideosDialogOpen} onOpenChange={setIsVideosDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestionar Videos del Vehículo</DialogTitle>
            <DialogDescription>
              Añade, elimina o selecciona el video principal para el vehículo con placa{' '}
              <span className="font-mono font-bold text-foreground">
                {selectedVehicleForVideos?.license_plate}
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Form to Add New Video URL */}
            <form 
              onSubmit={async (e) => {
                e.preventDefault()
                if (!newVideoUrl.trim() || !selectedVehicleForVideos) return
                setIsVideoLoading(true)
                try {
                  const siblingVideos = vehicleVideos.filter(v => v.id_vehicle === selectedVehicleForVideos.id_vehicle)
                  const isPrimary = siblingVideos.length === 0
                  await addVehicleVideo({
                    id_vehicle: selectedVehicleForVideos.id_vehicle,
                    url: newVideoUrl.trim(),
                    is_primary: isPrimary,
                    display_order: siblingVideos.length
                  })
                  setNewVideoUrl('')
                } catch (error) {
                  console.error("Error adding vehicle video:", error)
                } finally {
                  setIsVideoLoading(false)
                }
              }}
              className="flex gap-2 items-end"
            >
              <div className="flex-1 space-y-2">
                <Label htmlFor="new_video_url">Nueva URL del Video</Label>
                <Input
                  id="new_video_url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isVideoLoading} 
                className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] font-medium"
              >
                {isVideoLoading ? 'Añadiendo...' : 'Añadir'}
              </Button>
            </form>

            {/* List of Current Videos */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Videos actuales</h3>
              {selectedVehicleForVideos && vehicleVideos.filter(v => v.id_vehicle === selectedVehicleForVideos.id_vehicle).length === 0 ? (
                <div className="text-center py-8 rounded-xl border border-dashed border-border text-muted-foreground text-sm">
                  Este vehículo aún no tiene videos asociados
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
                  {selectedVehicleForVideos && 
                    vehicleVideos
                      .filter(v => v.id_vehicle === selectedVehicleForVideos.id_vehicle)
                      .map((vid) => (
                        <div 
                          key={vid.id_vehicle_video} 
                          className={`flex flex-col p-3 rounded-lg border bg-muted/20 transition-all duration-300 ${
                            vid.is_primary 
                              ? 'border-[#C9A961] bg-[#C9A961]/5 shadow-sm' 
                              : 'border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between min-w-0">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => setPlayingVideoId(playingVideoId === vid.id_vehicle_video ? null : vid.id_vehicle_video)}
                                className="w-10 h-10 rounded bg-[#C9A961]/10 hover:bg-[#C9A961]/20 flex items-center justify-center text-[#C9A961] flex-shrink-0 transition-colors"
                                title="Previsualizar video"
                              >
                                <Play className="w-5 h-5 fill-current" />
                              </button>
                              <span className="text-xs font-mono truncate text-muted-foreground select-all block w-full">{vid.url}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              {!vid.is_primary && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-muted-foreground/60 hover:text-[#C9A961] hover:bg-white/10"
                                  onClick={() => handleSetPrimaryVideo(vid)}
                                  title="Establecer como principal"
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                              )}
                              {vid.is_primary && (
                                <span className="text-[10px] uppercase font-bold text-[#C9A961] bg-[#C9A961]/10 px-2 py-0.5 rounded">
                                  Principal
                                </span>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-white/10"
                                onClick={async () => {
                                  if (confirm('¿Estás seguro de eliminar este video?')) {
                                    try {
                                      await deleteVehicleVideo(vid.id_vehicle_video)
                                      if (vid.is_primary) {
                                        const remaining = vehicleVideos.filter(
                                          v => v.id_vehicle === vid.id_vehicle && v.id_vehicle_video !== vid.id_vehicle_video
                                        )
                                        if (remaining.length > 0) {
                                          await updateVehicleVideo(remaining[0].id_vehicle_video, { is_primary: true })
                                        }
                                      }
                                    } catch (error) {
                                      console.error("Error deleting video:", error)
                                    }
                                  }
                                }}
                                title="Eliminar video"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {playingVideoId === vid.id_vehicle_video && (
                            <div className="mt-3 aspect-video w-full rounded-lg overflow-hidden bg-black border border-border/50">
                              {isYoutubeUrl(vid.url) ? (
                                <iframe
                                  src={getYoutubeEmbedUrl(vid.url)}
                                  title="Vista previa del video"
                                  className="w-full h-full max-w-full border-0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : (
                                <video
                                  src={vid.url}
                                  controls
                                  autoPlay
                                  className="w-full h-full max-w-full object-contain"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsVideosDialogOpen(false)} className="bg-muted hover:bg-muted/80 text-foreground border border-border">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
