"use client"

import * as React from "react"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  Calendar, 
  Briefcase, 
  Wrench, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap,
  Users,
  Award,
  Mic,
  Trophy,
  Building,
  UserCheck,
  FileText
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const slides = [
  {
    id: "welcome",
    title: "Build Your Future Today",
    subtitle: "India's Leading Architecture Platform",
    description: "Join the architectural fraternity and shape the world. Access courses, connect with professionals, and unlock opportunities.",
    cta: { text: "Ready to start your journey", href: "/courses", icon: BookOpen },
    gradient: "from-blue-600 via-indigo-600 to-blue-700",
    bgGradient: "from-blue-50/50 via-white to-indigo-50/50",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Students group
    features: [
      { title: "Expert-Led Courses", icon: GraduationCap, color: "bg-yellow-500" },
      { title: "Career Opportunities", icon: Briefcase, color: "bg-cyan-500" },
      { title: "Active Community", icon: Users, color: "bg-blue-500" },
      { title: "Certifications", icon: Award, color: "bg-red-500" },
      { title: "Mentorship", icon: UserCheck, color: "bg-orange-500" },
      { title: "Resources", icon: FileText, color: "bg-blue-500" }
    ]
  },
  {
    id: "courses",
    title: "Master Architecture",
    subtitle: "Expert-Led Online Courses",
    description: "Enhance your skills with our comprehensive curriculum designed by industry experts. From basics to advanced techniques.",
    cta: { text: "Ready to start your journey", href: "/courses", icon: BookOpen },
    gradient: "from-blue-600 via-cyan-600 to-blue-700",
    bgGradient: "from-blue-50/50 via-white to-cyan-50/50",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Architect working
    features: [
      { title: "Self-Paced Learning", icon: BookOpen, color: "bg-blue-600" },
      { title: "Project Based", icon: Wrench, color: "bg-cyan-600" },
      { title: "Expert Mentors", icon: Users, color: "bg-teal-600" },
      { title: "Certificates", icon: Award, color: "bg-indigo-600" }
    ]
  },
  {
    id: "events",
    title: "Connect & Learn",
    subtitle: "Workshops, Seminars & Meetups",
    description: "Stay updated with the latest trends. Participate in workshops, attend seminars, and network with fellow architects.",
    cta: { text: "Ready to start your journey", href: "/events", icon: Calendar },
    gradient: "from-orange-500 via-red-500 to-orange-600",
    bgGradient: "from-orange-50/50 via-white to-red-50/50",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Conference/Event
    features: [
      { title: "Live Workshops", icon: Wrench, color: "bg-orange-600" },
      { title: "Networking", icon: Users, color: "bg-red-600" },
      { title: "Guest Speakers", icon: Mic, color: "bg-yellow-600" }, // Mic might need import
      { title: "Competitions", icon: Trophy, color: "bg-amber-600" } // Trophy might need import
    ]
  },
  {
    id: "jobs",
    title: "Launch Your Career",
    subtitle: "Find Your Dream Job",
    description: "Connect with top architectural firms. Browse job listings, apply for internships, and take the next step in your career.",
    cta: { text: "Ready to start your journey", href: "/jobs-portal", icon: Briefcase },
    gradient: "from-green-600 via-emerald-600 to-green-700",
    bgGradient: "from-green-50/50 via-white to-emerald-50/50",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Professional woman
    features: [
      { title: "Top Firms", icon: Building, color: "bg-green-600" }, // Building might need import
      { title: "Internships", icon: GraduationCap, color: "bg-emerald-600" },
      { title: "Direct Apply", icon: ArrowRight, color: "bg-teal-600" },
      { title: "Career Guidance", icon: Users, color: "bg-lime-600" }
    ]
  }
]



export function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })])
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  React.useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  const scrollTo = React.useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  )

  const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  return (
    <div className="relative overflow-hidden group min-h-[500px] lg:min-h-[600px]">
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div key={slide.id} className={`flex-[0_0_100%] min-w-0 relative h-full bg-gradient-to-br ${slide.bgGradient}`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                <div className="grid lg:grid-cols-2 gap-12 items-center w-full py-8 md:py-12">
                  
                  {/* Left Content */}
                  <div className="space-y-8 relative z-10">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 border border-gray-200/50 rounded-full shadow-sm backdrop-blur-sm"
                    >
                      <div className={`w-2 h-2 rounded-full animate-pulse shadow-lg ${slide.id === 'welcome' ? 'bg-blue-500 shadow-blue-500/50' : 'bg-blue-500 shadow-blue-500/50'}`}></div>
                      <span className="text-sm font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        {slide.subtitle}
                      </span>
                    </motion.div>
                    
                    <div className="space-y-4">
                      <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="font-poppins text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight"
                      >
                        {slide.title.split(' ').slice(0, -1).join(' ')}
                        <br />
                        <span className="relative inline-block">
                          <span className={`relative z-10 bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent`}>
                            {slide.title.split(' ').slice(-1)}
                          </span>
                          <div className={`absolute -bottom-2 left-0 w-full h-4 bg-gradient-to-r ${slide.gradient} opacity-20 blur-xl`}></div>
                        </span>
                      </motion.h1>
                      <div className={`w-24 h-1.5 bg-gradient-to-r ${slide.gradient} rounded-full`}></div>
                    </div>
                    
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl font-medium"
                    >
                      {slide.description}
                    </motion.p>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="flex flex-col sm:flex-row gap-4 pt-4"
                    >
                      <Link href={slide.cta.href}>
                        <Button size="lg" className={`group bg-gradient-to-r ${slide.gradient} text-white px-8 h-14 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-auto text-lg font-bold hover:scale-105`}>
                          <slide.cta.icon className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                          {slide.cta.text}
                        </Button>
                      </Link>
                      {slide.secondaryCta && (
                        <Link href={slide.secondaryCta.href}>
                          <Button size="lg" variant="outline" className="group border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 h-14 rounded-2xl transition-all duration-300 w-full sm:w-auto text-lg font-bold hover:scale-105">
                            <slide.secondaryCta.icon className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            {slide.secondaryCta.text}
                          </Button>
                        </Link>
                      )}
                    </motion.div>
                  </div>

                  {/* Right Content - Hero Image */}
                  <div className="relative block h-[300px] lg:h-full lg:min-h-[400px] mt-8 lg:mt-0">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-full h-full max-w-md mx-auto">
                        {/* Main Image with Blob Shape */}
                        <div className="relative z-10 w-full h-full rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                          <img 
                            src={slide.image} 
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                          {/* Overlay Gradient */}
                          <div className={`absolute inset-0 bg-gradient-to-t ${slide.gradient} opacity-20 mix-blend-overlay`}></div>
                        </div>

                        {/* Decorative Elements */}
                        <div className={`absolute -z-10 top-6 -right-6 lg:top-10 lg:-right-10 w-full h-full rounded-[2rem] lg:rounded-[3rem] border-2 border-dashed border-gray-300 transform -rotate-3`}></div>
                        <div className={`absolute -z-20 -bottom-6 -left-6 lg:-bottom-10 lg:-left-10 w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br ${slide.gradient} rounded-full blur-2xl opacity-30`}></div>
                        
                        {/* Floating Badge */}
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="absolute -bottom-4 -right-4 lg:-bottom-6 lg:-right-6 bg-white p-3 lg:p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3"
                        >
                          <div className={`p-2 lg:p-3 rounded-full bg-gradient-to-r ${slide.gradient}`}>
                            <Users className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-[10px] lg:text-xs text-gray-500 font-semibold">Join Community</p>
                            <p className="text-sm lg:text-lg font-bold text-gray-900">10k+ Members</p>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg rounded-full h-12 w-12 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg rounded-full h-12 w-12 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={scrollNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === selectedIndex 
                ? "bg-blue-600 w-8" 
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  )
}
