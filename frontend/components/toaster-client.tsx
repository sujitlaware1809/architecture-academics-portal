"use client"

import React from 'react'
import { Toaster } from 'react-hot-toast'

export default function ToasterClient() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#374151',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 16px',
          maxWidth: '420px',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
      }}
    />
  )
}
