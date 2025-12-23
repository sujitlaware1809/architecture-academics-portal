"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Building, User, Mail, Phone, MapPin, Globe, BookOpen, Briefcase, ArrowLeft, Edit, Save, X, AlertCircle, CheckCircle, Camera } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: number;
  email: string;
  username?: string;
  first_name: string;
  last_name: string;
  user_type?: string;
  is_active: boolean;
  created_at: string;
  // Profile fields directly on user
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  skills?: string[];
  education?: string;
  experience?: string;
  university?: string;
  graduation_year?: number;
  specialization?: string;
  cao_number?: string;
  company_name?: string;
  teaching_experience?: string;
  profile_image_url?: string;
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    bio: "",
    location: "",
    website: "",
    skills: "",
    education: "",
    experience: "",
    // Additional fields
    university: "",
    graduationYear: "",
    specialization: "",
    caoNumber: "",
    companyName: "",
    teachingExperience: ""
  })

  useEffect(() => {
    // Check if user is authenticated
    if (!api.isAuthenticated()) {
      router.push("/login")
      return
    }

    // Load user data
    loadUserData()
  }, [router])

  const loadUserData = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const result = await api.getCurrentUser()
      
      if (result.error) {
        setError(result.error)
        if (result.error.includes("authentication")) {
          router.push("/login")
        }
      } else if (result.data) {
        setUser(result.data)
        
        // Check if profile is incomplete (missing name or username)
        if (!result.data.first_name || !result.data.last_name || !result.data.username) {
          setIsEditing(true) // Auto-enable editing mode
        }

        // Handle NATA student location stored in specialization (legacy data fix)
        let location = result.data.location || "";
        let specialization = result.data.specialization || "";
        
        if (result.data.user_type === "NATA_STUDENT" && !location && specialization) {
          location = specialization;
          // Clear specialization so it doesn't show up elsewhere if we were using it
          // But we might want to keep it for the backend update to work correctly if we don't change the backend
        }

        // Populate profile form with existing data
        // Note: The backend returns a flat user object, not nested profile
        setProfileData({
          firstName: result.data.first_name || "",
          lastName: result.data.last_name || "",
          username: result.data.username || "",
          phone: result.data.phone || "",
          bio: result.data.bio || "",
          location: location,
          website: result.data.website || "",
          skills: result.data.skills ? (Array.isArray(result.data.skills) ? result.data.skills.join(", ") : result.data.skills) : "",
          education: result.data.education || "", 
          experience: result.data.experience || "", 
          
          // Additional fields
          university: result.data.university || "",
          graduationYear: result.data.graduation_year ? result.data.graduation_year.toString() : "",
          specialization: specialization,
          caoNumber: result.data.cao_number || "",
          companyName: result.data.company_name || "",
          teachingExperience: result.data.teaching_experience || ""
        })
      }
    } catch (error) {
      setError("Failed to load user data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile-image`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(prev => prev ? { ...prev, profile_image_url: data.profile_image_url } : null);
        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        });
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive"
      });
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError("")
    setSuccess("")
    
    try {
      const profileUpdate = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        username: profileData.username,
        phone: profileData.phone,
        bio: profileData.bio,
        location: profileData.location,
        website: profileData.website,
        // Map additional fields
        university: profileData.university,
        graduation_year: profileData.graduationYear ? parseInt(profileData.graduationYear) : undefined,
        specialization: profileData.specialization,
        cao_number: profileData.caoNumber,
        company_name: profileData.companyName,
        teaching_experience: profileData.teachingExperience
      }
      
      const result = await api.updateProfile(profileUpdate)
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(result.message || "Profile updated successfully!")
        setUser(result.data!)
        setIsEditing(false)
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (error) {
      setError("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    api.logout()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Profile Incomplete Banner */}
      {user && !user.username && (
        <div className="bg-orange-50 border-b border-orange-100 px-4 py-3 animate-in slide-in-from-top duration-300">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <p className="text-sm text-orange-800">
                <span className="font-semibold">Profile Incomplete:</span> Please add your username to complete your profile.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setIsEditing(true)
                // Scroll to form
                const formElement = document.getElementById('profile-form')
                if (formElement) formElement.scrollIntoView({ behavior: 'smooth' })
              }}
              className="bg-white border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 whitespace-nowrap"
            >
              Complete Now
            </Button>
          </div>
        </div>
      )}
      
      
      
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 pt-8 mb-6">
        <div className="bg-gradient-to-r from-gray-900 via-emerald-500 to-gray-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-emerald-50">Manage your personal information and preferences</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="relative mx-auto w-24 h-24 mb-4 group">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                    {user.profile_image_url ? (
                      <img 
                        src={`${process.env.NEXT_PUBLIC_API_URL}${user.profile_image_url}`} 
                        alt={user.first_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <label 
                    htmlFor="profile-image-upload" 
                    className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    <Camera className="h-4 w-4 text-gray-600" />
                    <input 
                      id="profile-image-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                <CardTitle className="text-xl font-serif font-bold text-gray-900">
                  {user.first_name} {user.last_name}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {user.email}
                </CardDescription>
                <Badge variant="secondary" className="mt-2">
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{user.email}</span>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  
                  {user.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  
                  {user.website && (
                    <div className="flex items-center text-gray-600">
                      <Globe className="h-4 w-4 mr-2" />
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {user.website}
                      </a>
                    </div>
                  )}
                  
                  <div className="pt-2 text-xs text-gray-500">
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-serif font-bold text-gray-900">Profile Details</CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage your personal information and preferences
                  </CardDescription>
                </div>
                
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-50"
                >
                  {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  <span>{isEditing ? "Cancel" : "Edit"}</span>
                </button>
              </CardHeader>
              
              <CardContent>
                {/* Error/Success Messages */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-700">{success}</span>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleInputChange}
                          placeholder="First Name"
                          className="h-12"
                        />
                      ) : (
                        <div className="h-12 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                          {user.first_name || "Not provided"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleInputChange}
                          placeholder="Last Name"
                          className="h-12"
                        />
                      ) : (
                        <div className="h-12 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                          {user.last_name || "Not provided"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    {isEditing ? (
                      <Input
                        type="text"
                        name="username"
                        value={profileData.username}
                        onChange={handleInputChange}
                        placeholder="Username"
                        className="h-12"
                      />
                    ) : (
                      <div className="h-12 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                        {user.username || "Not provided"}
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        className="h-12"
                      />
                      ) : (
                      <div className="h-12 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                        {user.phone || "Not provided"}
                      </div>
                    )}
                  </div>

                  {/* Conditional Fields based on User Type */}
                  {user.user_type === "STUDENT" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">College/University</label>
                        {isEditing ? (
                          <Input
                            type="text"
                            name="university"
                            value={profileData.university}
                            onChange={handleInputChange}
                            placeholder="College Name"
                            className="h-12"
                          />
                        ) : (
                          <div className="h-12 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                            {user.university || "Not provided"}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Graduation Year</label>
                          {isEditing ? (
                            <Input
                              type="number"
                              name="graduationYear"
                              value={profileData.graduationYear}
                              onChange={handleInputChange}
                              placeholder="Year"
                              className="h-12"
                            />
                          ) : (
                            <div className="h-12 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                              {user.graduation_year || "Not provided"}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Degree</label>
                          {isEditing ? (
                            <Input
                              type="text"
                              name="specialization"
                              value={profileData.specialization}
                              onChange={handleInputChange}
                              placeholder="Degree"
                              className="h-12"
                            />
                          ) : (
                            <div className="h-12 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                              {user.specialization || "Not provided"}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {user.user_type === "NATA_STUDENT" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">School Name</label>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="university"
                          value={profileData.university}
                          onChange={handleInputChange}
                          placeholder="School Name"
                          className="h-12"
                        />
                      ) : (
                        <div className="h-12 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                          {user.university || "Not provided"}
                        </div>
                      )}
                    </div>
                  )}

                  {user.user_type === "FACULTY" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Highest Degree</label>
                        {isEditing ? (
                          <Input
                            type="text"
                            name="specialization"
                            value={profileData.specialization}
                            onChange={handleInputChange}
                            placeholder="Highest Degree"
                            className="h-12"
                          />
                        ) : (
                          <div className="h-12 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                            {user.specialization || "Not provided"}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Teaching Experience</label>
                        {isEditing ? (
                          <Input
                            type="text"
                            name="teachingExperience"
                            value={profileData.teachingExperience}
                            onChange={handleInputChange}
                            placeholder="Experience (e.g. 5 years)"
                            className="h-12"
                          />
                        ) : (
                          <div className="h-12 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                            {user.teaching_experience || "Not provided"}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {user.user_type === "ARCHITECT" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Company/Practice Name</label>
                        {isEditing ? (
                          <Input
                            type="text"
                            name="companyName"
                            value={profileData.companyName}
                            onChange={handleInputChange}
                            placeholder="Company Name"
                            className="h-12"
                          />
                        ) : (
                          <div className="h-12 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                            {user.company_name || "Not provided"}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">CAO Number</label>
                        {isEditing ? (
                          <Input
                            type="text"
                            name="caoNumber"
                            value={profileData.caoNumber}
                            onChange={handleInputChange}
                            placeholder="CAO Number"
                            className="h-12"
                          />
                        ) : (
                          <div className="h-12 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                            {user.cao_number || "Not provided"}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {user.user_type === "GENERAL_USER" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Organization Name</label>
                        {isEditing ? (
                          <Input
                            type="text"
                            name="companyName"
                            value={profileData.companyName}
                            onChange={handleInputChange}
                            placeholder="Organization Name"
                            className="h-12"
                          />
                        ) : (
                          <div className="h-12 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                            {user.company_name || "Not provided"}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Area of Interest</label>
                        {isEditing ? (
                          <Input
                            type="text"
                            name="specialization"
                            value={profileData.specialization}
                            onChange={handleInputChange}
                            placeholder="Interest"
                            className="h-12"
                          />
                        ) : (
                          <div className="h-12 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                            {user.specialization || "Not provided"}
                          </div>
                        )}
                      </div>
                    </>
                  )}                  {/* Bio */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Bio</label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself"
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 resize-none"
                      />
                    ) : (
                      <div className="min-h-24 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        {user.bio || "No bio provided"}
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    {isEditing ? (
                      <Input
                        type="text"
                        name="location"
                        value={profileData.location}
                        onChange={handleInputChange}
                        placeholder="City, Country"
                        className="h-12"
                      />
                    ) : (
                      <div className="h-12 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                        {user.location || "Not provided"}
                      </div>
                    )}
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Website</label>
                    {isEditing ? (
                      <Input
                        type="url"
                        name="website"
                        value={profileData.website}
                        onChange={handleInputChange}
                        placeholder="https://your-website.com"
                        className="h-12"
                      />
                    ) : (
                      <div className="h-12 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                        {user.website || "Not provided"}
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Skills</label>
                    {isEditing ? (
                      <Input
                        type="text"
                        name="skills"
                        value={profileData.skills}
                        onChange={handleInputChange}
                        placeholder="AutoCAD, Revit, SketchUp (comma-separated)"
                        className="h-12"
                      />
                    ) : (
                      <div className="min-h-12 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center flex-wrap gap-2">
                        {user.skills && user.skills.length > 0 ? (
                          user.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          "No skills provided"
                        )}
                      </div>
                    )}
                  </div>

                  {/* Education */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Education</label>
                    {isEditing ? (
                      <textarea
                        name="education"
                        value={profileData.education}
                        onChange={handleInputChange}
                        placeholder="Your educational background"
                        className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 resize-none"
                      />
                    ) : (
                      <div className="min-h-20 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        {user.education || "No education information provided"}
                      </div>
                    )}
                  </div>

                  {/* Experience */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Experience</label>
                    {isEditing ? (
                      <textarea
                        name="experience"
                        value={profileData.experience}
                        onChange={handleInputChange}
                        placeholder="Your work experience"
                        className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 resize-none"
                      />
                    ) : (
                      <div className="min-h-20 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        {user.experience || "No experience information provided"}
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <div className="pt-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Saving...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Save className="h-5 w-5 mr-2" />
                            Save Profile
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
