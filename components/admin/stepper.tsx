'use client'

import { Check } from 'lucide-react'

export interface StepperStep {
  number: number
  title: string
  description?: string
  completed?: boolean
}

interface StepperProps {
  steps: StepperStep[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className = '' }: StepperProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, idx) => (
        <div key={step.number} className="flex items-center flex-1">
          {/* Step circle */}
          <div
            className={`flex items-center justify-center w-14 h-14 rounded-full border-2 font-bold text-lg transition-all shadow-md ${
              step.completed || currentStep > step.number
                ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-600 text-white'
                : currentStep === step.number
                  ? 'bg-gradient-to-br from-luxe-gold to-soft-gold border-luxe-gold text-white shadow-lg'
                  : 'bg-white border-stainless-silver/30 text-stainless-silver'
            }`}
          >
            {step.completed || currentStep > step.number ? (
              <Check className="w-7 h-7" />
            ) : (
              <span>{step.number}</span>
            )}
          </div>

          {/* Connector line */}
          {idx < steps.length - 1 && (
            <div
              className={`flex-1 h-1.5 mx-3 transition-all ${
                step.completed || currentStep > step.number
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : 'bg-stainless-silver/20'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export function StepperLabels({
  steps,
  currentStep,
  className = '',
}: StepperProps & { className?: string }) {
  return (
    <div className={`flex justify-between gap-4 ${className}`}>
      {steps.map((step) => (
        <div key={step.number} className="flex-1 text-center">
          <p
            className={`font-bold text-sm transition-colors ${
              currentStep >= step.number ? 'text-luxe-gold' : 'text-stainless-silver'
            }`}
          >
            {step.title}
          </p>
          {step.description && (
            <p className="text-xs text-stainless-silver/60 mt-1">{step.description}</p>
          )}
        </div>
      ))}
    </div>
  )
}
