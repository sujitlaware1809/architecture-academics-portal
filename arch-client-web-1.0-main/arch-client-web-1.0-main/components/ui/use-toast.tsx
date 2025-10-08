import * as React from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

type ToastState = {
  toasts: Array<ToastProps & { id: string }>
  addToast: (toast: ToastProps) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastState | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Array<ToastProps & { id: string }>>([])

  const addToast = React.useCallback((toast: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 w-full md:max-w-[420px] p-4 space-y-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-md border shadow-md ${
              toast.variant === "destructive"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-white border-gray-200"
            }`}
          >
            {toast.title && (
              <h3 className="font-semibold text-sm">{toast.title}</h3>
            )}
            {toast.description && (
              <p className="text-sm opacity-90">{toast.description}</p>
            )}
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function toast(props: ToastProps) {
  // This is a simple implementation - in a real app you'd want a more robust solution
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('toast', { detail: props })
    window.dispatchEvent(event)
  }
}

export function useToast() {
  const context = React.useContext(ToastContext)
  
  if (!context) {
    // Fallback implementation for when ToastProvider is not available
    return {
      toast: (props: ToastProps) => {
        if (props.variant === "destructive") {
          console.error(`${props.title}: ${props.description}`)
          alert(`Error: ${props.title}\n${props.description}`)
        } else {
          console.log(`${props.title}: ${props.description}`)
          alert(`${props.title}\n${props.description}`)
        }
      }
    }
  }

  return {
    toast: context.addToast
  }
}