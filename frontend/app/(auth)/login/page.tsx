"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Building, Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Shield } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [redirectTo, setRedirectTo] = useState<string | null>(null)

  useEffect(() => {
    // Get redirect parameter from URL
    const redirect = searchParams.get('redirect')
    if (redirect) {
      setRedirectTo(redirect)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      const result = await api.login({ email, password })
      
      if (result.error) {
        // Ensure error is a string
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : 'Login failed. Please try again.'
        setError(errorMessage)
      } else if (result.data) {
        // Login successful, dispatch custom event to notify other components
        window.dispatchEvent(new Event('auth-change'))
        
        const user = result.data.user
        
        // Check if there's a redirect URL
        if (redirectTo) {
          router.push(redirectTo)
          return
        }
        
        // Check if user is a recruiter (handle both string and enum object)
        let userRole = "";
        if (typeof user.role === "string") {
          userRole = user.role;
        } else if (typeof user.role === "object" && user.role !== null && "value" in user.role) {
          userRole = user.role.value;
        }
        
        if (userRole === 'RECRUITER') {
          // Special case for the predefined recruiter
          if (email === 'recruiter@architectureacademics.com') {
            router.push("/recruiter-dashboard")
          } else {
            router.push("/")
          }
        } else {
          // For regular users, redirect to main page
          router.push("/")
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Branding */}
        <div className="lg:w-1/2 flex flex-col justify-center items-center p-4 lg:p-8 text-white">
          
          <div className="max-w-md space-y-6 mt-12 lg:mt-0">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 bg-purple-500/20 px-3 py-1.5 rounded-full border border-purple-400/30">
                <Sparkles className="h-4 w-4 text-purple-300" />
                <span className="text-sm font-medium text-purple-200">Welcome Back!</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                Continue Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Learning Journey
                </span>
              </h2>
              <p className="text-base text-gray-300">
                Access your courses, connect with peers, and advance your architectural education.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-start space-x-3">
                <div className="bg-purple-500/20 p-1.5 rounded-lg border border-purple-400/30">
                  <Shield className="h-4 w-4 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Secure & Private</h3>
                  <p className="text-xs text-gray-400">Your data is protected with enterprise-grade security</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-indigo-500/20 p-1.5 rounded-lg border border-indigo-400/30">
                  <Building className="h-4 w-4 text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Professional Platform</h3>
                  <p className="text-xs text-gray-400">Built for architecture students and professionals</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-1">Sign In</h3>
                <p className="text-sm text-gray-300">Enter your credentials to access your account</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-200">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 rounded-lg text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-200">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 rounded-lg text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="mr-2 rounded border-white/30 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0" 
                    />
                    <span className="text-gray-300 group-hover:text-white transition-colors">Remember me</span>
                  </label>
                  <a href="#" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                    Forgot password?
                  </a>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Sign In</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-transparent text-gray-400">Or continue with</span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="flex items-center justify-center px-3 py-2.5 bg-white/5 border border-white/20 rounded-lg text-xs font-medium text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24">
                      <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center px-3 py-2.5 bg-white/5 border border-white/20 rounded-lg text-xs font-medium text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <svg className="h-4 w-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                    Twitter
                  </button>
                </div>
              </form>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-300">
                  Don't have an account?{" "}
                  <Link href="/register" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                    Create one now →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
