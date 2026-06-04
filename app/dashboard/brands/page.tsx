"use client"

import { useState } from 'react'
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
import { Plus, Search, Pencil, Trash2, MoreHorizontal, Tag, Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.country_origin.toLowerCase().includes(searchTerm.toLowerCase())
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
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 border border-green-200">
        Activo
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200">
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
              <Button onClick={() => handleOpenDialog()} className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Marca
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
                  <TableHead>Marca</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>País de Origen</TableHead>
                  <TableHead>Sitio Web</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron marcas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBrands.map(brand => (
                    <TableRow key={brand.id_brand} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#C9A961]/20 flex items-center justify-center">
                            <Tag className="w-5 h-5 text-[#C9A961]" />
                          </div>
                          <span className="font-medium">{brand.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {brand.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          {brand.country_origin}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a 
                          href={`https://${brand.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#C9A961] hover:underline"
                        >
                          {brand.website}
                        </a>
                      </TableCell>
                      <TableCell>{getStatusBadge(brand.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(brand)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(brand.id_brand)}
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
