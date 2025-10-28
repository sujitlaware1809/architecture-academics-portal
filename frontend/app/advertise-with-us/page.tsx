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
    { label: "Architecture Professionals", value: "0%", icon: BarChart3, color: "text-purple-500" },
    { label: "Avg. Time on Site", value: "0:00", icon: LineChart, color: "text-yellow-500" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 via-white to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 py-6 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-white text-2xl font-bold">
          </Link>
          
          <Link href="/" className="flex items-center text-white hover:text-purple-200 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50 rounded-full shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Partnership Opportunities</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Advertise With 
              <span className="block bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                Architecture Academics
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
              Partner with the comprehensive platform for architectural fraternity and reach a targeted audience of students, professionals, and academics.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-700 hover:via-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
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
              <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg">
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
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                    <LineChart className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Growing Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Be part of a growing educational platform that's becoming the go-to resource for the architectural community in India.</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4 shadow-lg">
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
          <section className="mb-16 py-12 px-6 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl border border-purple-100">
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
                      index === 2 ? 'from-purple-500 to-indigo-600' :
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
                  <Badge key={i} variant="secondary" className="text-sm py-2 px-4 bg-white/70 border border-purple-200 text-gray-700 hover:bg-purple-100 transition-colors">
                    {city}
                  </Badge>
                ))}
              </div>
            </div>
          </section>

          {/* Partnership Opportunities */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Partnership Opportunities
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Coming soon - We're developing exciting partnership opportunities for brands and organizations
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 border-gray-100 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Megaphone className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Brand Partnerships</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">Strategic brand partnerships to reach the architectural community</p>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">Coming Soon</Badge>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-100 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Content Collaboration</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">Sponsored content and educational material partnerships</p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">Coming Soon</Badge>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-100 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Custom Solutions</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">Tailored advertising solutions for your specific needs</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Coming Soon</Badge>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-600">
                Interested in early partnership opportunities? <a href="#contact-form" className="text-purple-600 font-medium hover:text-purple-700 transition-colors">Contact us</a> to be notified when these become available.
              </p>
            </div>
          </section>

          {/* Future Opportunities */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Future Advertising Opportunities
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We're planning various advertising opportunities for when our platform grows
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      <Megaphone className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">Platform Placements</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Homepage banner advertisements</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Course directory sponsorship</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Event listings premium spots</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Job portal featured positioning</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">Content Marketing</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Newsletter sponsorship opportunities</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Sponsored educational articles</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Webinar and event sponsorship</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Educational resource partnerships</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-10 p-8 border-2 border-gray-100 rounded-2xl bg-gradient-to-br from-gray-50 to-white">
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Early Partner Benefits
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Join our early partner program to get exclusive access to advertising opportunities as they become available. Early partners will receive special rates and priority placement when we launch our advertising platform.
                </p>
                <Button variant="outline" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50" asChild>
                  <a href="#contact-form">Join Early Partner Program</a>
                </Button>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Building the Future Together
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We're excited to partner with organizations that share our vision for architectural education
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-8 pb-6">
                  <div className="flex flex-col h-full">
                    <div className="text-6xl text-purple-300 mb-4 leading-none">"</div>
                    <p className="text-lg italic flex-grow text-gray-700 mb-6">
                      We believe in building strong partnerships with educational platforms that can help architects grow and succeed in their careers.
                    </p>
                    <div>
                      <p className="font-bold text-gray-900">Partnership Team</p>
                      <p className="text-sm text-gray-600">Architecture Academics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-8 pb-6">
                  <div className="flex flex-col h-full">
                    <div className="text-6xl text-indigo-300 mb-4 leading-none">"</div>
                    <p className="text-lg italic flex-grow text-gray-700 mb-6">
                      Our platform is designed to create meaningful connections between brands, educators, and the architectural community.
                    </p>
                    <div>
                      <p className="font-bold text-gray-900">Development Team</p>
                      <p className="text-sm text-gray-600">Platform Strategy</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
            
            <Card className="border-2 border-purple-100 shadow-xl bg-gradient-to-br from-white to-purple-50/30">
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
                      className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Submit Partnership Inquiry"}
                    </LoginRequiredButton>
                  </form>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Direct Contact */}
          <section className="mt-12 text-center bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-2xl border border-purple-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Need Immediate Assistance?</h3>
            <p className="text-gray-600 mb-6">
              For immediate assistance or questions about partnership opportunities, contact our team directly:
            </p>
            <div className="space-y-2">
              <p>
                <a href="mailto:partnerships@architectureacademics.com" className="text-purple-600 font-medium hover:text-purple-700 transition-colors">
                  partnerships@architectureacademics.com
                </a>
              </p>
              <p>
                <a href="tel:+919876543210" className="text-purple-600 font-medium hover:text-purple-700 transition-colors">
                  +91 98765 43210
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Architecture Academics
              </h3>
              <p className="text-gray-300">
                Comprehensive platform for architectural fraternity - Connecting professionals, students, and enthusiasts.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4 text-purple-300">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-300 hover:text-purple-300 transition-colors">Home</Link></li>
                <li><Link href="/courses" className="text-gray-300 hover:text-purple-300 transition-colors">Courses</Link></li>
                <li><Link href="/events" className="text-gray-300 hover:text-purple-300 transition-colors">Events</Link></li>
                <li><Link href="/login" className="text-gray-300 hover:text-purple-300 transition-colors">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4 text-purple-300">Partnership</h4>
              <ul className="space-y-2">
                <li><Link href="/advertise-with-us" className="text-gray-300 hover:text-purple-300 transition-colors">Partner With Us</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-purple-300 transition-colors">Early Partners</Link></li>
                <li><Link href="/contact-us" className="text-gray-300 hover:text-purple-300 transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-purple-300 transition-colors">Media Kit</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4 text-purple-300">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-purple-300 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-purple-300 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-purple-300 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-purple-300 transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Architecture Academics. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
