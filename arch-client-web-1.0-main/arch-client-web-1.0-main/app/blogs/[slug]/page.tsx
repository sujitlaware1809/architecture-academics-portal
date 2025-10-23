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
  Bookmark
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
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Find blog by slug from hardcoded data
      const foundBlog = hardcodedBlogs.find(b => b.slug === slug)
      
      if (foundBlog) {
        setBlog(foundBlog)
      }
    } catch (error) {
      console.error("Error fetching blog:", error)
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
      {/* Top Bar */}
      <div className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/blogs">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bookmark className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {blog.title}
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          {blog.excerpt}
        </p>

        {/* Author Info */}
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
              {blog.author.first_name[0]}{blog.author.last_name[0]}
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {blog.author.first_name} {blog.author.last_name}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>{formatDate(blog.created_at)}</span>
                <span>·</span>
                <span>{getReadingTime(blog.content)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={!isAuthenticated}
              className={liked ? "text-red-600" : ""}
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
              <span className="ml-1">{blog.likes_count}</span>
            </Button>
            <Button variant="ghost" size="sm">
              <MessageSquare className="h-5 w-5" />
              <span className="ml-1">{blog.comments_count}</span>
            </Button>
          </div>
        </div>

        {/* Category Badge */}
        <div className="mb-8">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {blog.category}
          </Badge>
        </div>

        {/* Content */}
        <div className="prose prose-lg prose-purple max-w-none mb-16">
          <div className="article-content text-gray-800 leading-relaxed space-y-6">
            {blog.content.split('\n').map((line, idx) => {
              const trimmedLine = line.trim()
              
              // H1 Headers
              if (trimmedLine.startsWith('# ') && !trimmedLine.startsWith('## ')) {
                return (
                  <h1 key={idx} className="text-4xl font-bold text-gray-900 mt-16 mb-6 pb-3 border-b-2 border-purple-200">
                    {trimmedLine.replace(/^#\s*/, '')}
                  </h1>
                )
              }
              
              // H2 Headers
              if (trimmedLine.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-3xl font-bold text-gray-900 mt-12 mb-4">
                    {trimmedLine.replace(/^##\s*/, '')}
                  </h2>
                )
              }
              
              // H3 Headers
              if (trimmedLine.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-2xl font-bold text-gray-900 mt-8 mb-3">
                    {trimmedLine.replace(/^###\s*/, '')}
                  </h3>
                )
              }
              
              // List items
              if (trimmedLine.startsWith('- ')) {
                const content = trimmedLine.replace(/^-\s*/, '')
                // Check if it contains bold text
                if (content.includes('**')) {
                  const parts = content.split('**')
                  return (
                    <li key={idx} className="text-lg text-gray-700 mb-2 ml-6 leading-relaxed list-disc">
                      {parts.map((part, i) => (
                        i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part
                      ))}
                    </li>
                  )
                }
                return (
                  <li key={idx} className="text-lg text-gray-700 mb-2 ml-6 leading-relaxed list-disc">
                    {content}
                  </li>
                )
              }
              
              // Regular paragraphs
              if (trimmedLine) {
                // Handle bold text
                if (trimmedLine.includes('**')) {
                  const parts = trimmedLine.split('**')
                  return (
                    <p key={idx} className="text-lg text-gray-700 mb-6 leading-relaxed">
                      {parts.map((part, i) => (
                        i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part
                      ))}
                    </p>
                  )
                }
                return (
                  <p key={idx} className="text-lg text-gray-700 mb-6 leading-relaxed">
                    {trimmedLine}
                  </p>
                )
              }
              
              // Empty lines
              return <div key={idx} className="h-2"></div>
            })}
          </div>
        </div>

        {/* Tags */}
        {blog.tags && (
          <div className="mb-12 pb-12 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {blog.tags.split(',').map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-sm px-3 py-1">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Responses ({blog.comments_count})
          </h2>

          {/* Comment Form */}
          {isAuthenticated ? (
            <div className="mb-12">
              <Textarea
                placeholder="What are your thoughts?"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[120px] text-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900 resize-none"
              />
              <div className="flex justify-end mt-3">
                <Button
                  onClick={handleCommentSubmit}
                  disabled={!newComment.trim() || submittingComment}
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
                >
                  {submittingComment ? "Publishing..." : "Respond"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-12 p-6 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-4">Sign in to leave a response</p>
              <Link href="/login">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full">
                  Sign In
                </Button>
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-8">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No responses yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-8">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {comment.author.first_name[0]}{comment.author.last_name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {comment.author.first_name} {comment.author.last_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 gap-1">
                          <Heart className="h-4 w-4" />
                          {comment.likes_count}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
