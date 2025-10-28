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
        // Registration successful - redirect to profile setup
        window.dispatchEvent(new Event('auth-change'))
        setTimeout(() => {
          if (redirectTo) {
            router.push(redirectTo)
          } else {
            router.push("/profile/setup")
          }
        }, 1000)
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
        <div className="lg:w-1/2 flex flex-col justify-center items-center p-4 lg:p-6 text-white">
          
          <div className="max-w-md space-y-4 mt-12 lg:mt-0">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 bg-purple-500/20 px-3 py-1.5 rounded-full border border-purple-400/30">
                <Sparkles className="h-4 w-4 text-purple-300" />
                <span className="text-sm font-medium text-purple-200">Join Our Community!</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                Start Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Architecture Journey
                </span>
              </h2>
              <p className="text-base text-gray-300">
                Join thousands of architecture professionals and students. Access NATA courses, job opportunities, and build your career.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3">
                <GraduationCap className="h-5 w-5 text-purple-300" />
                <span className="text-sm text-gray-300">NATA Preparation Courses</span>
              </div>
              <div className="flex items-center space-x-3">
                <Briefcase className="h-5 w-5 text-indigo-300" />
                <span className="text-sm text-gray-300">Exclusive Job Opportunities</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-pink-300" />
                <span className="text-sm text-gray-300">Professional Network</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-4 lg:p-6">
          <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-1">Create Account</h3>
                <p className="text-sm text-gray-300">Join the architecture community</p>
              </div>

              {apiError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                  <p className="text-sm text-red-200">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-200">First Name</label>
                    <Input
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="h-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 text-sm"
                      required
                    />
                    {errors.firstName && <p className="text-xs text-red-300">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-200">Last Name</label>
                    <Input
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="h-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 text-sm"
                      required
                    />
                    {errors.lastName && <p className="text-xs text-red-300">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-200">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 text-sm"
                      required
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-300">{errors.email}</p>}
                </div>

                {/* User Type Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-200">I am a</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectChange("student")}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                        formData.userType === "student" 
                          ? "border-indigo-500 bg-indigo-500/20 shadow-md" 
                          : "border-white/20 bg-white/5 hover:border-white/30"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <GraduationCap className={`h-4 w-4 ${
                          formData.userType === "student" ? "text-indigo-300" : "text-gray-400"
                        }`} />
                        <span className={`text-xs font-medium ${
                          formData.userType === "student" ? "text-indigo-200" : "text-gray-300"
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
                          ? "border-purple-500 bg-purple-500/20 shadow-md" 
                          : "border-white/20 bg-white/5 hover:border-white/30"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <Users className={`h-4 w-4 ${
                          formData.userType === "faculty" ? "text-purple-300" : "text-gray-400"
                        }`} />
                        <span className={`text-xs font-medium ${
                          formData.userType === "faculty" ? "text-purple-200" : "text-gray-300"
                        }`}>Faculty</span>
                      </div>
                      {formData.userType === "faculty" && (
                        <div className="absolute -top-1 -right-1 bg-purple-500 text-white rounded-full p-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectChange("architect")}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                        formData.userType === "architect" 
                          ? "border-green-500 bg-green-500/20 shadow-md" 
                          : "border-white/20 bg-white/5 hover:border-white/30"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <Briefcase className={`h-4 w-4 ${
                          formData.userType === "architect" ? "text-green-300" : "text-gray-400"
                        }`} />
                        <span className={`text-xs font-medium ${
                          formData.userType === "architect" ? "text-green-200" : "text-gray-300"
                        }`}>Architect</span>
                      </div>
                      {formData.userType === "architect" && (
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </button>
                  </div>
                  {errors.userType && <p className="text-xs text-red-300">{errors.userType}</p>}
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
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400"
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
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400"
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
                  className="w-full h-11 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Create Account</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </Button>

                {/* Terms */}
                <p className="text-xs text-gray-400 text-center">
                  By creating an account, you agree to our{" "}
                  <a href="#" className="text-purple-400 hover:text-purple-300">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
                </p>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-300">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
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