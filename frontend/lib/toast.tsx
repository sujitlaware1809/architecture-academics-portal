import toast, { 
  Toast, 
  ToastOptions, 
  Renderable, 
  ValueFunction,
  resolveValue
} from 'react-hot-toast'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

// Enhanced toast options with our design system
const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '14px',
    padding: '12px 16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    maxWidth: '420px',
  },
}

// Custom toast component with icons
interface CustomToastProps {
  toast: Toast
  message: Renderable
  type: 'success' | 'error' | 'warning' | 'info'
}

const CustomToast: React.FC<CustomToastProps> = ({ toast: t, message, type }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  }

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
  }

  return (
    <div
      className={`
        ${t.visible ? 'animate-enter' : 'animate-leave'}
        flex items-center gap-3 p-4 rounded-lg border transition-all duration-300
        ${bgColors[type]}
        shadow-lg backdrop-blur-sm
      `}
    >
      {icons[type]}
      <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
        {resolveValue(message, t)}
      </div>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <X className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  )
}

// Enhanced toast functions
export const showToast = {
  success: (message: Renderable, options?: ToastOptions) => {
    return toast.custom(
      (t) => <CustomToast toast={t} message={message} type="success" />,
      { ...defaultOptions, ...options }
    )
  },

  error: (message: Renderable, options?: ToastOptions) => {
    return toast.custom(
      (t) => <CustomToast toast={t} message={message} type="error" />,
      { ...defaultOptions, duration: 6000, ...options }
    )
  },

  warning: (message: Renderable, options?: ToastOptions) => {
    return toast.custom(
      (t) => <CustomToast toast={t} message={message} type="warning" />,
      { ...defaultOptions, duration: 5000, ...options }
    )
  },

  info: (message: Renderable, options?: ToastOptions) => {
    return toast.custom(
      (t) => <CustomToast toast={t} message={message} type="info" />,
      { ...defaultOptions, ...options }
    )
  },

  // Loading toast with promise handling
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: Renderable
      success: ValueFunction<Renderable, T>
      error: ValueFunction<Renderable, any>
    },
    options?: ToastOptions
  ) => {
    return toast.promise(promise, messages, {
      ...defaultOptions,
      ...options,
      loading: {
        style: {
          ...defaultOptions.style,
          background: 'hsl(var(--muted))',
        },
      },
      success: {
        style: {
          ...defaultOptions.style,
          background: 'hsl(var(--background))',
          borderColor: 'hsl(var(--border))',
        },
      },
      error: {
        style: {
          ...defaultOptions.style,
          background: 'hsl(var(--background))',
          borderColor: 'hsl(var(--destructive))',
        },
      },
    })
  },

  // Dismiss functions
  dismiss: (toastId?: string) => toast.dismiss(toastId),
  remove: (toastId?: string) => toast.remove(toastId),
}

// Utility functions for common scenarios
export const toastUtils = {
  // API response handling
  handleApiResponse: (response: any, successMessage?: string) => {
    if (response.error) {
      showToast.error(response.error || 'An error occurred')
      return false
    } else {
      if (successMessage) {
        showToast.success(successMessage)
      }
      return true
    }
  },

  // Form submission
  handleFormSubmission: async (
    submitFn: () => Promise<any>,
    messages?: {
      loading?: string
      success?: string
      error?: string
    }
  ) => {
    const loadingToast = showToast.info(messages?.loading || 'Submitting...', { duration: Infinity })
    
    try {
      const result = await submitFn()
      showToast.dismiss(loadingToast)
      
      if (result.error) {
        showToast.error(messages?.error || result.error || 'Submission failed')
        return { success: false, error: result.error }
      } else {
        showToast.success(messages?.success || 'Submitted successfully')
        return { success: true, data: result }
      }
    } catch (error: any) {
      showToast.dismiss(loadingToast)
      showToast.error(messages?.error || error.message || 'An error occurred')
      return { success: false, error: error.message }
    }
  },

  // File upload
  handleFileUpload: (
    uploadFn: () => Promise<any>,
    fileName?: string
  ) => {
    return showToast.promise(
      uploadFn(),
      {
        loading: `Uploading ${fileName || 'file'}...`,
        success: () => `${fileName || 'File'} uploaded successfully!`,
        error: (err) => `Failed to upload ${fileName || 'file'}: ${err.message}`,
      }
    )
  },

  // Auth actions
  authSuccess: (action: 'login' | 'register' | 'logout' | 'update') => {
    const messages = {
      login: '🎉 Welcome back! You\'re now logged in.',
      register: '🎊 Welcome to AAO! Your account has been created.',
      logout: '👋 You\'ve been logged out successfully.',
      update: '✅ Your profile has been updated successfully.',
    }
    showToast.success(messages[action])
  },

  authError: (action: 'login' | 'register' | 'logout' | 'update', error?: string) => {
    const defaultMessages = {
      login: 'Failed to log in. Please check your credentials.',
      register: 'Failed to create account. Please try again.',
      logout: 'Failed to log out. Please try again.',
      update: 'Failed to update profile. Please try again.',
    }
    showToast.error(error || defaultMessages[action])
  },

  // Course actions
  courseEnrolled: (courseName: string) => {
    showToast.success(`🎓 Successfully enrolled in "${courseName}"!`)
  },

  courseCompleted: (courseName: string) => {
    showToast.success(`🏆 Congratulations! You've completed "${courseName}"!`)
  },

  // Job actions
  jobApplied: (jobTitle: string) => {
    showToast.success(`✅ Successfully applied for "${jobTitle}"!`)
  },

  jobSaved: (jobTitle: string) => {
    showToast.success(`💾 "${jobTitle}" saved to your favorites!`)
  },

  // General actions
  copied: (item: string = 'Content') => {
    showToast.success(`📋 ${item} copied to clipboard!`)
  },

  saved: (item: string = 'Changes') => {
    showToast.success(`💾 ${item} saved successfully!`)
  },

  deleted: (item: string = 'Item') => {
    showToast.success(`🗑️ ${item} deleted successfully!`)
  },
}

// CSS for animations (add to globals.css)
export const toastAnimationCSS = `
@keyframes enter {
  0% {
    transform: translate3d(0, -200%, 0) scale(0.6);
    opacity: 0.5;
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 1;
  }
}

@keyframes leave {
  0% {
    transform: translate3d(0, 0, -1px) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate3d(0, -150%, -1px) scale(0.6);
    opacity: 0;
  }
}

.animate-enter {
  animation: enter 0.35s ease-out;
}

.animate-leave {
  animation: leave 0.4s ease-in forwards;
}
`

export default showToast