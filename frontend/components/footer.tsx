"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Building, MessageSquare, Users, Mail, Phone, MapPin } from "lucide-react"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <Image 
                src="/logo.jpg" 
                alt="AAO - Architecture Academics Online Logo" 
                width={40} 
                height={40}
                className="rounded-xl object-contain"
              />
              <div className="flex flex-col leading-none">
                <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  AAO
                </h3>
                <span className="text-[10px] text-gray-600 font-medium -mt-1">
                  Architecture Academics.online
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              India's premier online platform for architecture education, NATA preparation, career growth, and professional networking.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="rounded-lg">
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="rounded-lg">
                <Users className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="rounded-lg">
                <Building className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Platform</h4>
            <div className="space-y-2">
              <Link href="/courses" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Courses
              </Link>
              <Link href="/blogs" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Blogs
              </Link>
              <Link href="/discussions" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Discussions
              </Link>
              <Link href="/events" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Events
              </Link>
              <Link href="/workshops" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Workshops
              </Link>
              <Link href="/jobs-portal" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Jobs Portal
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Resources</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                NATA Courses
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Architecture Tours
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                CoA Portal
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                IIA Portal
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Competitions
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Publications
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Company</h4>
            <div className="space-y-2">
              <Link href="/contact-us" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Contact Us
              </Link>
              <Link href="/advertise-with-us" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Advertise With Us
              </Link>
              <a href="#" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                About Us
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Terms & Conditions
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Feedback
              </a>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="py-6 border-y border-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-purple-600" />
              <span>support@architectureacademics.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-purple-600" />
              <span>+91 (123) 456-7890</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <span>India</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 text-center md:text-left">
              © 2025 Architecture Academics. All rights reserved. Empowering the next generation of architects.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Cookies
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
