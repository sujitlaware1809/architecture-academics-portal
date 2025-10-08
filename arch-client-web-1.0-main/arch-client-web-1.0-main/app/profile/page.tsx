"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Building, User, Mail, Phone, MapPin, Globe, BookOpen, Briefcase, ArrowLeft, Edit, Save, X, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: string;
  profile?: UserProfile;
}

interface UserProfile {
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  skills?: string[];
  education?: string;
  experience?: string;
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const [profileData, setProfileData] = useState({
    phone: "",
    bio: "",
    location: "",
    website: "",
    skills: "",
    education: "",
    experience: ""
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
        // Populate profile form with existing data
        const profile = result.data.profile || {}
        setProfileData({
          phone: profile.phone || "",
          bio: profile.bio || "",
          location: profile.location || "",
          website: profile.website || "",
          skills: profile.skills ? profile.skills.join(", ") : "",
          education: profile.education || "",
          experience: profile.experience || ""
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

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError("")
    setSuccess("")
    
    try {
      const profileUpdate = {
        ...profileData,
        skills: profileData.skills ? profileData.skills.split(",").map(s => s.trim()).filter(s => s) : []
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-white">Architecture</h1>
                <span className="text-sm text-purple-200 font-medium">Academics</span>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-purple-100 hover:text-white transition-colors rounded-full hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors rounded-full"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                  <User className="h-10 w-10 text-white" />
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
                  
                  {user.profile?.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{user.profile.phone}</span>
                    </div>
                  )}
                  
                  {user.profile?.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{user.profile.location}</span>
                    </div>
                  )}
                  
                  {user.profile?.website && (
                    <div className="flex items-center text-gray-600">
                      <Globe className="h-4 w-4 mr-2" />
                      <a href={user.profile.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                        {user.profile.website}
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
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors rounded-lg hover:bg-purple-50"
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
                        {user.profile?.phone || "Not provided"}
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Bio</label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself"
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500 resize-none"
                      />
                    ) : (
                      <div className="min-h-24 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        {user.profile?.bio || "No bio provided"}
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
                        {user.profile?.location || "Not provided"}
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
                        {user.profile?.website || "Not provided"}
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
                        {user.profile?.skills && user.profile.skills.length > 0 ? (
                          user.profile.skills.map((skill, index) => (
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
                        className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500 resize-none"
                      />
                    ) : (
                      <div className="min-h-20 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        {user.profile?.education || "No education information provided"}
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
                        className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500 resize-none"
                      />
                    ) : (
                      <div className="min-h-20 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        {user.profile?.experience || "No experience information provided"}
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <div className="pt-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
