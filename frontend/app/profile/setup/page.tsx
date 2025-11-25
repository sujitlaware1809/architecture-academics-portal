"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Building, 
  GraduationCap, 
  Briefcase, 
  User, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Calendar,
  Award,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2
} from "lucide-react"

interface ProfileFormData {
  user_type: "student" | "professional" | ""
  
  // Common fields
  phone: string
  location: string
  bio: string
  linkedin: string
  portfolio: string
  website: string
  
  // Student fields
  university: string
  graduation_year: number | string
  specialization: string
  
  // Professional fields
  company_name: string
  experience_level: string
  license_number: string
  expertise: string
}

export default function ProfileSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  const [formData, setFormData] = useState<ProfileFormData>({
    user_type: "",
    phone: "",
    location: "",
    bio: "",
    linkedin: "",
    portfolio: "",
    website: "",
    university: "",
    graduation_year: "",
    specialization: "",
    company_name: "",
    experience_level: "",
    license_number: "",
    expertise: ""
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }
      const user = await api.get("/auth/me")
      setCurrentUser(user)
    } catch (err) {
      console.error("Auth check failed:", err)
      router.push("/login")
    }
  }

  const handleInputChange = (field: keyof ProfileFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleUserTypeSelect = (type: "student" | "professional") => {
    setFormData(prev => ({ ...prev, user_type: type }))
    setStep(2)
  }

  const handleNext = () => {
    if (step === 2) {
      // Validate common fields
      if (!formData.phone || !formData.location || !formData.bio) {
        setError("Please fill in all required fields")
        return
      }
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    // Validate specific fields based on user type
    if (formData.user_type === "student") {
      if (!formData.university || !formData.graduation_year || !formData.specialization) {
        setError("Please fill in all student details")
        return
      }
    } else if (formData.user_type === "professional") {
      if (!formData.company_name || !formData.experience_level) {
        setError("Please fill in all professional details")
        return
      }
    }

    setIsLoading(true)
    setError("")

    try {
      // Prepare update data
      const updateData: any = {
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        linkedin: formData.linkedin,
        portfolio: formData.portfolio,
        website: formData.website
      }

      // Add student-specific fields
      if (formData.user_type === "student") {
        updateData.university = formData.university
        updateData.graduation_year = parseInt(formData.graduation_year as string)
        updateData.specialization = formData.specialization
      }

      // Add professional-specific fields
      if (formData.user_type === "professional") {
        updateData.company_name = formData.company_name
        updateData.experience_level = formData.experience_level
        // Store license number and expertise in bio or create custom fields
        if (formData.license_number) {
          updateData.bio += `\n\nLicense Number: ${formData.license_number}`
        }
        if (formData.expertise) {
          updateData.specialization = formData.expertise
        }
      }

      await api.put(`/users/${currentUser.id}`, updateData)
      
      // Redirect to profile page or home
      router.push("/profile")
    } catch (err: any) {
      console.error("Profile update error:", err)
      setError(err.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span className="ml-2 text-sm font-medium">User Type</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-300"></div>
        <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="ml-2 text-sm font-medium">Basic Info</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-300"></div>
        <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            3
          </div>
          <span className="ml-2 text-sm font-medium">Details</span>
        </div>
      </div>
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome! Let's set up your profile</h2>
        <p className="text-gray-600">First, tell us what describes you best</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Student Option */}
        <button
          onClick={() => handleUserTypeSelect("student")}
          className="group relative p-8 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-300 text-left"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Student</h3>
              <p className="text-sm text-gray-600">
                I'm currently studying architecture or related field
              </p>
            </div>
          </div>
        </button>

        {/* Professional Option */}
        <button
          onClick={() => handleUserTypeSelect("professional")}
          className="group relative p-8 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-300 text-left"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Professional</h3>
              <p className="text-sm text-gray-600">
                I'm a practicing architect or design professional
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">Tell us a bit about yourself</p>
      </div>

      <div className="space-y-4">
        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="phone"
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">
            Location <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="location"
              placeholder="City, State, Country"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">
            Bio <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself, your interests, and goals..."
            value={formData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            rows={4}
          />
        </div>

        {/* LinkedIn */}
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn Profile</Label>
          <div className="relative">
            <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="linkedin"
              placeholder="https://linkedin.com/in/yourprofile"
              value={formData.linkedin}
              onChange={(e) => handleInputChange("linkedin", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Portfolio */}
        <div className="space-y-2">
          <Label htmlFor="portfolio">Portfolio URL</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="portfolio"
              placeholder="https://yourportfolio.com"
              value={formData.portfolio}
              onChange={(e) => handleInputChange("portfolio", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website">Personal Website</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="website"
              placeholder="https://yourwebsite.com"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button variant="outline" onClick={handleBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600">
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const renderStep3Student = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <GraduationCap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Details</h2>
        <p className="text-gray-600">Tell us about your academic journey</p>
      </div>

      <div className="space-y-4">
        {/* University */}
        <div className="space-y-2">
          <Label htmlFor="university">
            College/University <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="university"
              placeholder="Enter your institution name"
              value={formData.university}
              onChange={(e) => handleInputChange("university", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Graduation Year */}
        <div className="space-y-2">
          <Label htmlFor="graduation_year">
            Graduation Year <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Select value={formData.graduation_year.toString()} onValueChange={(value: string) => handleInputChange("graduation_year", value)}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Specialization */}
        <div className="space-y-2">
          <Label htmlFor="specialization">
            Specialization <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Select value={formData.specialization} onValueChange={(value: string) => handleInputChange("specialization", value)}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Select specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Architectural Design">Architectural Design</SelectItem>
                <SelectItem value="Urban Planning">Urban Planning</SelectItem>
                <SelectItem value="Landscape Architecture">Landscape Architecture</SelectItem>
                <SelectItem value="Interior Design">Interior Design</SelectItem>
                <SelectItem value="Sustainable Architecture">Sustainable Architecture</SelectItem>
                <SelectItem value="Heritage Conservation">Heritage Conservation</SelectItem>
                <SelectItem value="Building Technology">Building Technology</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button variant="outline" onClick={handleBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Completing...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Profile
            </>
          )}
        </Button>
      </div>
    </div>
  )

  const renderStep3Professional = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Briefcase className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Details</h2>
        <p className="text-gray-600">Share your professional background</p>
      </div>

      <div className="space-y-4">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="company_name">
            Company/Firm Name <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="company_name"
              placeholder="Enter your company or firm name"
              value={formData.company_name}
              onChange={(e) => handleInputChange("company_name", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <Label htmlFor="experience_level">
            Experience Level <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Select value={formData.experience_level} onValueChange={(value: string) => handleInputChange("experience_level", value)}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Junior (0-2 years)">Junior (0-2 years)</SelectItem>
                <SelectItem value="Mid-Level (3-5 years)">Mid-Level (3-5 years)</SelectItem>
                <SelectItem value="Senior (6-10 years)">Senior (6-10 years)</SelectItem>
                <SelectItem value="Principal (10+ years)">Principal (10+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* License Number */}
        <div className="space-y-2">
          <Label htmlFor="license_number">Architecture License Number (if applicable)</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="license_number"
              placeholder="Enter your license/registration number"
              value={formData.license_number}
              onChange={(e) => handleInputChange("license_number", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Expertise */}
        <div className="space-y-2">
          <Label htmlFor="expertise">Area of Expertise</Label>
          <div className="relative">
            <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Select value={formData.expertise} onValueChange={(value: string) => handleInputChange("expertise", value)}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Select your expertise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Residential Architecture">Residential Architecture</SelectItem>
                <SelectItem value="Commercial Architecture">Commercial Architecture</SelectItem>
                <SelectItem value="Institutional Buildings">Institutional Buildings</SelectItem>
                <SelectItem value="Urban Design">Urban Design</SelectItem>
                <SelectItem value="Landscape Architecture">Landscape Architecture</SelectItem>
                <SelectItem value="Interior Architecture">Interior Architecture</SelectItem>
                <SelectItem value="Sustainable Design">Sustainable Design</SelectItem>
                <SelectItem value="Heritage Restoration">Heritage Restoration</SelectItem>
                <SelectItem value="Project Management">Project Management</SelectItem>
                <SelectItem value="BIM & Digital Design">BIM & Digital Design</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button variant="outline" onClick={handleBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Completing...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Profile
            </>
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {renderStepIndicator()}
        
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && formData.user_type === "student" && renderStep3Student()}
            {step === 3 && formData.user_type === "professional" && renderStep3Professional()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
