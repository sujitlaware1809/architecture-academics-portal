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
    budget: "",
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
      setFormData({ name: "", email: "", company: "", phoneNumber: "", advertisingType: "", budget: "", message: "" })
    } catch (error) {
      setSubmitError("There was an error submitting your inquiry. Please try again.")
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const adPackages = [
    {
      name: "Starter",
      price: "₹15,000",
      duration: "per month",
      features: [
        "Banner ad on homepage (300x250)",
        "Featured listing in one category",
        "Weekly social media mention",
        "2 newsletter inclusions",
        "Basic analytics reporting"
      ],
      color: "bg-slate-100 hover:bg-slate-200",
      textColor: "text-slate-900",
      buttonVariant: "outline"
    },
    {
      name: "Professional",
      price: "₹35,000",
      duration: "per month",
      popular: true,
      features: [
        "Premium banner ad on homepage (728x90)",
        "Featured listing in three categories",
        "Dedicated email blast to subscribers",
        "Weekly social media promotions",
        "Sponsored content opportunity (1 article)",
        "Comprehensive analytics dashboard"
      ],
      color: "bg-primary text-primary-foreground",
      textColor: "text-primary-foreground",
      buttonVariant: "default"
    },
    {
      name: "Enterprise",
      price: "₹75,000",
      duration: "per month",
      features: [
        "Multiple premium ad placements site-wide",
        "Featured listings in all categories",
        "Custom integration opportunities",
        "Sponsored content series (3 articles)",
        "Dedicated account manager",
        "Monthly performance review meetings",
        "Advanced targeting options",
        "First access to new promotional features"
      ],
      color: "bg-slate-900 text-white",
      textColor: "text-white",
      buttonVariant: "outline"
    }
  ]

  const audienceStats = [
    { label: "Monthly Visitors", value: "120K+", icon: Users, color: "text-blue-500" },
    { label: "Architecture Students", value: "65%", icon: Globe, color: "text-green-500" },
    { label: "Architecture Professionals", value: "30%", icon: BarChart3, color: "text-purple-500" },
    { label: "Avg. Time on Site", value: "4:35", icon: LineChart, color: "text-yellow-500" }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-primary-foreground text-2xl font-bold">
            Architecture Academics
          </Link>
          
          <Link href="/" className="flex items-center text-primary-foreground hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4 fade-in">Advertise With Us</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto slide-in-left mb-8">
              Reach thousands of architecture students, professionals, and academics with your brand message on India's premier architecture education platform.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <Button size="lg" className="btn-animated slide-in-left">
                View Our Media Kit
              </Button>
              <Button size="lg" variant="outline" className="btn-animated slide-in-right" asChild>
                <a href="#contact-form">Get in Touch</a>
              </Button>
            </div>
          </section>

          {/* Why Advertise With Us */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Why Advertise With Us?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="slide-in-left">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Targeted Audience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Reach a highly focused audience of architecture students, educators, and professionals actively seeking resources and opportunities.</p>
                </CardContent>
              </Card>

              <Card className="slide-in-left" style={{ animationDelay: "0.2s" }}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <LineChart className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Enhanced Visibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Gain exposure across our platform with strategically placed advertisements that complement our educational content.</p>
                </CardContent>
              </Card>

              <Card className="slide-in-left" style={{ animationDelay: "0.4s" }}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Brand Authority</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Associate your brand with a trusted educational platform and position yourself as a leader in the architecture industry.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Audience Statistics */}
          <section className="mb-16 py-12 px-6 bg-slate-100 rounded-lg">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Audience</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {audienceStats.map((stat, index) => (
                <div key={index} className="text-center slide-in-right" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex justify-center mb-4">
                    <stat.icon className={`h-10 w-10 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <p className="text-lg font-medium">Our users come from:</p>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad"].map((city, i) => (
                  <Badge key={i} variant="secondary" className="text-sm py-1">
                    {city}
                  </Badge>
                ))}
              </div>
            </div>
          </section>

          {/* Advertising Packages */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Advertising Packages</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {adPackages.map((pkg, index) => (
                <Card key={index} className={`${pkg.color} relative overflow-hidden bounce-in`} style={{ animationDelay: `${index * 0.2}s` }}>
                  {pkg.popular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-yellow-500 text-white px-4 py-1 rotate-45 transform translate-x-6 -translate-y-1 shadow-md">
                        Popular
                      </div>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className={pkg.textColor}>{pkg.name}</CardTitle>
                    <div className="mt-4">
                      <span className={`text-3xl font-bold ${pkg.textColor}`}>{pkg.price}</span>
                      <span className={`text-sm opacity-80 ${pkg.textColor}`}> {pkg.duration}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className={`flex items-start ${pkg.textColor}`}>
                          <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant={pkg.buttonVariant as any} asChild>
                      <a href="#contact-form">Get Started</a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                Need a custom advertising solution? <a href="#contact-form" className="text-primary underline">Contact us</a> for personalized packages.
              </p>
            </div>
          </section>

          {/* Ad Placement Locations */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Ad Placement Opportunities</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4 slide-in-left">
                <h3 className="text-xl font-semibold flex items-center">
                  <Megaphone className="h-5 w-5 mr-2 text-primary" />
                  Website Placements
                </h3>
                <ul className="space-y-2 pl-8 list-disc">
                  <li>Homepage banner ads (multiple sizes available)</li>
                  <li>Course directory sponsorship</li>
                  <li>Event listings featured spots</li>
                  <li>Sidebar ads throughout the site</li>
                  <li>Job listings premium positioning</li>
                </ul>
              </div>
              
              <div className="space-y-4 slide-in-right">
                <h3 className="text-xl font-semibold flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-primary" />
                  Email & Content Marketing
                </h3>
                <ul className="space-y-2 pl-8 list-disc">
                  <li>Newsletter sponsorship (10,000+ subscribers)</li>
                  <li>Dedicated email blasts</li>
                  <li>Sponsored articles and tutorials</li>
                  <li>Educational resource sponsorship</li>
                  <li>Webinar and online event sponsorship</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-10 p-6 border border-muted rounded-lg slide-in-left">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-primary" />
                Custom Advertising Solutions
              </h3>
              <p>
                We understand that every brand has unique marketing objectives. Our team can work with you to create custom advertising solutions that align with your specific goals, whether it's brand awareness, lead generation, or direct sales.
              </p>
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <a href="#contact-form">Discuss Custom Solutions</a>
                </Button>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">What Our Advertisers Say</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  quote: "Advertising on Architecture Academics gave us unprecedented reach to architecture students across India. Our workshop registrations increased by 45% in just two months.",
                  author: "Priya Sharma",
                  title: "Marketing Director, DesignBuild Institute"
                },
                {
                  quote: "The targeted audience we reached through Architecture Academics was exactly what our software company needed. The ROI has been exceptional compared to other platforms we've tried.",
                  author: "Rajesh Patel",
                  title: "Sales Manager, ArchCAD Solutions"
                }
              ].map((testimonial, index) => (
                <Card key={index} className="slide-in-right" style={{ animationDelay: `${index * 0.2}s` }}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col h-full">
                      <div className="text-4xl text-muted mb-4">"</div>
                      <p className="text-lg italic flex-grow">{testimonial.quote}</p>
                      <div className="mt-6">
                        <p className="font-semibold">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Contact Form */}
          <section id="contact-form" className="scroll-mt-20">
            <h2 className="text-3xl font-bold mb-8 text-center">Ready to Advertise With Us?</h2>
            <Card className="slide-in-left">
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>
                  Fill out the form below and our advertising team will contact you within 24 hours to discuss your needs.
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
                      We've received your advertising inquiry and will get back to you within 24 hours with more information about our advertising opportunities.
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
                        <Label htmlFor="advertisingType">Advertising Interest</Label>
                        <select
                          id="advertisingType"
                          name="advertisingType"
                          value={formData.advertisingType}
                          onChange={handleChange}
                          required
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select an option</option>
                          <option value="Starter Package">Starter Package</option>
                          <option value="Professional Package">Professional Package</option>
                          <option value="Enterprise Package">Enterprise Package</option>
                          <option value="Custom Solution">Custom Solution</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="budget">Estimated Budget</Label>
                        <select
                          id="budget"
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select a budget range</option>
                          <option value="Under ₹25,000">Under ₹25,000</option>
                          <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                          <option value="₹50,000 - ₹100,000">₹50,000 - ₹100,000</option>
                          <option value="₹100,000+">₹100,000+</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Additional Information</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Please share any specific goals or questions about advertising with us..."
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                      />
                    </div>
                    
                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Submit Advertising Inquiry"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Direct Contact */}
          <section className="mt-12 text-center">
            <p className="text-muted-foreground">
              For immediate assistance, contact our advertising team directly:
            </p>
            <p className="mt-2">
              <a href="mailto:advertising@architectureacademics.com" className="text-primary font-medium">
                advertising@architectureacademics.com
              </a>
            </p>
            <p className="mt-1">
              <a href="tel:+919876543210" className="text-primary font-medium">
                +91 98765 43210
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Architecture Academics</h3>
              <p className="text-slate-300">
                Connecting architecture professionals and students with resources, opportunities, and community.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-slate-300 hover:text-white">Home</Link></li>
                <li><Link href="/events" className="text-slate-300 hover:text-white">Events</Link></li>
                <li><Link href="/courses" className="text-slate-300 hover:text-white">Courses</Link></li>
                <li><Link href="/login" className="text-slate-300 hover:text-white">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-slate-300 hover:text-white">Terms of Service</Link></li>
                <li><Link href="#" className="text-slate-300 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="#" className="text-slate-300 hover:text-white">Cookie Policy</Link></li>
                <li><Link href="/contact-us" className="text-slate-300 hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-300 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-slate-300 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-slate-300 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-slate-300 hover:text-white">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-400">
              © {new Date().getFullYear()} Architecture Academics. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
