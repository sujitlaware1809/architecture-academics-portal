"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Map, Users, BookOpen, Compass } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"

const features = [
  {
    title: "Create your Roadmap",
    description: "Plan your architectural journey",
    icon: Map,
    color: "bg-[#FFF9C4]", // Light Yellow
    textColor: "text-yellow-900",
    waveColor: "#FDD835", // Darker Yellow
    href: "/learn",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Ask Experts",
    description: "Get guidance from professionals",
    icon: Users,
    color: "bg-[#E0F7FA]", // Light Cyan
    textColor: "text-cyan-900",
    waveColor: "#4DD0E1", // Darker Cyan
    href: "/expert-talk",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Read our Blogs",
    description: "Stay updated with latest trends",
    icon: BookOpen,
    color: "bg-[#E3F2FD]", // Light Blue
    textColor: "text-blue-900",
    waveColor: "#64B5F6", // Blue
    href: "/blogs",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Find Your Path",
    description: "Discover career opportunities",
    icon: Compass,
    color: "bg-[#FFE0B2]", // Light Orange
    textColor: "text-orange-900",
    waveColor: "#FFB74D", // Darker Orange
    href: "/jobs-portal",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Mentorship",
    description: "Connect with industry mentors",
    icon: Users,
    color: "bg-[#FFCCBC]", // Light Deep Orange
    textColor: "text-orange-900",
    waveColor: "#FF7043", // Deep Orange
    href: "/mentorship",
    image: "https://images.unsplash.com/photo-1515168816144-1064ba8b557b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Resources",
    description: "Access curated study materials",
    icon: BookOpen,
    color: "bg-[#C5CAE9]", // Light Indigo
    textColor: "text-indigo-900",
    waveColor: "#5C6BC0", // Indigo
    href: "/resources",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Our Impact",
    description: "5000+ Students, 120+ Courses",
    icon: Users,
    color: "bg-[#FFEBEE]", // Light Red
    textColor: "text-red-900",
    waveColor: "#EF5350", // Red
    href: "/about",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
]

export function FeatureCards() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "start",
    slidesToScroll: 1,
  }, [Autoplay({ delay: 4000, stopOnInteraction: false }) as any])

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

  return (
    <section className="py-4 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={emblaRef} className="overflow-visible">
          <div className="flex -ml-6">
            {features.map((feature, index) => (
              <div key={index} className="flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_25%] min-w-0 pl-6">
                <Link href={feature.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`relative h-60 rounded-[2rem] overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-300 ${feature.color}`}
                  >
                    {/* Content */}
                    <div className="relative z-20 p-5 h-full flex flex-col justify-between">
                      <div>
                        <h3 className={`text-xl font-bold ${feature.textColor} mb-2 leading-tight`}>
                          {feature.title}
                        </h3>
                        <p className={`text-xs font-medium ${feature.textColor} opacity-80 max-w-[60%]`}>
                          {feature.description}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className={`w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center ${feature.textColor} shadow-sm group-hover:scale-110 transition-transform`}>
                          <feature.icon className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Image/Illustration Area */}
                    <div className="absolute bottom-0 right-0 w-[65%] h-[75%] z-10 translate-y-4 translate-x-4">
                      <div className="relative w-full h-full">
                        <img 
                          src={feature.image} 
                          alt={feature.title}
                          className="w-full h-full object-cover object-center rounded-tl-[2.5rem] shadow-[-10px_-10px_30px_rgba(0,0,0,0.1)]"
                        />
                      </div>
                    </div>

                    {/* Wave Decoration */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 opacity-90">
                      <svg viewBox="0 0 1440 320" className="w-full h-auto translate-y-1">
                        <path 
                          fill={feature.waveColor} 
                          fillOpacity="1" 
                          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,202.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        ></path>
                      </svg>
                    </div>
                  </motion.div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {features.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === selectedIndex 
                  ? "bg-gray-800 w-8" 
                  : "bg-gray-300 w-2 hover:bg-gray-400"
              }`}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
