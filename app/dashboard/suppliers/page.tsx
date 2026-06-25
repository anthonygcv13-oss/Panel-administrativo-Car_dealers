"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/admin/header'
import { useDataStore, Supplier, GeneralStatus } from '@/lib/store'
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
import { Plus, Search, Pencil, Trash2, MoreHorizontal, Truck, Phone, Mail, MapPin, CreditCard, Tag } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdminPagination } from '@/components/admin/pagination'

export default function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    tax_id: '',
    phone: '',
    alternate_phone: '',
    email: '',
    alternate_email: '',
    address: '',
    payment_terms: '',
    status: 'active' as GeneralStatus,
  })

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.tax_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage)
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleOpenDialog = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier)
      setFormData({
        name: supplier.name,
        tax_id: supplier.tax_id,
        phone: supplier.phone,
        alternate_phone: supplier.alternate_phone || '',
        email: supplier.email || '',
        alternate_email: supplier.alternate_email || '',
        address: supplier.address,
        payment_terms: supplier.payment_terms,
        status: supplier.status,
      })
    } else {
      setEditingSupplier(null)
      setFormData({
        name: '',
        tax_id: '',
        phone: '',
        alternate_phone: '',
        email: '',
        alternate_email: '',
        address: '',
        payment_terms: '',
        status: 'active',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingSupplier) {
      updateSupplier(editingSupplier.id_supplier, formData)
    } else {
      addSupplier(formData)
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
      deleteSupplier(id)
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
        title="Gestión de Proveedores" 
        description="Administra los proveedores de vehículos"
      />
      
      <div className="p-6 space-y-6">
        {/* Search and Actions */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, RIF o dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => handleOpenDialog()} className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D] w-full md:w-auto font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Proveedor
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Card Grid */}
        {paginatedSuppliers.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Truck className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-lg font-medium">No se encontraron proveedores</p>
              <p className="text-sm">Intenta buscar con otros términos.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedSuppliers.map((supplier) => (
                <Card 
                  key={supplier.id_supplier} 
                  className="bg-white/80 dark:bg-[#121215]/80 border border-border/50 hover:border-[#C9A961]/50 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#8B1538]/10 dark:bg-[#C9A961]/25 flex items-center justify-center border border-[#8B1538]/20 group-hover:scale-105 transition-transform">
                          <Truck className="w-6 h-6 text-[#8B1538] dark:text-[#C9A961]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-foreground group-hover:text-[#C9A961] transition-colors">
                            {supplier.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-mono font-medium">{supplier.tax_id}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(supplier.status)}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleOpenDialog(supplier)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(supplier.id_supplier)}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 pt-2.5 border-t border-border/40 text-sm">
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <Phone className="w-4 h-4 text-[#C9A961] flex-shrink-0" />
                        <span>{supplier.phone}</span>
                      </div>
                      {supplier.email && (
                        <div className="flex items-center gap-2.5 text-muted-foreground truncate">
                          <Mail className="w-4 h-4 text-[#C9A961] flex-shrink-0" />
                          <span className="truncate">{supplier.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <MapPin className="w-4 h-4 text-[#C9A961] flex-shrink-0" />
                        <span className="line-clamp-1">{supplier.address}</span>
                      </div>
                    </div>

                    {/* Payment Terms */}
                    {supplier.payment_terms && (
                      <div className="pt-2.5 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground/80">
                        <div className="flex items-center gap-1.5 font-medium">
                          <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Términos de Pago:</span>
                        </div>
                        <span className="font-semibold text-foreground">{supplier.payment_terms}</span>
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </DialogTitle>
            <DialogDescription>
              {editingSupplier ? 'Modifica los datos del proveedor' : 'Completa los datos para registrar un nuevo proveedor'}
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
                <Label htmlFor="tax_id">RIF</Label>
                <Input
                  id="tax_id"
                  value={formData.tax_id}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  placeholder="J-12345678-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono Principal</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alternate_phone">Teléfono Alternativo</Label>
                <Input
                  id="alternate_phone"
                  value={formData.alternate_phone}
                  onChange={(e) => setFormData({ ...formData, alternate_phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Principal</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alternate_email">Email Alternativo</Label>
                <Input
                  id="alternate_email"
                  type="email"
                  value={formData.alternate_email}
                  onChange={(e) => setFormData({ ...formData, alternate_email: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_terms">Términos de Pago</Label>
                <Input
                  id="payment_terms"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  placeholder="Ej: Contado, Crédito 30 días"
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
                {editingSupplier ? 'Guardar Cambios' : 'Crear Proveedor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
