"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Bookmark,
  Calendar,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

interface Blog {
  id: number
  title: string
  excerpt: string
  content: string
  category: string
  tags: string
  views_count: number
  likes_count: number
  comments_count: number
  slug: string
  author: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  created_at: string
}

interface Comment {
  id: number
  content: string
  author_id: number
  created_at: string
  likes_count: number
  author: {
    id: number
    first_name: string
    last_name: string
  }
  replies: Comment[]
}

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const { slug } = use(params)
  
  // Hardcoded blog data - same as in blogs page
  const hardcodedBlogs: Blog[] = [
    {
      id: 1,
      title: "Sustainable Architecture: Building for Tomorrow",
      excerpt: "Explore how modern architects are integrating eco-friendly practices and green technologies into contemporary building design.",
      content: `# Introduction to Sustainable Architecture

Sustainable architecture is no longer just a trend—it's becoming the standard for modern building design. As climate change and environmental concerns take center stage globally, architects are increasingly integrating eco-friendly practices and green technologies into their projects.

## The Core Principles

### 1. Energy Efficiency
Modern sustainable buildings focus heavily on reducing energy consumption through:
- **Passive Solar Design**: Orienting buildings to maximize natural light and heat
- **High-Performance Insulation**: Using advanced materials to minimize heat loss
- **Energy-Efficient Systems**: Installing LED lighting, efficient HVAC systems, and smart building controls
- **Renewable Energy Integration**: Solar panels, wind turbines, and geothermal systems

### 2. Water Conservation
Water is a precious resource, and sustainable architecture addresses this through:
- Rainwater harvesting systems
- Greywater recycling
- Low-flow fixtures and fittings
- Native landscaping that requires minimal irrigation
- Permeable paving to reduce runoff

### 3. Material Selection
Choosing the right materials is crucial for sustainability:
- **Recycled Materials**: Using recycled steel, glass, and plastic
- **Locally Sourced Materials**: Reducing transportation emissions
- **Rapidly Renewable Resources**: Bamboo, cork, and other fast-growing materials
- **Non-Toxic Materials**: Avoiding harmful chemicals and VOCs

### 4. Site Selection and Planning
Sustainable projects consider:
- Brownfield redevelopment instead of greenfield development
- Preserving natural features and ecosystems
- Proximity to public transportation
- Access to amenities to reduce vehicle dependence

## Green Building Certification Systems

### LEED (Leadership in Energy and Environmental Design)
The most widely recognized certification system globally, LEED provides a framework for healthy, highly efficient, and cost-saving green buildings.

### GRIHA (Green Rating for Integrated Habitat Assessment)
India's own rating system, GRIHA is designed for the Indian context and climate, making it particularly relevant for local projects.

## Case Studies from India

### Example 1: ITC Green Centre, Gurgaon
One of India's first LEED Platinum-rated buildings, the ITC Green Centre demonstrates excellence in:
- 100% treated fresh air
- Zero discharge of waste water
- 30% energy savings through innovative design
- Extensive use of fly ash in construction

### Example 2: Suzlon One Earth, Pune
This headquarters building showcases:
- Natural ventilation for 90% of the year
- Rainwater harvesting system
- Solar power generation
- Indigenous landscaping

## Challenges and Solutions

### Challenge 1: Higher Initial Costs
**Solution**: While sustainable buildings may cost 5-10% more initially, they typically achieve payback within 5-7 years through energy savings and increased property value.

### Challenge 2: Lack of Awareness
**Solution**: Education and demonstration projects help clients understand the long-term benefits of sustainable design.

### Challenge 3: Limited Availability of Green Materials
**Solution**: Growing market demand is leading to increased availability and competitive pricing of sustainable materials.

## The Future of Sustainable Architecture

Looking ahead, we can expect to see:
- **Net-Zero Buildings**: Buildings that produce as much energy as they consume
- **Biophilic Design**: Integrating nature into building design for health and wellbeing
- **Circular Economy**: Designing for disassembly and material reuse
- **Smart Buildings**: AI and IoT integration for optimal performance
- **Carbon-Negative Buildings**: Buildings that actually remove carbon from the atmosphere

## Practical Tips for Architects

1. **Start Early**: Integrate sustainability from the concept stage
2. **Collaborate**: Work with engineers, landscape architects, and sustainability consultants
3. **Model and Simulate**: Use software to predict and optimize building performance
4. **Educate Clients**: Help clients understand the value proposition
5. **Stay Updated**: Keep learning about new technologies and techniques

## Conclusion

Sustainable architecture represents our responsibility to future generations. By designing buildings that work with nature rather than against it, we create spaces that are healthier for occupants, kinder to the environment, and more economical in the long run. The journey towards sustainability is ongoing, and every project offers an opportunity to push boundaries and set new standards.

As architects, we have the power and the responsibility to shape a more sustainable built environment. The time to act is now.`,
      category: "Sustainable Design",
      tags: "Sustainability,Green Building,Eco-Friendly,LEED",
      views_count: 2450,
      likes_count: 189,
      comments_count: 34,
      slug: "sustainable-architecture-building-tomorrow",
      author: {
        id: 1,
        first_name: "Dr. Rajesh",
        last_name: "Kumar",
        email: "rajesh@example.com"
      },
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      title: "The Rise of Parametric Design in Modern Architecture",
      excerpt: "Discover how computational design tools are revolutionizing the way architects approach complex geometries and structural systems.",
      content: `# The Parametric Design Revolution

Parametric design represents a fundamental shift in how architects approach design, moving from static drawings to dynamic, algorithm-driven processes that enable unprecedented complexity and optimization.

## What is Parametric Design?

Parametric design uses algorithms and parameters to define relationships between design elements. Instead of drawing a building directly, architects define rules and relationships that generate the design. This approach offers several advantages:

- **Flexibility**: Change one parameter, and the entire design updates automatically
- **Optimization**: Test thousands of variations to find the best solution
- **Complexity**: Create geometries that would be impossible to draw manually
- **Integration**: Connect design directly to analysis and fabrication

## Essential Tools and Software

### Grasshopper for Rhino
The most popular visual programming tool for parametric design:
- Node-based interface
- Extensive plugin ecosystem
- Direct integration with Rhino 3D
- Used in projects worldwide

### Dynamo for Revit
Parametric design for BIM:
- Automates repetitive tasks
- Creates custom BIM content
- Links design to data
- Enhances Revit workflows

### Other Tools
- **Generative Components** (Bentley)
- **Maya (with scripting)**
- **Houdini** (for advanced users)

## Applications in Architecture

### 1. Facade Design
Parametric tools excel at creating complex, non-repetitive facades:
- Respond to environmental conditions (sun, wind, views)
- Optimize for energy performance
- Create unique, memorable buildings
- Enable mass customization

### 2. Structural Optimization
Finding the most efficient structural form:
- Minimize material use
- Reduce carbon footprint
- Create lightweight structures
- Enable long spans

### 3. Urban Planning
Parametric urbanism analyzes and optimizes:
- Density distributions
- Sun exposure
- Wind patterns
- Transportation networks
- Green space allocation

## Real-World Examples

### Beijing National Stadium (Bird's Nest)
- Complex steel structure optimized parametrically
- Reduced steel usage while maintaining strength
- Iconic form derived from structural logic

### The Sage Gateshead
- Parametrically designed curved glass facade
- Optimized acoustics through computational analysis
- Each panel uniquely shaped but efficiently fabricated

### King Abdullah Petroleum Studies and Research Center
Zaha Hadid's parametric masterpiece:
- Complex crystalline forms
- Environmentally responsive design
- Computational fluid dynamics optimization

## Getting Started with Parametric Design

### Step 1: Learn the Fundamentals
- Start with basic concepts: lists, data structures, mathematical operations
- Practice with simple exercises before complex projects
- Understand both the visual interface and the underlying logic

### Step 2: Build Your Skills Progressively
- Begin with simple geometric manipulations
- Progress to data-driven designs
- Eventually tackle performance-based optimization

### Step 3: Join the Community
- Online forums and discussion groups
- Tutorial websites (ThinkParametric, Mode Lab, etc.)
- Social media groups
- Local workshops and meetups

## Common Challenges and Solutions

### Challenge: Steep Learning Curve
**Solution**: Dedicate regular practice time, work through structured tutorials, and don't get discouraged by initial complexity.

### Challenge: "Black Box" Syndrome
**Solution**: Always understand the logic behind your scripts. If you can't explain how it works, dig deeper.

### Challenge: File Size and Performance
**Solution**: Learn optimization techniques, use efficient data structures, and know when to bake geometry.

## The Future of Parametric Design

Emerging trends include:
- **AI Integration**: Machine learning enhancing design optimization
- **Real-time Visualization**: VR/AR integration
- **Direct Fabrication**: Parametric to robotic fabrication
- **Generative Design**: AI suggesting design solutions
- **Multi-objective Optimization**: Balancing competing requirements

## Practical Applications for Indian Context

### Climate-Responsive Facades
Use parametric tools to design shading devices that respond to India's intense sun:
- Calculate sun angles for specific locations
- Generate optimal shading patterns
- Reduce cooling loads significantly

### Cost Optimization
In cost-sensitive markets like India:
- Minimize material waste through precise optimization
- Use parametric tools for value engineering
- Find the balance between complexity and constructability

## Tips for Success

1. **Start Simple**: Master basics before attempting complex projects
2. **Document Everything**: Comment your code, save iterations
3. **Think Logically**: Break problems into smaller steps
4. **Embrace Failure**: Each error is a learning opportunity
5. **Share Knowledge**: Teaching others reinforces your own understanding

## Conclusion

Parametric design is not just about creating cool forms—it's about working smarter, optimizing performance, and pushing the boundaries of what's possible in architecture. As computational power increases and tools become more accessible, parametric design will become increasingly essential for architects.

The question is not whether to learn parametric design, but when to start. The answer is now.`,
      category: "Technology",
      tags: "Parametric,Design,Grasshopper,Rhino,Computational",
      views_count: 1820,
      likes_count: 142,
      comments_count: 28,
      slug: "rise-parametric-design-modern-architecture",
      author: {
        id: 2,
        first_name: "Priya",
        last_name: "Sharma",
        email: "priya@example.com"
      },
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
    // Add more blogs as needed
  ]

  // Hardcoded comments
  // Architecture-related Unsplash image IDs for thumbnails
  const architectureImages = [
    '1487958449943-2429e8be8625', // Modern building
    '1518780664697-55e3ad13c0c6', // Geometric architecture
    '1511818966892-d5d671fb5ffe', // Glass building
    '1486406146700-532a9ca61417', // Modern office
    '1545324418-cc1a3fa10b86', // Contemporary design
    '1449824913935-59a10b8d2000', // Urban architecture
    '1558618047-3c8da1c04d0a', // Building facade
    '1513475382585-d06e58bcb0e6', // Modern structure
    '1495433167890-4c28362e931e', // Glass architecture
    '1520637836862-4d197d17c82a', // Contemporary building
    '1506905925346-21bda4d32df4', // Architectural detail
    '1486390227850-391b14cc8ac6', // Modern design
    '1516156008625-3a99de2a904a', // Building interior
    '1497366216548-37526070297c', // Architecture photography
    '1526628953301-3e589a6a8b74'  // Urban design
  ]

  const getArchitectureImageId = (blogId: number, category?: string): string => {
    // Create a more varied distribution based on blog ID and category
    const hash = (blogId * 31 + (category?.length || 0) * 7) % architectureImages.length
    return architectureImages[hash]
  }

  const hardcodedComments: Comment[] = [
    {
      id: 1,
      content: "Excellent article! The section on passive solar design was particularly insightful. We've been implementing these principles in our recent projects and seeing great results.",
      author_id: 10,
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      likes_count: 15,
      author: {
        id: 10,
        first_name: "Amit",
        last_name: "Verma"
      },
      replies: []
    },
    {
      id: 2,
      content: "Great read! Would love to see more case studies from Indian projects. The ITC Green Centre example was inspiring.",
      author_id: 11,
      created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      likes_count: 8,
      author: {
        id: 11,
        first_name: "Sneha",
        last_name: "Patel"
      },
      replies: []
    },
    {
      id: 3,
      content: "As a student, this article helped me understand sustainable architecture beyond just textbook definitions. Thank you!",
      author_id: 12,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      likes_count: 12,
      author: {
        id: 12,
        first_name: "Rohan",
        last_name: "Kumar"
      },
      replies: []
    }
  ]

  const [blog, setBlog] = useState<Blog | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [liked, setLiked] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    setIsAuthenticated(api.isAuthenticated())
    fetchBlog()
    fetchComments()
  }, [slug])

  const fetchBlog = async () => {
    try {
      setLoading(true)
      
      // Fetch from real API
      const response = await fetch(`http://localhost:8000/blogs/slug/${slug}`)
      
      if (response.ok) {
        const data = await response.json()
        setBlog(data)
      } else {
        // Fallback to hardcoded data if API fails
        const foundBlog = hardcodedBlogs.find(b => b.slug === slug)
        if (foundBlog) {
          setBlog(foundBlog)
        }
      }
    } catch (error) {
      console.error("Error fetching blog:", error)
      // Fallback to hardcoded data on error
      const foundBlog = hardcodedBlogs.find(b => b.slug === slug)
      if (foundBlog) {
        setBlog(foundBlog)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Use hardcoded comments
      setComments(hardcodedComments)
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated || !blog) return
    try {
      await api.post(`/blogs/${blog.id}/like`, {})
      setLiked(!liked)
      setBlog({
        ...blog,
        likes_count: liked ? blog.likes_count - 1 : blog.likes_count + 1
      })
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handleCommentSubmit = async () => {
    if (!isAuthenticated || !blog || !newComment.trim()) return
    
    try {
      setSubmittingComment(true)
      await api.post(`/blogs/${blog.id}/comments`, { content: newComment })
      setNewComment("")
      fetchComments()
      setBlog({ ...blog, comments_count: blog.comments_count + 1 })
    } catch (error) {
      console.error("Error submitting comment:", error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / wordsPerMinute)
    return `${minutes} min read`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog not found</h2>
          <Link href="/blogs">
            <Button variant="outline">Back to Blogs</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-500 to-indigo-700 py-20 text-white">
        <div className="container mx-auto px-4 relative z-10">
          <Link
            href="/blogs"
            className="inline-flex items-center text-blue-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{blog.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-blue-100">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {new Date(blog.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              {blog.author.first_name} {blog.author.last_name}
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">
              {blog.category}
            </Badge>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 -mt-20 relative z-20 border border-blue-100">
            {/* Featured Image */}
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-8 overflow-hidden shadow-2xl relative">
              <img 
                src={`https://images.unsplash.com/photo-${getArchitectureImageId(blog.id, blog.category)}?w=800&h=450&fit=crop&crop=entropy&auto=format&q=80&saturation=-10&brightness=5`}
                alt={blog.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=450&fit=crop&crop=entropy&auto=format&q=80`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            </div>

            <div className="prose prose-lg prose-blue max-w-none">
              {/* We'll render markdown content here. For now, just displaying raw content or simple paragraphs */}
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {blog.content}
              </div>
              
              {/* Example of rich content structure that would come from markdown */}
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Key Takeaways</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li>Understanding the core concepts of architectural design</li>
                <li>Mastering the tools and techniques for modern visualization</li>
                <li>Building a strong portfolio for career advancement</li>
              </ul>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg">
                <p className="text-blue-800 font-medium italic m-0">
                  "Architecture is not just about buildings; it's about creating spaces that inspire and elevate the human spirit."
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {["Architecture", "Design", "NATA", "JEE Paper 2"].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Author Bio */}
          <div className="mt-12 bg-white rounded-xl p-8 border border-gray-200 flex items-start gap-6">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">About the Author</h3>
              <p className="text-gray-600 mb-4">
                {blog.author.first_name} {blog.author.last_name} is a senior architect and educator with over 10 years of experience in guiding students for NATA and JEE architecture exams.
              </p>
              <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
