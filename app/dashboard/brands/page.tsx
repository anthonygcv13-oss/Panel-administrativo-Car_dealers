"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/admin/header'
import { useDataStore, Brand, GeneralStatus } from '@/lib/store'
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
import { Plus, Search, Pencil, Trash2, MoreHorizontal, Tag, Globe, Image, Star } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdminPagination } from '@/components/admin/pagination'

export default function BrandsPage({ hideHeader = false }: { hideHeader?: boolean } = {}) {
  const { brands, brandImages, addBrand, updateBrand, deleteBrand, addBrandImage, updateBrandImage, deleteBrandImage } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    country_origin: '',
    website: '',
    status: 'active' as GeneralStatus,
  })

  // Brand Images State
  const [isImagesDialogOpen, setIsImagesDialogOpen] = useState(false)
  const [selectedBrandForImages, setSelectedBrandForImages] = useState<Brand | null>(null)
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [newImagePreview, setNewImagePreview] = useState('')
  const [imageUploadType, setImageUploadType] = useState<'file' | 'url'>('file')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [isImageLoading, setIsImageLoading] = useState(false)

  const handleOpenImagesDialog = (brand: Brand) => {
    setSelectedBrandForImages(brand)
    setNewImageFile(null)
    setNewImagePreview('')
    setImageUploadType('file')
    setNewImageUrl('')
    setIsImagesDialogOpen(true)
  }

  const handleSetPrimaryImage = async (img: any) => {
    try {
      await updateBrandImage(img.id_brand_image, { is_primary: true })
      const siblingImages = brandImages.filter(i => i.id_brand === img.id_brand && i.id_brand_image !== img.id_brand_image)
      for (const sibling of siblingImages) {
        if (sibling.is_primary) {
          await updateBrandImage(sibling.id_brand_image, { is_primary: false })
        }
      }
    } catch (error) {
      console.error("Error setting primary brand image:", error)
    }
  }

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBrandForImages) return
    if (imageUploadType === 'file' && !newImageFile) return
    if (imageUploadType === 'url' && !newImageUrl.trim()) return

    setIsImageLoading(true)
    try {
      const isFirst = brandImages.filter(i => i.id_brand === selectedBrandForImages.id_brand).length === 0
      await addBrandImage({
        id_brand: selectedBrandForImages.id_brand,
        image: imageUploadType === 'file' ? newImageFile : null,
        url: imageUploadType === 'url' ? newImageUrl.trim() : '',
        is_primary: isFirst,
        display_order: 0
      })
      setNewImageFile(null)
      setNewImagePreview('')
      setNewImageUrl('')
      if (typeof document !== 'undefined') {
        const fileInput = document.getElementById('brand_image_file') as HTMLInputElement | null
        if (fileInput) fileInput.value = ''
      }
    } catch (error) {
      console.error("Error adding brand image:", error)
      alert("Error al agregar la imagen")
    } finally {
      setIsImageLoading(false)
    }
  }

  const handleDeleteImage = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta imagen?")) return
    try {
      await deleteBrandImage(id)
    } catch (error) {
      console.error("Error deleting brand image:", error)
      alert("Error al eliminar la imagen")
    }
  }

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const normalizeText = (str: string) => 
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

  const filteredBrands = brands.filter(brand => {
    const searchNormalized = normalizeText(searchTerm)
    return (
      normalizeText(brand.name).includes(searchNormalized) ||
      normalizeText(brand.country_origin).includes(searchNormalized)
    )
  })

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage)
  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleOpenDialog = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand)
      setFormData({
        name: brand.name,
        description: brand.description,
        country_origin: brand.country_origin,
        website: brand.website,
        status: brand.status,
      })
    } else {
      setEditingBrand(null)
      setFormData({
        name: '',
        description: '',
        country_origin: '',
        website: '',
        status: 'active',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingBrand) {
      updateBrand(editingBrand.id_brand, formData)
    } else {
      addBrand(formData)
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta marca?')) {
      deleteBrand(id)
    }
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
          title="Gestión de Marcas" 
          description="Administra las marcas de vehículos"
        />
      )}
      
      <div className={hideHeader ? "space-y-6" : "p-6 space-y-6"}>
        {/* Search and Actions */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o país..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => handleOpenDialog()} className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] w-full md:w-auto font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Marca
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card Grid */}
        {paginatedBrands.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Tag className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-lg font-medium">No se encontraron marcas</p>
              <p className="text-sm">Intenta buscar con otros términos.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedBrands.map((brand) => (
                <Card 
                  key={brand.id_brand} 
                  className="bg-white/80 dark:bg-[#121215]/80 border border-border/50 hover:border-[#C9A961]/50 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Image Banner */}
                  <div className="relative w-full h-36 bg-muted/20 dark:bg-muted/10 flex items-center justify-center border-b border-border/50 overflow-hidden">
                    {/* Status Badge - Top Left */}
                    <div className="absolute top-3 left-3 z-10 backdrop-blur-md bg-white/70 dark:bg-black/50 rounded-full shadow-sm">
                      {getStatusBadge(brand.status)}
                    </div>

                    {/* Action Menu - Top Right */}
                    <div className="absolute top-3 right-3 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/70 dark:bg-black/50 hover:bg-white dark:hover:bg-black backdrop-blur-md shadow-sm border border-border/20">
                            <MoreHorizontal className="w-4 h-4 text-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleOpenDialog(brand)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenImagesDialog(brand)}>
                            <Image className="w-4 h-4 mr-2" />
                            Imágenes
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(brand.id_brand)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Image / Logo */}
                    {(() => {
                      const primaryImg = brandImages.find(img => img.id_brand === brand.id_brand && img.is_primary)
                      if (primaryImg) {
                        return (
                          <div className="w-full h-full p-4 flex items-center justify-center bg-white dark:bg-[#16161a]">
                            <img 
                              src={primaryImg.url} 
                              alt={brand.name} 
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" 
                            />
                          </div>
                        )
                      }
                      return (
                        <div className="w-full h-full bg-gradient-to-br from-[#C9A961]/10 to-[#C9A961]/2 dark:from-[#C9A961]/20 dark:to-transparent flex items-center justify-center">
                          <Tag className="w-8 h-8 text-[#C9A961]/40" />
                        </div>
                      )
                    })()}
                  </div>

                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-[#C9A961] transition-colors line-clamp-1">
                          {brand.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-medium">{brand.country_origin}</span>
                        </div>
                      </div>

                      {/* Description */}
                      {brand.description && (
                        <p className="text-sm text-muted-foreground/90 line-clamp-2 bg-muted/20 dark:bg-muted/10 p-3 rounded-lg border border-border/20">
                          {brand.description}
                        </p>
                      )}
                    </div>

                    {/* Website */}
                    {brand.website && (
                      <div className="pt-3 border-t border-border/40 flex items-center justify-between mt-auto">
                        <span className="text-xs text-muted-foreground">Sitio web</span>
                        <a 
                          href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[#C9A961] hover:underline flex items-center gap-1 truncate max-w-[200px]"
                        >
                          {brand.website}
                          <Globe className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </div>
                    )}
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? 'Editar Marca' : 'Nueva Marca'}
            </DialogTitle>
            <DialogDescription>
              {editingBrand ? 'Modifica los datos de la marca' : 'Completa los datos para registrar una nueva marca'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
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
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country_origin">País de Origen</Label>
                <Input
                  id="country_origin"
                  value={formData.country_origin}
                  onChange={(e) => setFormData({ ...formData, country_origin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Sitio Web</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData({ ...formData, status: v as GeneralStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D]">
                {editingBrand ? 'Guardar Cambios' : 'Crear Marca'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Brand Images Dialog */}
      <Dialog open={isImagesDialogOpen} onOpenChange={setIsImagesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Galería de la Marca: {selectedBrandForImages?.name}</DialogTitle>
            <DialogDescription>
              Agrega o administra las imágenes asociadas a esta marca.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddImage} className="space-y-4 py-4">
            <div className="flex gap-2 items-end">
              <div className="space-y-1.5 flex-1">
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor={imageUploadType === 'file' ? 'brand_image_file' : 'brand_image_url'}>
                    Nueva Imagen
                  </Label>
                  <div className="flex gap-1 bg-muted p-0.5 rounded-md border border-border/40">
                    <button
                      type="button"
                      onClick={() => {
                        setImageUploadType('file')
                        setNewImageUrl('')
                      }}
                      className={`px-2 py-0.5 text-xs rounded transition-all duration-200 ${
                        imageUploadType === 'file'
                          ? 'bg-[#C9A961] text-[#2D2D2D] font-semibold shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Archivo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageUploadType('url')
                        setNewImageFile(null)
                        setNewImagePreview('')
                        if (typeof document !== 'undefined') {
                          const fileInput = document.getElementById('brand_image_file') as HTMLInputElement | null
                          if (fileInput) fileInput.value = ''
                        }
                      }}
                      className={`px-2 py-0.5 text-xs rounded transition-all duration-200 ${
                        imageUploadType === 'url'
                          ? 'bg-[#C9A961] text-[#2D2D2D] font-semibold shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Enlace URL
                    </button>
                  </div>
                </div>

                {imageUploadType === 'file' ? (
                  <Input
                    id="brand_image_file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setNewImageFile(file)
                      setNewImagePreview(file ? URL.createObjectURL(file) : '')
                    }}
                    required
                  />
                ) : (
                  <Input
                    id="brand_image_url"
                    type="url"
                    placeholder="Pegar la URL de la imagen aquí..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    required
                  />
                )}

                {(imageUploadType === 'file' ? newImagePreview : newImageUrl) && (
                  <div className="rounded-lg border border-border overflow-hidden bg-muted/20 mt-2">
                    <img 
                      src={imageUploadType === 'file' ? newImagePreview : newImageUrl} 
                      alt="Vista previa" 
                      className="h-24 w-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] font-semibold"
                disabled={isImageLoading}
              >
                {isImageLoading ? 'Añadiendo...' : 'Añadir'}
              </Button>
            </div>
          </form>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            <Label>Imágenes Registradas</Label>
            {selectedBrandForImages && 
              brandImages.filter(img => img.id_brand === selectedBrandForImages.id_brand).map((img) => (
                <div key={img.id_brand_image} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40 bg-muted/20">
                  <div className="w-12 h-12 rounded border border-border bg-white dark:bg-zinc-950 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <img src={img.url} alt="Logo de Marca" className="max-w-full max-h-full object-contain" onError={(e)=>{(e.target as any).src='https://placehold.co/100x100?text=Logo'}} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{img.url}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleSetPrimaryImage(img)}
                      className={`h-8 w-8 rounded-full ${img.is_primary ? 'text-[#C9A961]' : 'text-muted-foreground/40 hover:text-[#C9A961]'}`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteImage(img.id_brand_image)}
                      className="h-8 w-8 rounded-full text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            {selectedBrandForImages && brandImages.filter(img => img.id_brand === selectedBrandForImages.id_brand).length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-6">No hay imágenes registradas para esta marca.</p>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsImagesDialogOpen(false)} className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] font-semibold">
              Cerrar Galería
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
