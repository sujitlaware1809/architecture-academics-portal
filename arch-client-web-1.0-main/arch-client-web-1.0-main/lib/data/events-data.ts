import { Event } from "@/components/events/event-card"

export const mockEvents: Event[] = [
  {
    id: 1,
    title: "International Architecture Conference 2025",
    description: "Join the premier architecture conference featuring top speakers from around the world discussing sustainable design, urban planning, and future trends in architecture.",
    date: "2025-10-15",
    time: "9:00 AM - 5:00 PM",
    venue: "Grand Convention Center, New York",
    isOnline: false,
    organizer: "Global Architecture Association",
    tags: ["Conference", "Professional"],
    agenda: [
      "9:00 AM - Registration and Coffee",
      "10:00 AM - Keynote: The Future of Sustainable Architecture",
      "12:00 PM - Networking Lunch",
      "1:30 PM - Panel Discussion: Urban Development Challenges",
      "3:00 PM - Workshop Sessions",
      "5:00 PM - Closing Remarks"
    ],
    speakers: [
      {
        name: "Dr. Sarah Johnson",
        bio: "Award-winning architect specializing in sustainable urban design",
        image: "/placeholder-user.jpg"
      },
      {
        name: "Prof. Michael Chen",
        bio: "Leading researcher in biophilic architecture and environmental psychology",
        image: "/placeholder-user.jpg"
      }
    ],
    registrationLink: "#register",
    imageUrl: "/placeholder.jpg"
  },
  {
    id: 2,
    title: "Sustainable Design Workshop",
    description: "A hands-on workshop focused on incorporating sustainable materials and practices in architectural design. Perfect for students and practicing architects.",
    date: "2025-09-20",
    time: "1:00 PM - 4:00 PM",
    venue: "Design Institute, Chicago",
    isOnline: false,
    organizer: "Green Building Council",
    tags: ["Workshop", "Sustainable"],
    agenda: [
      "1:00 PM - Introduction to Sustainable Materials",
      "1:45 PM - Case Studies Review",
      "2:30 PM - Hands-on Design Exercise",
      "3:30 PM - Group Presentations and Feedback"
    ],
    registrationLink: "#register",
    imageUrl: "/placeholder.jpg"
  },
  {
    id: 3,
    title: "Digital Fabrication in Architecture",
    description: "Explore the cutting-edge techniques in digital fabrication and how they're revolutionizing architectural practice and construction.",
    date: "2025-11-05",
    time: "10:00 AM - 3:00 PM",
    venue: "Tech Innovation Hub, San Francisco",
    isOnline: false,
    organizer: "Architecture & Technology Institute",
    tags: ["Seminar", "Technology"],
    agenda: [
      "10:00 AM - The Evolution of Digital Fabrication",
      "11:00 AM - Demo: 3D Printing for Architectural Models",
      "12:00 PM - Lunch Break",
      "1:00 PM - Parametric Design Workshop",
      "2:30 PM - Future Trends Discussion"
    ],
    registrationLink: "#register"
  },
  {
    id: 4,
    title: "Architecture Portfolio Review",
    description: "Get professional feedback on your architecture portfolio from industry experts and leading practitioners. Limited spots available.",
    date: "2025-09-25",
    time: "4:00 PM - 7:00 PM",
    venue: "Online Event",
    isOnline: true,
    organizer: "Career Advancement Network",
    tags: ["Workshop", "Career"],
    registrationLink: "#register"
  },
  {
    id: 5,
    title: "Historic Preservation Symposium",
    description: "A comprehensive exploration of best practices in historic preservation, restoration techniques, and adaptive reuse of historic structures.",
    date: "2025-10-10",
    time: "9:00 AM - 4:00 PM",
    venue: "Heritage Museum, Boston",
    isOnline: false,
    organizer: "Preservation Society",
    tags: ["Symposium", "Heritage"],
    agenda: [
      "9:00 AM - Welcome and Introduction",
      "9:30 AM - Keynote: Balancing Preservation and Adaptation",
      "11:00 AM - Case Study: The Restoration of City Hall",
      "12:00 PM - Lunch",
      "1:00 PM - Panel: Challenges in Modern Preservation",
      "2:30 PM - Hands-on Demonstration: Documentation Techniques",
      "3:30 PM - Closing Remarks and Q&A"
    ],
    registrationLink: "#register",
    imageUrl: "/placeholder.jpg"
  },
  {
    id: 6,
    title: "Urban Planning Hackathon",
    description: "A 48-hour collaborative event where teams work on innovative solutions to urban planning challenges. Open to architects, designers, developers, and urban planners.",
    date: "2025-11-15",
    time: "9:00 AM (Day 1) - 5:00 PM (Day 2)",
    venue: "Innovation Center, Seattle",
    isOnline: false,
    organizer: "Urban Future Initiative",
    tags: ["Hackathon", "Urban Planning"],
    registrationLink: "#register"
  },
  {
    id: 7,
    title: "Architectural Photography Masterclass",
    description: "Learn the art and technique of architectural photography from award-winning photographers. Cover composition, lighting, equipment, and post-processing.",
    date: "2025-09-18",
    time: "10:00 AM - 5:00 PM",
    venue: "Photography Studio, Los Angeles",
    isOnline: false,
    organizer: "Architectural Media Group",
    tags: ["Workshop", "Photography"],
    registrationLink: "#register",
    imageUrl: "/placeholder.jpg"
  },
  {
    id: 8,
    title: "Climate Responsive Design Webinar",
    description: "An online session focusing on designing buildings that respond effectively to local climate conditions for optimal comfort and energy efficiency.",
    date: "2025-10-05",
    time: "2:00 PM - 4:00 PM",
    venue: "Online Event",
    isOnline: true,
    organizer: "Sustainable Architecture Institute",
    tags: ["Webinar", "Sustainable"],
    speakers: [
      {
        name: "Prof. James Wilson",
        bio: "Climate design specialist with 20 years of experience in tropical and arid regions",
        image: "/placeholder-user.jpg"
      }
    ],
    registrationLink: "#register"
  },
  {
    id: 9,
    title: "Architecture and Wellness Symposium",
    description: "Exploring the intersection of architectural design and human wellbeing, focusing on spaces that promote physical and mental health.",
    date: "2025-11-20",
    time: "9:00 AM - 3:00 PM",
    venue: "Wellness Center, Denver",
    isOnline: false,
    organizer: "Architecture & Health Coalition",
    tags: ["Symposium", "Wellness"],
    registrationLink: "#register"
  }
]
