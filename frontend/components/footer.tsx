"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Building, MessageSquare, Users, Mail, Phone, MapPin, Facebook, Linkedin, Twitter, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

export default function Footer() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsAuthenticated(api.isAuthenticated())
  }, [])

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Footer Top */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <Image 
                src="/logo.jpg" 
                alt="AAO - Architecture Academics Online Logo" 
                width={40} 
                height={40}
                className="rounded-xl object-contain"
              />
              <div className="flex flex-col leading-none">
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AAO
                </h3>
                <span className="text-[10px] text-black font-medium -mt-1">
                  architecture-academics.online
                </span>
              </div>
            </Link>
            <p className="text-sm text-black mb-4">
              India's premier online platform for architecture education, NATA preparation, career growth, and professional networking.
            </p>
            <div className="mt-4 space-y-1 text-sm text-black">
              <p className="font-medium">Architecture Academics</p>
              <p>IIT Madras, Chennai 600026</p>
              <p>Toll Free: +91 (123) 456-7890</p>
            </div>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Platform</h4>
            <div className="space-y-2">
              <Link href="/courses" className="block text-sm text-black hover:text-blue-600 transition-colors">
                Courses
              </Link>
              <Link href="/blogs" className="block text-sm text-black hover:text-blue-600 transition-colors">
                Blogs
              </Link>
              <Link href="/discussions" className="block text-sm text-black hover:text-blue-600 transition-colors">
                Discussions
              </Link>
              <Link href="/events" className="block text-sm text-black hover:text-blue-600 transition-colors">
                Events
              </Link>
              <Link href="/workshops" className="block text-sm text-black hover:text-blue-600 transition-colors">
                Workshops
              </Link>
              <Link href="/jobs-portal" className="block text-sm text-black hover:text-blue-600 transition-colors">
                Jobs Portal
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Resources</h4>
            <div className="space-y-2">
              <a href="/nata-courses" className="block text-sm text-black hover:text-purple-600 transition-colors">
                NATA Courses
              </a>
              <a href="/architecture-tours" className="block text-sm text-black hover:text-purple-600 transition-colors">
                Architecture Tours
              </a>
              <Link href="/competitions" className="block text-sm text-black hover:text-purple-600 transition-colors">
                Competitions
              </Link>
              <Link href="/publications" className="block text-sm text-black hover:text-purple-600 transition-colors">
                Publications
              </Link>
              <Link href="/surveys" className="block text-sm text-black hover:text-purple-600 transition-colors">
                Surveys
              </Link>
              <Link href="/contextual-study" className="block text-sm text-black hover:text-purple-600 transition-colors">
                Contextual Study
              </Link>
            </div>
          </div>

          {/* Service Providers */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Service Providers</h4>
            <div className="space-y-2">
              <a href="/software-training" className="block text-sm text-black hover:text-emerald-600 transition-colors">
                Software Training
              </a>
              <a href="/stationary-supplier" className="block text-sm text-black hover:text-emerald-600 transition-colors">
                Stationary Supplier
              </a>
              <a href="/tour-organizer" className="block text-sm text-black hover:text-emerald-600 transition-colors">
                Tour Organizer
              </a>
              <a href="/book-seller" className="block text-sm text-black hover:text-emerald-600 transition-colors">
                Book Seller
              </a>
              <a href="/product-manufacturer" className="block text-sm text-black hover:text-emerald-600 transition-colors">
                Product & Material Manufacturer
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Company</h4>
            <div className="space-y-2">
              <Link href="/contact-us" className="block text-sm text-black hover:text-purple-600 transition-colors">
                Contact Us
              </Link>
              <Link href="/advertise-with-us" className="block text-sm text-black hover:text-purple-600 transition-colors">
                Advertise With Us
              </Link>
              <a href="/about-us" className="block text-sm text-black hover:text-purple-600 transition-colors">
                About Us
              </a>
              <a href="/terms-and-conditions" className="block text-sm text-black hover:text-purple-600 transition-colors">
                Terms & Conditions
              </a>
              <a href="/privacy-policy" className="block text-sm text-black hover:text-purple-600 transition-colors">
                Privacy Policy
              </a>
              <a href="/feedback" className="block text-sm text-black hover:text-purple-600 transition-colors">
                Feedback
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-black text-center md:text-left">
              © 2025 Architecture Academics. All rights reserved. Empowering the next generation of architects.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="/privacy" className="text-sm text-black hover:text-purple-600 transition-colors">
                Privacy
              </a>
              <a href="/terms" className="text-sm text-black hover:text-purple-600 transition-colors">
                Terms
              </a>
              <a href="/cookies" className="text-sm text-black hover:text-purple-600 transition-colors">
                Cookies
              </a>
              <a href="/accessibility" className="text-sm text-black hover:text-purple-600 transition-colors">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
