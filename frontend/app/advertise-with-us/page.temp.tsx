"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  CheckCircle2, 
  ArrowLeft, 
  LineChart, 
  Users, 
  Globe, 
  Mail, 
  DollarSign, 
  Megaphone,
  BarChart3
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoginRequiredButton } from "@/components/login-required"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function AdvertiseWithUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phoneNumber: "",
    advertisingType: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Form submitted:", formData)
      
      setSubmitSuccess(true)
      setFormData({ name: "", email: "", company: "", phoneNumber: "", advertisingType: "", message: "" })
    } catch (error) {
      setSubmitError("There was an error submitting your inquiry. Please try again.")
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const audienceStats = [
    { label: "Monthly Visitors", value: "Coming Soon", icon: Users, color: "text-blue-500" },
    { label: "Architecture Students", value: "0%", icon: Globe, color: "text-green-500" },
    { label: "Architecture Professionals", value: "0%", icon: BarChart3, color: "text-indigo-500" },
    { label: "Avg. Time on Site", value: "0:00", icon: LineChart, color: "text-yellow-500" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 py-6 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-white text-2xl font-bold">
          </Link>
          
          <Link href="/" className="flex items-center text-white hover:text-blue-200 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-full shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Partnership Opportunities</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Advertise With 
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                Architecture Academics
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
              Partner with the comprehensive platform for architectural fraternity and reach a targeted audience of students, professionals, and academics.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                <Mail className="mr-2 h-5 w-5" />
                Get Partnership Info
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-6 text-lg rounded-xl transition-all duration-300" asChild>
                <a href="#contact-form">Contact Our Team</a>
              </Button>
            </div>
          </section>

          {/* Why Advertise With Us */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Partner With Us?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join the architectural fraternity's most comprehensive platform
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Targeted Community</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Connect with a focused community of architecture students, educators, and professionals actively seeking resources and opportunities.</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
                    <LineChart className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Growing Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Be part of a growing educational platform that's becoming the go-to resource for the architectural community in India.</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-cyan-100 bg-gradient-to-br from-cyan-50 to-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Brand Association</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Associate your brand with a trusted educational platform and position yourself as a leader in the architecture industry.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Audience Statistics */}
          <section className="mb-16 py-12 px-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 rounded-2xl border border-blue-100">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Growing Community
              </h2>
              <p className="text-lg text-gray-600">
                Connect with the next generation of architects
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {audienceStats.map((stat, index) => (
                <div key={index} className="text-center bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${
                      index === 0 ? 'from-blue-500 to-cyan-600' :
                      index === 1 ? 'from-green-500 to-emerald-600' :
                      index === 2 ? 'from-indigo-500 to-blue-600' :
                      'from-yellow-500 to-orange-600'
                    } flex items-center justify-center shadow-lg`}>
                      <stat.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <p className="text-lg font-medium text-gray-900 mb-4">Building community across India:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad"].map((city, i) => (
                  <Badge key={i} variant="secondary" className="text-sm py-2 px-4 bg-white/70 border border-blue-200 text-gray-700 hover:bg-blue-100 transition-colors">
                    {city}
                  </Badge>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section id="contact-form" className="scroll-mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ready to Partner With Us?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join our early partner program and be among the first to know about advertising opportunities
              </p>
            </div>
            
            <Card className="border-2 border-blue-100 shadow-xl bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">Partnership Inquiry</CardTitle>
                <CardDescription className="text-gray-600">
                  Fill out the form below and our partnership team will contact you within 24 hours to discuss opportunities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitSuccess ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-green-800">Thank You for Your Interest!</h3>
                    <p className="mt-2 text-sm text-green-700">
                      We've received your partnership inquiry and will get back to you within 24 hours with more information about our partnership opportunities.
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setSubmitSuccess(false)}
                    >
                      Submit Another Inquiry
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {submitError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                        {submitError}
                      </div>
                    )}
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john.doe@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company/Organization</Label>
                        <Input
                          id="company"
                          name="company"
                          placeholder="Your Company Ltd."
                          value={formData.company}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          placeholder="+91 98765 43210"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="advertisingType">Partnership Interest</Label>
                        <select
                          id="advertisingType"
                          name="advertisingType"
                          value={formData.advertisingType}
                          onChange={handleChange}
                          required
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select an option</option>
                          <option value="Brand Partnership">Brand Partnership</option>
                          <option value="Content Collaboration">Content Collaboration</option>
                          <option value="Early Partner Program">Early Partner Program</option>
                          <option value="Custom Solution">Custom Solution</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message">How can we help you?</Label>
                        <Input
                          id="message"
                          name="message"
                          placeholder="Brief description of your partnership interest..."
                          value={formData.message}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Additional Information</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Please share any specific goals or questions about partnership opportunities..."
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                      />
                    </div>
                    
                    <LoginRequiredButton
                      onClick={() => handleSubmit(new Event('submit') as any)}
                      action="submit partnership inquiries"
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Submit Partnership Inquiry"}
                    </LoginRequiredButton>
                  </form>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}