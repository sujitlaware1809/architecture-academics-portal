"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Building, Eye, EyeOff, Mail, Lock, User, CheckCircle2, UserPlus, ArrowLeft, BookOpen, GraduationCap, Users, Briefcase, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [redirectTo, setRedirectTo] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "", // student, faculty, architect
    // Student fields
    college: "",
    year: "",
    // Faculty fields
    degree: "",
    experience: "",
    // Architect fields
    caoNumber: "",
    company: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const redirect = searchParams.get('redirect')
    if (redirect) {
      setRedirectTo(redirect)
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, userType: value }))
    if (errors.userType) {
      setErrors(prev => ({ ...prev, userType: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    if (!formData.userType) newErrors.userType = "Please select user type"

    // Conditional validation based on user type
    if (formData.userType === "student") {
      if (!formData.college.trim()) newErrors.college = "College name is required"
      if (!formData.year.trim()) newErrors.year = "Academic year is required"
    } else if (formData.userType === "faculty") {
      if (!formData.degree.trim()) newErrors.degree = "Highest degree is required"
      if (!formData.experience.trim()) newErrors.experience = "Teaching experience is required"
    } else if (formData.userType === "architect") {
      if (!formData.company.trim()) newErrors.company = "Company/Practice name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setApiError("")
    
    try {
      const result = await api.register({
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        userType: formData.userType,
        college: formData.college,
        year: formData.year,
        degree: formData.degree,
        experience: formData.experience,
        cao_number: formData.caoNumber,
        company: formData.company
      })
      
      if (result.error) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : 'Registration failed. Please try again.'
        setApiError(errorMessage)
      } else {
        // Registration successful - redirect to OTP verification
        setSuccessMessage("Registration successful! Please verify your email to continue.")
        
        // Store email for verification and redirect
        localStorage.setItem('pendingVerificationEmail', formData.email)
        
        setTimeout(() => {
          router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`)
        }, 2000)
      }
    } catch (error) {
      console.error('Registration error:', error)
      setApiError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderConditionalFields = () => {
    if (formData.userType === "student") {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-200">College/University</label>
            <Input
              name="college"
              placeholder="e.g. IIT Delhi"
              value={formData.college}
              onChange={handleInputChange}
              className="h-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 text-sm"
            />
            {errors.college && <p className="text-xs text-red-300">{errors.college}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-200">Academic Year</label>
            <Input
              name="year"
              placeholder="e.g. 3rd Year"
              value={formData.year}
              onChange={handleInputChange}
              className="h-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 text-sm"
            />
            {errors.year && <p className="text-xs text-red-300">{errors.year}</p>}
          </div>
        </div>
      )
    } else if (formData.userType === "faculty") {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-200">Highest Degree</label>
            <Input
              name="degree"
              placeholder="e.g. M.Arch, Ph.D"
              value={formData.degree}
              onChange={handleInputChange}
              className="h-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 text-sm"
            />
            {errors.degree && <p className="text-xs text-red-300">{errors.degree}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-200">Teaching Experience</label>
            <Input
              name="experience"
              placeholder="e.g. 5 years"
              value={formData.experience}
              onChange={handleInputChange}
              className="h-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 text-sm"
            />
            {errors.experience && <p className="text-xs text-red-300">{errors.experience}</p>}
          </div>
        </div>
      )
    } else if (formData.userType === "architect") {
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-200">Company/Practice Name</label>
            <Input
              name="company"
              placeholder="e.g. ABC Architects"
              value={formData.company}
              onChange={handleInputChange}
              className="h-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 text-sm"
            />
            {errors.company && <p className="text-xs text-red-300">{errors.company}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-200">CAO Number (Optional)</label>
            <Input
              name="caoNumber"
              placeholder="Council of Architecture registration number"
              value={formData.caoNumber}
              onChange={handleInputChange}
              className="h-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 text-sm"
            />
            <p className="text-xs text-gray-400">* This information will be kept confidential</p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/20"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-100/30 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-indigo-100/30 rounded-full filter blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Branding */}
        <div className="lg:w-1/2 flex flex-col justify-center items-center p-4 lg:p-6 text-gray-800">
          
          <div className="max-w-md space-y-4 mt-12 lg:mt-0">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 bg-blue-100 px-3 py-1.5 rounded-full border border-blue-200">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Join Our Community!</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight text-gray-900">
                Start Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Architecture Journey
                </span>
              </h2>
              <p className="text-base text-gray-600">
                Join thousands of architecture professionals and students. Access NATA courses, job opportunities, and build your career.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-700">NATA Preparation Courses</span>
              </div>
              <div className="flex items-center space-x-3">
                <Briefcase className="h-5 w-5 text-indigo-600" />
                <span className="text-sm text-gray-700">Exclusive Job Opportunities</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-pink-600" />
                <span className="text-sm text-gray-700">Professional Network</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-4 lg:p-6">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h3>
                <p className="text-gray-600">Join the architecture community</p>
              </div>

              {apiError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{apiError}</p>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-green-700">{successMessage}</p>
                    <p className="text-xs text-green-600 mt-1">Redirecting to login page...</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <Input
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="h-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                      required
                    />
                    {errors.firstName && <p className="text-xs text-red-600">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <Input
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="h-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                      required
                    />
                    {errors.lastName && <p className="text-xs text-red-600">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                      required
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                </div>

                {/* User Type Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">I am a</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectChange("student")}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                        formData.userType === "student" 
                          ? "border-indigo-500 bg-indigo-50 shadow-md" 
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <GraduationCap className={`h-4 w-4 ${
                          formData.userType === "student" ? "text-indigo-600" : "text-gray-500"
                        }`} />
                        <span className={`text-xs font-medium ${
                          formData.userType === "student" ? "text-indigo-700" : "text-gray-600"
                        }`}>Student</span>
                      </div>
                      {formData.userType === "student" && (
                        <div className="absolute -top-1 -right-1 bg-indigo-500 text-white rounded-full p-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectChange("faculty")}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                        formData.userType === "faculty" 
                          ? "border-blue-500 bg-blue-50 shadow-md" 
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <Users className={`h-4 w-4 ${
                          formData.userType === "faculty" ? "text-blue-600" : "text-gray-500"
                        }`} />
                        <span className={`text-xs font-medium ${
                          formData.userType === "faculty" ? "text-blue-700" : "text-gray-600"
                        }`}>Faculty</span>
                      </div>
                      {formData.userType === "faculty" && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectChange("architect")}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                        formData.userType === "architect" 
                          ? "border-green-500 bg-green-50 shadow-md" 
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <Briefcase className={`h-4 w-4 ${
                          formData.userType === "architect" ? "text-green-600" : "text-gray-500"
                        }`} />
                        <span className={`text-xs font-medium ${
                          formData.userType === "architect" ? "text-green-700" : "text-gray-600"
                        }`}>Architect</span>
                      </div>
                      {formData.userType === "architect" && (
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </button>
                  </div>
                  {errors.userType && <p className="text-xs text-red-600">{errors.userType}</p>}
                </div>

                {/* Conditional Fields */}
                {renderConditionalFields()}

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-200">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 h-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-300">{errors.password}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-200">Confirm</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 h-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-300">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Register Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Create Account</span>
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </div>
                  )}
                </Button>

                {/* Terms */}
                <p className="text-xs text-gray-500 text-center">
                  By creating an account, you agree to our{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
                </p>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    Sign in here →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
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