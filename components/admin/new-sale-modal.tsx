'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Check, ChevronRight, ArrowLeft } from 'lucide-react'
import { Stepper, StepperLabels } from './stepper'

interface NewSaleModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewSaleModal({ isOpen, onClose }: NewSaleModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    vehicleId: '',
    customerId: '',
    salePrice: '',
    paymentMethod: '',
    notes: '',
  })

  const steps = [
    { number: 1, title: 'Vehículo', description: 'Selecciona el vehículo', completed: false },
    { number: 2, title: 'Detalles', description: 'Información del cliente', completed: false },
    { number: 3, title: 'Confirmación', description: 'Completa la venta', completed: false },
  ]

  const handleNext = () => {
    if (step < steps.length) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    console.log('Venta registrada:', formData)
    onClose()
    setStep(1)
    setFormData({
      vehicleId: '',
      customerId: '',
      salePrice: '',
      paymentMethod: '',
      notes: '',
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white border border-luxe-gold/20 shadow-2xl">
        {/* Header with close button */}
        <div className="absolute right-4 top-4 z-50">
          <button
            onClick={onClose}
            className="text-stainless-silver hover:text-midnight-blue transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <DialogHeader className="pb-6 border-b border-luxe-gold/20">
          <DialogTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-luxe-gold to-midnight-blue">
            Agregar Nueva Venta
          </DialogTitle>
          <DialogDescription className="text-stainless-silver mt-2">
            Completa los pasos para registrar una nueva venta
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="py-8 px-6 bg-gradient-to-r from-cream-light/30 to-silver-light/30 rounded-lg">
          <Stepper steps={steps} currentStep={step} className="mb-6" />
          <StepperLabels steps={steps} currentStep={step} />
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 px-6">
          <div className="flex-1 h-1.5 bg-stainless-silver/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-luxe-gold to-soft-gold transition-all duration-500"
              style={{ width: `${(step / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-stainless-silver/60">
            Paso {step} de {steps.length}
          </span>
        </div>

        {/* Form content */}
        <div className="space-y-6 min-h-80 p-6">
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in-50 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-luxe-gold to-soft-gold flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-midnight-blue">Selecciona el Vehículo</h3>
                  <p className="text-sm text-stainless-silver/60">Elige el vehículo a vender del inventario</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-midnight-blue font-semibold text-sm">Vehículo</Label>
                  <Input
                    placeholder="ej: BMW X5 2024 - Azul"
                    value={formData.vehicleId}
                    onChange={(e) => handleInputChange('vehicleId', e.target.value)}
                    className="mt-2 border-2 border-luxe-gold/20 focus:border-luxe-gold transition-colors"
                  />
                </div>
                <div>
                  <Label className="text-midnight-blue font-semibold text-sm">VIN / Número de Serie</Label>
                  <Input
                    placeholder="ej: WBXYZ1234567890"
                    className="mt-2 border-2 border-luxe-gold/20 focus:border-luxe-gold transition-colors"
                  />
                </div>
                <div>
                  <Label className="text-midnight-blue font-semibold text-sm">Precio de Compra</Label>
                  <Input
                    type="number"
                    placeholder="ej: 35000"
                    className="mt-2 border-2 border-luxe-gold/20 focus:border-luxe-gold transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in fade-in-50 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-luxe-gold to-soft-gold flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-midnight-blue">Información del Cliente</h3>
                  <p className="text-sm text-stainless-silver/60">Completa los datos del cliente comprador</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-midnight-blue font-semibold text-sm">Nombre del Cliente</Label>
                  <Input
                    placeholder="ej: Juan García"
                    value={formData.customerId}
                    onChange={(e) => handleInputChange('customerId', e.target.value)}
                    className="mt-2 border-2 border-luxe-gold/20 focus:border-luxe-gold transition-colors"
                  />
                </div>
                <div>
                  <Label className="text-midnight-blue font-semibold text-sm">Email</Label>
                  <Input
                    type="email"
                    placeholder="ej: juan@email.com"
                    className="mt-2 border-2 border-luxe-gold/20 focus:border-luxe-gold transition-colors"
                  />
                </div>
                <div>
                  <Label className="text-midnight-blue font-semibold text-sm">Teléfono</Label>
                  <Input
                    placeholder="ej: +1 234 567 8900"
                    className="mt-2 border-2 border-luxe-gold/20 focus:border-luxe-gold transition-colors"
                  />
                </div>
                <div>
                  <Label className="text-midnight-blue font-semibold text-sm">Cédula / ID</Label>
                  <Input
                    placeholder="ej: 1234567890"
                    className="mt-2 border-2 border-luxe-gold/20 focus:border-luxe-gold transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in fade-in-50 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-midnight-blue">Detalles de la Venta</h3>
                  <p className="text-sm text-stainless-silver/60">Confirma los datos finales de la venta</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-midnight-blue font-semibold text-sm">Precio Final de Venta</Label>
                  <Input
                    type="number"
                    placeholder="ej: 45000"
                    value={formData.salePrice}
                    onChange={(e) => handleInputChange('salePrice', e.target.value)}
                    className="mt-2 border-2 border-luxe-gold/20 focus:border-luxe-gold transition-colors text-lg font-bold"
                  />
                </div>
                <div>
                  <Label className="text-midnight-blue font-semibold text-sm">Método de Pago</Label>
                  <Input
                    placeholder="ej: Efectivo / Tarjeta / Financiamiento"
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="mt-2 border-2 border-luxe-gold/20 focus:border-luxe-gold transition-colors"
                  />
                </div>
                <div>
                  <Label className="text-midnight-blue font-semibold text-sm">Notas Adicionales</Label>
                  <Input
                    placeholder="Observaciones, condiciones especiales, etc."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="mt-2 border-2 border-luxe-gold/20 focus:border-luxe-gold transition-colors"
                  />
                </div>
              </div>

              {/* Summary box */}
              <div className="bg-gradient-to-br from-luxe-gold/10 to-soft-gold/10 border border-luxe-gold/30 rounded-lg p-4 mt-6">
                <p className="text-sm text-stainless-silver/60 mb-2">Resumen de la venta:</p>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-midnight-blue">Total a pagar:</span>
                  <span className="text-2xl font-bold text-luxe-gold">${Number(formData.salePrice).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-6 border-t border-luxe-gold/10 bg-cream-light/30 px-6 py-4 rounded-b-lg">
          <Button
            variant="outline"
            onClick={() => onClose()}
            className="flex-1 border-2 border-midnight-blue text-midnight-blue hover:bg-midnight-blue/5 transition-all"
          >
            Cancelar
          </Button>
          {step > 1 && (
            <Button
              onClick={handlePrev}
              className="flex-1 bg-stainless-silver/50 hover:bg-stainless-silver text-white font-semibold transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </Button>
          )}
          {step < steps.length ? (
            <Button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-luxe-gold to-soft-gold hover:from-soft-gold hover:to-luxe-gold text-white font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Completar Venta
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
