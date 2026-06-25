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
import { Plus, Search, Pencil, Trash2, MoreHorizontal, Tag, Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdminPagination } from '@/components/admin/pagination'

export default function BrandsPage() {
  const { brands, addBrand, updateBrand, deleteBrand } = useDataStore()
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.country_origin.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
    <div className="min-h-screen">
      <Header 
        title="Gestión de Marcas" 
        description="Administra las marcas de vehículos"
      />
      
      <div className="p-6 space-y-6">
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
                  className="bg-white/80 dark:bg-[#121215]/80 border border-border/50 hover:border-[#C9A961]/50 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#C9A961]/10 dark:bg-[#C9A961]/20 flex items-center justify-center border border-[#C9A961]/20 group-hover:scale-105 transition-transform">
                          <Tag className="w-6 h-6 text-[#C9A961]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-foreground group-hover:text-[#C9A961] transition-colors">
                            {brand.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium">{brand.country_origin}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(brand.status)}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleOpenDialog(brand)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
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
                    </div>

                    {/* Description */}
                    {brand.description && (
                      <p className="text-sm text-muted-foreground/90 line-clamp-2 bg-muted/20 dark:bg-muted/10 p-3 rounded-lg border border-border/20">
                        {brand.description}
                      </p>
                    )}

                    {/* Website */}
                    {brand.website && (
                      <div className="pt-2 border-t border-border/40 flex items-center justify-between">
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
    </div>
  )
}
