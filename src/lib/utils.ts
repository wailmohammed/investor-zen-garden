
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format currency values
export function formatCurrency(value: number, currency: string = "USD", options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    ...options
  }).format(value);
}

// Helper function to format percentage values
export function formatPercent(value: number, options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }).format(value / 100);
}
