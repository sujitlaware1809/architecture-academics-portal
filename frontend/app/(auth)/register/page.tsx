"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Building, Eye, EyeOff, Mail, Lock, User, CheckCircle2, UserPlus, ArrowLeft, BookOpen, GraduationCap, Users, Briefcase, ArrowRight, Sparkles, Globe, Award } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [redirectTo, setRedirectTo] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    userType: "", // STUDENT, FACULTY, ARCHITECT, GENERAL_USER, NATA_STUDENT
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    // Student fields
    college: "",
    year: "",
    degree: "", // Added for Student
    // NATA Student fields
    location: "", // Added for NATA Student
    // Faculty fields
    experience: "",
    // Architect fields
    caoNumber: "",
    company: "",
    // General User fields
    interest: "", // industry_partner, service_provider, material_supplier, other
    organizationName: ""
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

    if (!formData.userType) newErrors.userType = "Please select user type"
    
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    else if (!/^[a-zA-Z]+$/.test(formData.firstName.trim())) newErrors.firstName = "First name must contain only letters"
    
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    else if (!/^[a-zA-Z]+$/.test(formData.lastName.trim())) newErrors.lastName = "Last name must contain only letters"
    
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    
    if (!formData.phone.trim()) newErrors.phone = "Mobile number is required"
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = "Enter valid 10-digit mobile number"
    
    if (!formData.password) newErrors.password = "Password is required"
    else {
      if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
      else if (!/(?=.*[a-z])/.test(formData.password)) newErrors.password = "Password must contain at least one lowercase letter"
      else if (!/(?=.*[A-Z])/.test(formData.password)) newErrors.password = "Password must contain at least one uppercase letter"
      else if (!/(?=.*\d)/.test(formData.password)) newErrors.password = "Password must contain at least one number"
      else if (!/(?=.*[@$!%*?&])/.test(formData.password)) newErrors.password = "Password must contain at least one special character (@$!%*?&)"
    }
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"

    // Conditional validation based on user type
    if (formData.userType === "STUDENT") {
      if (!formData.college.trim()) newErrors.college = "College name is required"
      if (!formData.year.trim()) newErrors.year = "Academic year is required"
      if (!formData.degree.trim()) newErrors.degree = "Degree is required"
    } else if (formData.userType === "NATA_STUDENT") {
      if (!formData.college.trim()) newErrors.college = "School name is required"
      if (!formData.location.trim()) newErrors.location = "Location is required"
    } else if (formData.userType === "FACULTY") {
      if (!formData.degree.trim()) newErrors.degree = "Highest degree is required"
      if (!formData.experience.trim()) newErrors.experience = "Teaching experience is required"
    } else if (formData.userType === "ARCHITECT") {
      if (!formData.company.trim()) newErrors.company = "Company/Practice name is required"
    } else if (formData.userType === "GENERAL_USER") {
      if (!formData.interest) newErrors.interest = "Please select your area of interest"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/(?=.*[a-z])/.test(password)) strength += 1
    if (/(?=.*[A-Z])/.test(password)) strength += 1
    if (/(?=.*\d)/.test(password)) strength += 1
    if (/(?=.*[@$!%*?&])/.test(password)) strength += 1
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setApiError("")
    
    try {
      // Map fields based on user type
      let specialization = formData.interest;
      if (formData.userType === "STUDENT") {
        specialization = formData.degree;
      } else if (formData.userType === "NATA_STUDENT") {
        specialization = formData.location; // Using specialization field for location
      } else if (formData.userType === "FACULTY") {
        specialization = formData.degree;
      }

      const result = await api.register({
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        user_type: formData.userType,
        university: formData.college || undefined,
        graduation_year: formData.year ? parseInt(formData.year) : undefined,
        teaching_experience: formData.experience || undefined,
        cao_number: formData.caoNumber || undefined,
        company: formData.company || formData.organizationName || undefined,
        specialization: specialization || undefined,
      })
      
      if (result.error) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : 'Registration failed. Please try again.'
        setApiError(errorMessage)
      } else {
        // Registration successful - redirect to success page
        setSuccessMessage("Registration successful! Please check your email for the verification link.")
        
        setTimeout(() => {
          router.push(`/login?registered=true`)
        }, 3000)
      }
    } catch (error) {
      console.error('Registration error:', error)
      setApiError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderConditionalFields = () => {
    if (formData.userType === "STUDENT") {
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">College/University</label>
            <Input
              name="college"
              placeholder="e.g. IIT Delhi"
              value={formData.college}
              onChange={handleInputChange}
              className="h-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
            />
            {errors.college && <p className="text-xs text-red-600">{errors.college}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Academic Year</label>
              <select
                name="year"
                value={formData.year}
                onChange={(e) => handleInputChange(e as any)}
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm"
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
                <option value="5">5th Year</option>
              </select>
              {errors.year && <p className="text-xs text-red-600">{errors.year}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Degree</label>
              <select
                name="degree"
                value={formData.degree}
                onChange={(e) => handleInputChange(e as any)}
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm"
              >
                <option value="">Select Degree</option>
                <option value="B.Arch">B.Arch</option>
                <option value="M.Arch">M.Arch</option>
                <option value="Other">Other</option>
              </select>
              {errors.degree && <p className="text-xs text-red-600">{errors.degree}</p>}
            </div>
          </div>
        </div>
      )
    } else if (formData.userType === "NATA_STUDENT") {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">School</label>
            <Input
              name="college"
              placeholder="e.g. DPS Delhi"
              value={formData.college}
              onChange={handleInputChange}
              className="h-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
            />
            {errors.college && <p className="text-xs text-red-600">{errors.college}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Location</label>
            <Input
              name="location"
              placeholder="e.g. Mumbai"
              value={formData.location}
              onChange={handleInputChange}
              className="h-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
            />
            {errors.location && <p className="text-xs text-red-600">{errors.location}</p>}
          </div>
        </div>
      )
    } else if (formData.userType === "FACULTY") {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Highest Degree</label>
            <Input
              name="degree"
              placeholder="e.g. M.Arch, Ph.D"
              value={formData.degree}
              onChange={handleInputChange}
              className="h-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
            />
            {errors.degree && <p className="text-xs text-red-600">{errors.degree}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Teaching Experience</label>
            <Input
              name="experience"
              placeholder="e.g. 5 years"
              value={formData.experience}
              onChange={handleInputChange}
              className="h-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
            />
            {errors.experience && <p className="text-xs text-red-600">{errors.experience}</p>}
          </div>
        </div>
      )
    } else if (formData.userType === "ARCHITECT") {
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Company/Practice Name</label>
            <Input
              name="company"
              placeholder="e.g. ABC Architects"
              value={formData.company}
              onChange={handleInputChange}
              className="h-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
            />
            {errors.company && <p className="text-xs text-red-600">{errors.company}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">CAO Number (Optional)</label>
            <Input
              name="caoNumber"
              placeholder="Council of Architecture registration number"
              value={formData.caoNumber}
              onChange={handleInputChange}
              className="h-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
            />
            <p className="text-xs text-gray-500">* This information will be kept confidential</p>
          </div>
        </div>
      )
    } else if (formData.userType === "GENERAL_USER") {
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Area of Interest</label>
            <select
              name="interest"
              value={formData.interest}
              onChange={(e) => handleInputChange({ target: { name: 'interest', value: e.target.value } } as any)}
              className="h-10 w-full bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg px-3 text-sm"
            >
              <option value="">Select your interest</option>
              <option value="industry_partner">Industry Partner</option>
              <option value="service_provider">Service Provider</option>
              <option value="material_supplier">Architectural Material Manufacturer/Supplier</option>
              <option value="other">Other</option>
            </select>
            {errors.interest && <p className="text-xs text-red-600">{errors.interest}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Organization Name (Optional)</label>
            <Input
              name="organizationName"
              placeholder="e.g. XYZ Materials Pvt. Ltd."
              value={formData.organizationName}
              onChange={handleInputChange}
              className="h-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
            />
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
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
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
                {/* User Type Selection - FIRST */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">I am a <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectChange("STUDENT")}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                        formData.userType === "STUDENT" 
                          ? "border-indigo-500 bg-indigo-50 shadow-md" 
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <GraduationCap className={`h-4 w-4 ${
                          formData.userType === "STUDENT" ? "text-indigo-600" : "text-gray-500"
                        }`} />
                        <span className={`text-xs font-medium ${
                          formData.userType === "STUDENT" ? "text-indigo-700" : "text-gray-600"
                        }`}>Student</span>
                      </div>
                      {formData.userType === "STUDENT" && (
                        <div className="absolute -top-1 -right-1 bg-indigo-500 text-white rounded-full p-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectChange("FACULTY")}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                        formData.userType === "FACULTY" 
                          ? "border-blue-500 bg-blue-50 shadow-md" 
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <Users className={`h-4 w-4 ${
                          formData.userType === "FACULTY" ? "text-blue-600" : "text-gray-500"
                        }`} />
                        <span className={`text-xs font-medium ${
                          formData.userType === "FACULTY" ? "text-blue-700" : "text-gray-600"
                        }`}>Faculty</span>
                      </div>
                      {formData.userType === "FACULTY" && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectChange("ARCHITECT")}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                        formData.userType === "ARCHITECT" 
                          ? "border-green-500 bg-green-50 shadow-md" 
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <Briefcase className={`h-4 w-4 ${
                          formData.userType === "ARCHITECT" ? "text-green-600" : "text-gray-500"
                        }`} />
                        <span className={`text-xs font-medium ${
                          formData.userType === "ARCHITECT" ? "text-green-700" : "text-gray-600"
                        }`}>Architect</span>
                      </div>
                      {formData.userType === "ARCHITECT" && (
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectChange("GENERAL_USER")}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                        formData.userType === "GENERAL_USER" 
                          ? "border-purple-500 bg-purple-50 shadow-md" 
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <Globe className={`h-4 w-4 ${
                          formData.userType === "GENERAL_USER" ? "text-purple-600" : "text-gray-500"
                        }`} />
                        <span className={`text-xs font-medium ${
                          formData.userType === "GENERAL_USER" ? "text-purple-700" : "text-gray-600"
                        }`}>General</span>
                      </div>
                      {formData.userType === "GENERAL_USER" && (
                        <div className="absolute -top-1 -right-1 bg-purple-500 text-white rounded-full p-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectChange("NATA_STUDENT")}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                        formData.userType === "NATA_STUDENT" 
                          ? "border-orange-500 bg-orange-50 shadow-md" 
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <Award className={`h-4 w-4 ${
                          formData.userType === "NATA_STUDENT" ? "text-orange-600" : "text-gray-500"
                        }`} />
                        <span className={`text-xs font-medium ${
                          formData.userType === "NATA_STUDENT" ? "text-orange-700" : "text-gray-600"
                        }`}>NATA</span>
                      </div>
                      {formData.userType === "NATA_STUDENT" && (
                        <div className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full p-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </button>
                  </div>
                  {errors.userType && <p className="text-xs text-red-600">{errors.userType}</p>}
                </div>

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

                {/* Mobile Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10 h-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                      required
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                </div>

                {/* Conditional Fields */}
                {renderConditionalFields()}

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 h-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 h-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex space-x-1 h-1.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-full w-full rounded-full transition-colors duration-300 ${
                            passwordStrength >= level
                              ? passwordStrength <= 2
                                ? "bg-red-500"
                                : passwordStrength <= 3
                                ? "bg-yellow-500"
                                : "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Strength</span>
                      <span>{passwordStrength <= 2 ? "Weak" : passwordStrength <= 3 ? "Medium" : "Strong"}</span>
                    </div>
                  </div>
                )}

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