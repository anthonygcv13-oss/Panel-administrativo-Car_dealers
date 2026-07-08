import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return '0,00';
  const num = typeof value === 'number' ? value : parseFloat(value as string);
  if (isNaN(num)) return '0,00';
  return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
