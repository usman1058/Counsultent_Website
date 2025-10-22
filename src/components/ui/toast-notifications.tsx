'use client'

import { useEffect } from 'react'
import { toast, Toaster } from 'sonner'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

interface ToastNotificationProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
}

export function useToastNotification() {
  const showSuccess = (message: string) => {
    toast.success(message, {
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      className: 'border-green-200 bg-green-50'
    })
  }

  const showError = (message: string) => {
    toast.error(message, {
      icon: <XCircle className="w-4 h-4 text-red-500" />,
      className: 'border-red-200 bg-red-50'
    })
  }

  const showWarning = (message: string) => {
    toast.warning(message, {
      icon: <AlertCircle className="w-4 h-4 text-yellow-500" />,
      className: 'border-yellow-200 bg-yellow-50'
    })
  }

  const showInfo = (message: string) => {
    toast.info(message, {
      icon: <Info className="w-4 h-4 text-blue-500" />,
      className: 'border-blue-200 bg-blue-50'
    })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}

export function ToastNotifications() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        style: {
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '12px 16px',
        }
      }}
    />
  )
}