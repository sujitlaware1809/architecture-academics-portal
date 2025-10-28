"use client"

import { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Lock, LogIn } from "lucide-react"
import { showToast } from "@/lib/toast"

interface LoginRequiredProps {
  children: ReactNode
  fallback?: ReactNode
  action?: string
  redirectTo?: string
  className?: string
}

export const LoginRequired: React.FC<LoginRequiredProps> = ({
  children,
  fallback,
  action = "perform this action",
  redirectTo,
  className = ""
}) => {
  const router = useRouter()
  const isAuthenticated = api.isAuthenticated()

  const handleLoginRedirect = () => {
    const currentPath = redirectTo || window.location.pathname
    router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
    showToast.info("Please log in to continue")
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Card className="max-w-md border-dashed border-2 border-gray-300 dark:border-gray-700">
        <CardContent className="p-6 text-center">
          <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Login Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please log in to {action}
          </p>
          <Button 
            onClick={handleLoginRedirect}
            className="w-full"
            variant="default"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Log In to Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

interface LoginRequiredButtonProps {
  children: ReactNode
  onClick?: () => void
  action?: string
  redirectTo?: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
}

export const LoginRequiredButton: React.FC<LoginRequiredButtonProps> = ({
  children,
  onClick,
  action = "perform this action",
  redirectTo,
  className = "",
  variant = "default",
  size = "default",
  disabled = false
}) => {
  const router = useRouter()
  const isAuthenticated = api.isAuthenticated()

  const handleClick = () => {
    if (isAuthenticated) {
      onClick?.()
    } else {
      const currentPath = redirectTo || window.location.pathname
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
      showToast.info(`Please log in to ${action}`)
    }
  }

  return (
    <Button
      onClick={handleClick}
      className={className}
      variant={variant}
      size={size}
      disabled={disabled}
    >
      {!isAuthenticated && <Lock className="h-4 w-4 mr-2" />}
      {children}
    </Button>
  )
}

interface LoginRequiredCardProps {
  children: ReactNode
  title: string
  description?: string
  action?: string
  redirectTo?: string
  className?: string
}

export const LoginRequiredCard: React.FC<LoginRequiredCardProps> = ({
  children,
  title,
  description,
  action = "access this content",
  redirectTo,
  className = ""
}) => {
  const router = useRouter()
  const isAuthenticated = api.isAuthenticated()

  if (isAuthenticated) {
    return <>{children}</>
  }

  const handleLoginRedirect = () => {
    const currentPath = redirectTo || window.location.pathname
    router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
    showToast.info("Please log in to continue")
  }

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90 dark:to-gray-900/90 z-10" />
      <div className="filter blur-sm">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <Card className="max-w-sm mx-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Lock className="h-10 w-10 text-purple-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {title}
            </h3>
            {description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                {description}
              </p>
            )}
            <Button 
              onClick={handleLoginRedirect}
              className="w-full"
              size="sm"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Log In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </Card>
  )
}

export default LoginRequired