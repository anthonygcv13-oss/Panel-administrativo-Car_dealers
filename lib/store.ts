import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types based on database schema
export type UserStatus = 'active' | 'inactive' | 'blocked'
export type VehicleStatus = 'available' | 'sold' | 'maintenance'
export type SaleStatus = 'pending' | 'paid' | 'cancelled'
export type SaleType = 'cash' | 'financed'
export type PaymentMethod = 'cash' | 'card' | 'transfer'
export type QuoteStatus = 'pending' | 'approved' | 'rejected' | 'expired'
export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'gas'
export type TransmissionType = 'manual' | 'automatic' | 'cvt'
export type BodyType = 'sedan' | 'hatchback' | 'suv' | 'pickup' | 'coupe' | 'convertible'
export type GeneralStatus = 'active' | 'inactive'

export interface Role {
  id_role: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface User {
  id_user: number
  first_name: string
  email: string
  password?: string
  status: UserStatus
  id_role: number
  role?: Role
  created_at: string
  updated_at: string
}

export interface Brand {
  id_brand: number
  name: string
  description: string
  country_origin: string
  website: string
  status: GeneralStatus
  created_at: string
  updated_at: string
}

export interface Model {
  id_model: number
  name: string
  id_brand: number
  brand?: Brand
  description: string
  launch_year: number
  discontinuation_year?: number
  fuel_type: FuelType
  engine_displacement: number
  transmission: TransmissionType
  number_doors: number
  passenger_capacity: number
  body_type: BodyType
  status: GeneralStatus
  created_at: string
  updated_at: string
}

export interface Supplier {
  id_supplier: number
  name: string
  tax_id: string
  phone: string
  alternate_phone?: string
  email?: string
  alternate_email?: string
  address: string
  payment_terms: string
  status: GeneralStatus
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id_vehicle: number
  license_plate: string
  vehicle_serial: string
  engine_serial: string
  body_serial: string
  manufacture_date: string
  purchase_date: string
  mileage: number
  color: string
  id_model: number
  model?: Model
  id_brand: number
  brand?: Brand
  year: number
  status: VehicleStatus
  purchase_price: number
  sale_price: number
  id_supplier?: number
  supplier?: Supplier
  created_at: string
  updated_at: string
}

export interface Customer {
  id_customer: number
  first_name: string
  last_name: string
  document: string
  phone: string
  email: string
  address: string
  created_at: string
  updated_at: string
}

export interface FinancingPlan {
  id_financing_plan: number
  name: string
  interest_rate: number
  number_installments: number
  created_at: string
  updated_at: string
}

export interface VehicleSale {
  id_vehicle_sale: number
  date: string
  final_price: number
  sale_type: SaleType
  status: SaleStatus
  id_user: number
  user?: User
  id_customer: number
  customer?: Customer
  id_vehicle: number
  vehicle?: Vehicle
  id_financing_plan?: number
  financing_plan?: FinancingPlan
  created_at: string
  updated_at: string
}

export interface Payment {
  id_payment: number
  date: string
  amount: number
  payment_method: PaymentMethod
  status: SaleStatus
  id_user: number
  user?: User
  id_vehicle_sale?: number
  sale?: VehicleSale
  id_installment?: number
  created_at: string
  updated_at: string
}

export interface Quote {
  id_quote: number
  date: string
  estimated_price: number
  validity_date: string
  status: QuoteStatus
  id_vehicle: number
  vehicle?: Vehicle
  id_customer: number
  customer?: Customer
  created_at: string
  updated_at: string
}

export interface Installment {
  id_installment: number
  number: number
  amount: number
  due_date: string
  status: SaleStatus
  id_vehicle_sale: number
  id_financing_plan: number
  created_at: string
  updated_at: string
}

export interface VehicleImage {
  id_vehicle_image: number
  id_vehicle: number
  url: string
  is_primary: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Notification {
  id_notification: number
  title: string
  message: string
  type: 'success' | 'warning' | 'info'
  timestamp: string
  read: boolean
}

// Mock data based on SQL file
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Generic API caller with token auth
const getAuthHeaders = () => {
  const token = useAuthStore.getState().token
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const headers = getAuthHeaders()
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || errorData.message || `HTTP error ${response.status}`)
  }
  return await response.json()
}

// Auth Store
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          })
          if (!response.ok) return false
          const data = await response.json()
          if (data.success && data.user) {
            const userDetails = data.user.user
            const token = data.user.token
            
            let role = null
            try {
              const rolesRes = await fetch(`${API_URL}/roles`, {
                headers: { 'Authorization': `Bearer ${token}` }
              })
              if (rolesRes.ok) {
                const rolesData = await rolesRes.json()
                if (rolesData.success) {
                  role = rolesData.data.find((r: any) => r.id_role === userDetails.id_role)
                }
              }
            } catch (roleError) {
              console.error("Error fetching user role details:", roleError)
            }

            set({
              user: { ...userDetails, role },
              token,
              isAuthenticated: true
            })
            return true
          }
          return false
        } catch (err) {
          console.error("Error logging in:", err)
          return false
        }
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'carliz-auth' }
  )
)

// Data Store
interface DataState {
  roles: Role[]
  users: User[]
  brands: Brand[]
  models: Model[]
  suppliers: Supplier[]
  vehicles: Vehicle[]
  customers: Customer[]
  financingPlans: FinancingPlan[]
  sales: VehicleSale[]
  payments: Payment[]
  quotes: Quote[]
  vehicleImages: VehicleImage[]
  notifications: Notification[]
  
  fetchInitialData: () => Promise<void>
  fetchNotifications: () => Promise<void>
  markNotificationAsRead: (id: number) => Promise<void>
  markAllNotificationsAsRead: () => Promise<void>
  deleteNotification: (id: number) => Promise<void>
  
  // CRUD operations
  addVehicle: (vehicle: Omit<Vehicle, 'id_vehicle' | 'created_at' | 'updated_at'>) => Promise<void>
  updateVehicle: (id: number, vehicle: Partial<Vehicle>) => Promise<void>
  deleteVehicle: (id: number) => Promise<void>
  
  addCustomer: (customer: Omit<Customer, 'id_customer' | 'created_at' | 'updated_at'>) => Promise<void>
  updateCustomer: (id: number, customer: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: number) => Promise<void>
  
  addSale: (sale: Omit<VehicleSale, 'id_vehicle_sale' | 'created_at' | 'updated_at'>) => Promise<void>
  updateSale: (id: number, sale: Partial<VehicleSale>) => Promise<void>
  
  addPayment: (payment: Omit<Payment, 'id_payment' | 'created_at' | 'updated_at'>) => Promise<void>
  
  addQuote: (quote: Omit<Quote, 'id_quote' | 'created_at' | 'updated_at'>) => Promise<void>
  updateQuote: (id: number, quote: Partial<Quote>) => Promise<void>
  
  addBrand: (brand: Omit<Brand, 'id_brand' | 'created_at' | 'updated_at'>) => Promise<void>
  updateBrand: (id: number, brand: Partial<Brand>) => Promise<void>
  deleteBrand: (id: number) => Promise<void>
  
  addModel: (model: Omit<Model, 'id_model' | 'created_at' | 'updated_at'>) => Promise<void>
  updateModel: (id: number, model: Partial<Model>) => Promise<void>
  deleteModel: (id: number) => Promise<void>
  
  addSupplier: (supplier: Omit<Supplier, 'id_supplier' | 'created_at' | 'updated_at'>) => Promise<void>
  updateSupplier: (id: number, supplier: Partial<Supplier>) => Promise<void>
  deleteSupplier: (id: number) => Promise<void>
  
  addUser: (user: Omit<User, 'id_user' | 'created_at' | 'updated_at'>) => Promise<void>
  updateUser: (id: number, user: Partial<User>) => Promise<void>
  deleteUser: (id: number) => Promise<void>

  addVehicleImage: (image: Omit<VehicleImage, 'id_vehicle_image' | 'created_at' | 'updated_at'>) => Promise<void>
  updateVehicleImage: (id: number, image: Partial<VehicleImage>) => Promise<void>
  deleteVehicleImage: (id: number) => Promise<void>

  addFinancingPlan: (plan: Omit<FinancingPlan, 'id_financing_plan' | 'created_at' | 'updated_at'>) => Promise<void>
  updateFinancingPlan: (id: number, plan: Partial<FinancingPlan>) => Promise<void>
  deleteFinancingPlan: (id: number) => Promise<void>
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      roles: [],
      users: [],
      brands: [],
      models: [],
      suppliers: [],
      vehicles: [],
      customers: [],
      financingPlans: [],
      sales: [],
      payments: [],
      quotes: [],
      vehicleImages: [],
      notifications: [],
      
      fetchInitialData: async () => {
        try {
          const apiFetch = async (endpoint: string) => {
            const res = await apiRequest(endpoint)
            return res.success ? res.data : []
          }

          const [
            roles,
            users,
            brands,
            models,
            suppliers,
            vehicles,
            customers,
            financingPlans,
            sales,
            payments,
            quotes,
            vehicleImages,
            notifications
          ] = await Promise.all([
            apiFetch('/roles'),
            apiFetch('/users'),
            apiFetch('/brands'),
            apiFetch('/models'),
            apiFetch('/suppliers'),
            apiFetch('/vehicles'),
            apiFetch('/customers'),
            apiFetch('/financing-plans'),
            apiFetch('/vehicle-sale'),
            apiFetch('/payments'),
            apiFetch('/quotes'),
            apiFetch('/vehicle-images'),
            apiFetch('/notifications')
          ])

          set({
            roles,
            users,
            brands,
            models,
            suppliers,
            vehicles,
            customers,
            financingPlans,
            sales,
            payments,
            quotes,
            vehicleImages,
            notifications
          })
        } catch (error) {
          console.error("Error fetching initial data from backend:", error)
        }
      },
      
      // Vehicle CRUD
      addVehicle: async (vehicle) => {
        await apiRequest('/vehicles', {
          method: 'POST',
          body: JSON.stringify(vehicle)
        })
        await get().fetchInitialData()
      },
      updateVehicle: async (id, vehicle) => {
        await apiRequest(`/vehicles/${id}`, {
          method: 'PUT',
          body: JSON.stringify(vehicle)
        })
        await get().fetchInitialData()
      },
      deleteVehicle: async (id) => {
        await apiRequest(`/vehicles/${id}`, {
          method: 'DELETE'
        })
        await get().fetchInitialData()
      },
      
      // Customer CRUD
      addCustomer: async (customer) => {
        await apiRequest('/customers', {
          method: 'POST',
          body: JSON.stringify(customer)
        })
        await get().fetchInitialData()
      },
      updateCustomer: async (id, customer) => {
        await apiRequest(`/customers/${id}`, {
          method: 'PUT',
          body: JSON.stringify(customer)
        })
        await get().fetchInitialData()
      },
      deleteCustomer: async (id) => {
        await apiRequest(`/customers/${id}`, {
          method: 'DELETE'
        })
        await get().fetchInitialData()
      },
      
      // Sale CRUD
      addSale: async (sale) => {
        await apiRequest('/vehicle-sale', {
          method: 'POST',
          body: JSON.stringify(sale)
        })
        await get().fetchInitialData()
      },
      updateSale: async (id, sale) => {
        await apiRequest(`/vehicle-sale/${id}`, {
          method: 'PUT',
          body: JSON.stringify(sale)
        })
        await get().fetchInitialData()
      },
      
      // Payment CRUD
      addPayment: async (payment) => {
        await apiRequest('/payments', {
          method: 'POST',
          body: JSON.stringify(payment)
        })
        await get().fetchInitialData()
      },
      
      // Quote CRUD
      addQuote: async (quote) => {
        await apiRequest('/quotes', {
          method: 'POST',
          body: JSON.stringify(quote)
        })
        await get().fetchInitialData()
      },
      updateQuote: async (id, quote) => {
        await apiRequest(`/quotes/${id}`, {
          method: 'PUT',
          body: JSON.stringify(quote)
        })
        await get().fetchInitialData()
      },
      
      // Brand CRUD
      addBrand: async (brand) => {
        await apiRequest('/brands', {
          method: 'POST',
          body: JSON.stringify(brand)
        })
        await get().fetchInitialData()
      },
      updateBrand: async (id, brand) => {
        await apiRequest(`/brands/${id}`, {
          method: 'PUT',
          body: JSON.stringify(brand)
        })
        await get().fetchInitialData()
      },
      deleteBrand: async (id) => {
        await apiRequest(`/brands/${id}`, {
          method: 'DELETE'
        })
        await get().fetchInitialData()
      },
      
      // Model CRUD
      addModel: async (model) => {
        await apiRequest('/models', {
          method: 'POST',
          body: JSON.stringify(model)
        })
        await get().fetchInitialData()
      },
      updateModel: async (id, model) => {
        await apiRequest(`/models/${id}`, {
          method: 'PUT',
          body: JSON.stringify(model)
        })
        await get().fetchInitialData()
      },
      deleteModel: async (id) => {
        await apiRequest(`/models/${id}`, {
          method: 'DELETE'
        })
        await get().fetchInitialData()
      },
      
      // Supplier CRUD
      addSupplier: async (supplier) => {
        await apiRequest('/suppliers', {
          method: 'POST',
          body: JSON.stringify(supplier)
        })
        await get().fetchInitialData()
      },
      updateSupplier: async (id, supplier) => {
        await apiRequest(`/suppliers/${id}`, {
          method: 'PUT',
          body: JSON.stringify(supplier)
        })
        await get().fetchInitialData()
      },
      deleteSupplier: async (id) => {
        await apiRequest(`/suppliers/${id}`, {
          method: 'DELETE'
        })
        await get().fetchInitialData()
      },
      
      // User CRUD
      addUser: async (user) => {
        await apiRequest('/users', {
          method: 'POST',
          body: JSON.stringify(user)
        })
        await get().fetchInitialData()
      },
      updateUser: async (id, user) => {
        await apiRequest(`/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(user)
        })
        await get().fetchInitialData()
      },
      deleteUser: async (id) => {
        await apiRequest(`/users/${id}`, {
          method: 'DELETE'
        })
        await get().fetchInitialData()
      },
      
      // VehicleImage CRUD
      addVehicleImage: async (image) => {
        await apiRequest('/vehicle-images', {
          method: 'POST',
          body: JSON.stringify(image)
        })
        await get().fetchInitialData()
      },
      updateVehicleImage: async (id, image) => {
        await apiRequest(`/vehicle-images/${id}`, {
          method: 'PUT',
          body: JSON.stringify(image)
        })
        await get().fetchInitialData()
      },
      deleteVehicleImage: async (id) => {
        await apiRequest(`/vehicle-images/${id}`, {
          method: 'DELETE'
        })
        await get().fetchInitialData()
      },

      addFinancingPlan: async (plan) => {
        await apiRequest('/financing-plans', {
          method: 'POST',
          body: JSON.stringify(plan)
        })
        await get().fetchInitialData()
      },
      updateFinancingPlan: async (id, plan) => {
        await apiRequest(`/financing-plans/${id}`, {
          method: 'PUT',
          body: JSON.stringify(plan)
        })
        await get().fetchInitialData()
      },
      deleteFinancingPlan: async (id) => {
        await apiRequest(`/financing-plans/${id}`, {
          method: 'DELETE'
        })
        await get().fetchInitialData()
      },

      fetchNotifications: async () => {
        try {
          const res = await apiRequest('/notifications')
          if (res.success) {
            set({ notifications: res.data })
          }
        } catch (error) {
          console.error("Error fetching notifications:", error)
        }
      },
      markNotificationAsRead: async (id) => {
        try {
          const res = await apiRequest(`/notifications/${id}/read`, {
            method: 'PUT'
          })
          if (res.success) {
            set((state) => ({
              notifications: state.notifications.map((n) =>
                n.id_notification === id ? { ...n, read: true } : n
              )
            }))
          }
        } catch (error) {
          console.error("Error marking notification as read:", error)
        }
      },
      markAllNotificationsAsRead: async () => {
        try {
          const res = await apiRequest('/notifications/read-all', {
            method: 'PUT'
          })
          if (res.success) {
            set((state) => ({
              notifications: state.notifications.map((n) => ({ ...n, read: true }))
            }))
          }
        } catch (error) {
          console.error("Error marking all notifications as read:", error)
        }
      },
      deleteNotification: async (id) => {
        try {
          const res = await apiRequest(`/notifications/${id}`, {
            method: 'DELETE'
          })
          if (res.success) {
            set((state) => ({
              notifications: state.notifications.filter((n) => n.id_notification !== id)
            }))
          }
        } catch (error) {
          console.error("Error deleting notification:", error)
        }
      },
    }),
    { name: 'carliz-data' }
  )
)
