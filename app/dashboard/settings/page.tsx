"use client"

import { Header } from '@/components/admin/header'
import { useAuthStore, useDataStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import UsersPage from '@/app/dashboard/users/page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette,
  Save,
  Building2,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { roles } = useDataStore()
  const [saved, setSaved] = useState(false)

  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    email: user?.email || '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [companyData, setCompanyData] = useState({
    name: 'CARLIZ',
    address: 'Av. Principal, Torre Central, Piso 5',
    phone: '+58 412-123-4567',
    email: 'contacto@carliz.com',
    tax_id: 'J-12345678-9',
  })

  const [notifications, setNotifications] = useState({
    email_sales: true,
    email_quotes: true,
    email_payments: false,
    push_enabled: true,
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const userRole = roles.find(r => r.id_role === user?.id_role)

  return (
    <div className="min-h-screen">
      <Header 
        title="Configuración del Sistema" 
        description="Administra los ajustes de tu cuenta, preferencias y usuarios"
      />
      
      <div className="p-6">
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="settings">Ajustes Generales</TabsTrigger>
            <TabsTrigger value="users">Usuarios y Accesos</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6 mt-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-[#C9A961]/20 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-[#C9A961]">
                      {user?.first_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg">{user?.first_name}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <span className="mt-2 px-3 py-1 text-xs rounded-full bg-[#C9A961]/20 text-[#C9A961] capitalize">
                    {userRole?.name}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <a href="#profile" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#C9A961]/10 text-[#C9A961]">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Perfil</span>
                  </a>
                  <a href="#company" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Empresa</span>
                  </a>
                  <a href="#notifications" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Bell className="w-4 h-4" />
                    <span className="text-sm font-medium">Notificaciones</span>
                  </a>
                  <a href="#security" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">Seguridad</span>
                  </a>
                  <a href="#system" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Database className="w-4 h-4" />
                    <span className="text-sm font-medium">Sistema</span>
                  </a>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            <Card id="profile" className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#C9A961]" />
                  Información del Perfil
                </CardTitle>
                <CardDescription>
                  Actualiza tu información personal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nombre Completo</Label>
                    <Input
                      id="first_name"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Cambiar Contraseña</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Contraseña Actual</Label>
                      <Input
                        id="current_password"
                        type="password"
                        value={profileData.current_password}
                        onChange={(e) => setProfileData({ ...profileData, current_password: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_password">Nueva Contraseña</Label>
                      <Input
                        id="new_password"
                        type="password"
                        value={profileData.new_password}
                        onChange={(e) => setProfileData({ ...profileData, new_password: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirmar Contraseña</Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        value={profileData.confirm_password}
                        onChange={(e) => setProfileData({ ...profileData, confirm_password: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Section */}
            <Card id="company" className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#C9A961]" />
                  Información de la Empresa
                </CardTitle>
                <CardDescription>
                  Configura los datos de tu empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Nombre de la Empresa</Label>
                    <Input
                      id="company_name"
                      value={companyData.name}
                      onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax_id">RIF</Label>
                    <Input
                      id="tax_id"
                      value={companyData.tax_id}
                      onChange={(e) => setCompanyData({ ...companyData, tax_id: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={companyData.address}
                      onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_phone">Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="company_phone"
                        value={companyData.phone}
                        onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_email">Email de Contacto</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="company_email"
                        type="email"
                        value={companyData.email}
                        onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card id="notifications" className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#C9A961]" />
                  Notificaciones
                </CardTitle>
                <CardDescription>
                  Configura tus preferencias de notificación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones de Ventas</p>
                    <p className="text-sm text-muted-foreground">Recibe alertas cuando se registre una nueva venta</p>
                  </div>
                  <Switch 
                    checked={notifications.email_sales}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email_sales: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones de Cotizaciones</p>
                    <p className="text-sm text-muted-foreground">Recibe alertas cuando se cree una nueva cotización</p>
                  </div>
                  <Switch 
                    checked={notifications.email_quotes}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email_quotes: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones de Pagos</p>
                    <p className="text-sm text-muted-foreground">Recibe alertas cuando se registre un pago</p>
                  </div>
                  <Switch 
                    checked={notifications.email_payments}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email_payments: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones Push</p>
                    <p className="text-sm text-muted-foreground">Habilitar notificaciones en el navegador</p>
                  </div>
                  <Switch 
                    checked={notifications.push_enabled}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, push_enabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* System Section */}
            <Card id="system" className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#C9A961]" />
                  Sistema
                </CardTitle>
                <CardDescription>
                  Información y configuración del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Versión del Sistema</p>
                    <p className="font-medium">v1.0.0</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Última Actualización</p>
                    <p className="font-medium">25 May 2026</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Base de Datos</p>
                    <p className="font-medium">PostgreSQL 18.3</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Estado del Servidor</p>
                    <p className="font-medium text-green-600">Operativo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSave}
                className="bg-[#C9A961] hover:bg-[#D4B978] text-[#2D2D2D]"
              >
                <Save className="w-4 h-4 mr-2" />
                {saved ? 'Guardado!' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </div>
          </TabsContent>
          <TabsContent value="users" className="mt-0">
            <UsersPage hideHeader={true} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
