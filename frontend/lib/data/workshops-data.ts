import { Workshop } from "@/components/workshops/workshop-card"

export const mockWorkshops: Workshop[] = [
  {
    id: 1,
    title: "Parametric Design with Grasshopper",
    description: "Master the fundamentals of parametric modeling in architecture using Grasshopper for Rhino. Create complex, algorithmic designs efficiently.",
    trainer: {
      name: "Dr. Alex Thompson",
      bio: "Dr. Thompson is a computational design specialist with over 15 years of experience. He has taught at MIT and worked with leading architecture firms on parametric design projects globally.",
      image: "/placeholder-user.jpg"
    },
    date: "2025-10-15",
    duration: 18,
    mode: "Online",
    price: 4999,
    category: "Computational Design",
    difficulty: "Intermediate",
    syllabus: [
      "Introduction to parametric thinking and algorithmic design",
      "Grasshopper interface and component types",
      "Data management and list manipulation",
      "Creating basic parametric patterns and structures",
      "Advanced data trees and complex geometry generation",
      "Optimization and form-finding techniques",
      "Fabrication preparation and output methods"
    ],
    prerequisites: [
      "Basic knowledge of Rhino 3D",
      "Understanding of geometric principles",
      "Laptop with Rhino 7 and Grasshopper installed (trial version acceptable)"
    ],
    isTrending: true,`n    max_participants: 50,`n    status: "published",`n    created_at: "2025-01-01T00:00:00Z",`n    updated_at: "2025-01-01T00:00:00Z",`n    registered_count: 0,
    imageUrl: "/placeholder.jpg",`n    max_participants: 50,`n    status: "published",`n    created_at: "2025-01-01T00:00:00Z",`n    updated_at: "2025-01-01T00:00:00Z",`n    registered_count: 0
  },
  {
    id: 2,
    title: "Sustainable Materials in Architecture",
    description: "Explore innovative and eco-friendly materials for architectural design and construction. Learn practical applications and specification methods.",
    trainer: {
      name: "Prof. Sophia Chen",
      bio: "Professor Chen is a sustainability expert who has published extensively on ecological building materials. She consults for green building councils worldwide and has received awards for her research in biomaterials for construction."
    },
    date: "2025-09-20",
    duration: 18,
    mode: "Offline",
    venue: "Design Institute, Chicago",
    price: 0,
    category: "Sustainable Design",
    difficulty: "Beginner",
    syllabus: [
      "Overview of sustainable materials criteria and certification",
      "Bio-based and recycled materials for construction",
      "Material selection for reduced carbon footprint",
      "Case studies of successful sustainable material applications",
      "Specification writing for green materials",
      "Cost considerations and lifecycle analysis",
      "Hands-on material testing and evaluation"
    ],
    limitedSeats: true,`n    max_participants: 50,`n    status: "published",`n    created_at: "2025-01-01T00:00:00Z",`n    updated_at: "2025-01-01T00:00:00Z",`n    registered_count: 0,
    imageUrl: "/placeholder.jpg",`n    max_participants: 50,`n    status: "published",`n    created_at: "2025-01-01T00:00:00Z",`n    updated_at: "2025-01-01T00:00:00Z",`n    registered_count: 0
  },
  {
    id: 3,
    title: "BIM Management and Coordination",
    description: "Comprehensive workshop on managing Building Information Modeling projects, coordinating teams, and ensuring BIM standards compliance.",
    trainer: {
      name: "Marcus Williams",
      bio: "Marcus has implemented BIM processes for major architectural and engineering firms worldwide. He specializes in BIM management protocols and has developed custom solutions for multidisciplinary coordination on complex projects."
    },
    date: "2025-11-05",
    duration: 18,
    mode: "Online",
    price: 6499,
    category: "BIM",
    difficulty: "Advanced",
    syllabus: [
      "BIM project setup and template creation",
      "Establishing BIM Execution Plans (BEP)",
      "Managing team workflows and responsibilities",
      "Clash detection and issue resolution strategies",
      "Information exchange protocols and standards",
      "Quality control processes for BIM models",
      "BIM for facilities management and handover"
    ],
    prerequisites: [
      "Working knowledge of at least one BIM software (Revit, ArchiCAD, etc.)",
      "Previous experience in collaborative BIM projects",
      "Understanding of project management principles"
    ],
    isTrending: true,`n    max_participants: 50,`n    status: "published",`n    created_at: "2025-01-01T00:00:00Z",`n    updated_at: "2025-01-01T00:00:00Z",`n    registered_count: 0
  },
  {
    id: 4,
    title: "Architectural Photography Fundamentals",
    description: "Learn how to capture compelling architectural photography that highlights design features and spatial qualities effectively.",
    trainer: {
      name: "Isabella Rodriguez",
      bio: "Award-winning architectural photographer with work featured in major design publications including Architectural Digest and Dezeen. Isabella combines technical expertise with an architect's eye for space and form."
    },
    date: "2025-09-25",
    duration: 18,
    mode: "Offline",
    venue: "Urban Photography Studio, New York",
    price: 2999,
    category: "Visual Communication",
    difficulty: "Beginner",
    syllabus: [
      "Camera settings for architectural photography",
      "Lighting techniques for interior and exterior shots",
      "Composition principles for architectural spaces",
      "Post-processing workflow for architectural images",
      "Equipment selection and setup",
      "Shooting strategies for different building types",
      "Creating narrative through architectural photography"
    ],
    prerequisites: [
      "Basic understanding of camera operation",
      "Digital camera with manual controls (DSLR or mirrorless preferred)",
      "Tripod (recommended but not required)"
    ],
    limitedSeats: true,`n    max_participants: 50,`n    status: "published",`n    created_at: "2025-01-01T00:00:00Z",`n    updated_at: "2025-01-01T00:00:00Z",`n    registered_count: 0
  },
  {
    id: 5,
    title: "Advanced Pedagogical Methods for Architectural Education",
    description: "Comprehensive faculty development program focusing on innovative teaching methodologies for architecture and design education.",
    trainer: {
      name: "Dr. Robert Foster",
      bio: "Dr. Foster is the Chair of Architectural Education at Cambridge University with 25 years of experience in developing curriculum and teaching methodologies. He has pioneered several award-winning educational approaches for design disciplines.",
      image: "/placeholder-user.jpg"
    },
    date: "2025-10-10",
    duration: 18,
    mode: "Online",
    price: 0,
    category: "Education",
    difficulty: "Intermediate",
    syllabus: [
      "Contemporary trends in architectural education",
      "Studio teaching strategies and critique methodologies",
      "Integration of technology in design education",
      "Assessment methods for design work and process",
      "Developing inclusive teaching practices",
      "Research-informed teaching in architecture",
      "Curriculum development and course design",
      "Balancing theory and practice in architectural education"
    ],
    prerequisites: [
      "Current teaching position in architecture or design field",
      "Minimum 2 years of teaching experience"
    ],
    isFDP: true,`n    max_participants: 50,`n    status: "published",`n    created_at: "2025-01-01T00:00:00Z",`n    updated_at: "2025-01-01T00:00:00Z",`n    registered_count: 0,
    imageUrl: "/placeholder.jpg",`n    max_participants: 50,`n    status: "published",`n    created_at: "2025-01-01T00:00:00Z",`n    updated_at: "2025-01-01T00:00:00Z",`n    registered_count: 0
  },
  {
    id: 6,
    title: "Research Methods for Architecture Faculty",
    description: "Faculty development program on research methodologies, publication strategies, and grant writing for architecture educators.",
    trainer: {
      name: "Prof. Diana Richards",
      bio: "Professor Richards has published over 50 peer-reviewed papers on architectural research and secured major research grants from NSF and other institutions. She specializes in helping faculty develop robust research agendas that complement their teaching."
    },
    date: "2025-11-15",
    duration: 18,
    mode: "Online",
    venue: "Architecture Research Center (or online)",
    price: 0,
    category: "Research",
    difficulty: "Advanced",
    syllabus: [
      "Qualitative and quantitative research methods for architecture",
      "Developing research questions and frameworks",
      "Literature review strategies and citation management",
      "Academic writing for architecture journals",
      "Research grant proposal development",
      "Integrating research and teaching",
      "Establishing research collaborations and networks",
      "Publication strategies and open access considerations"
    ],
    isFDP: true,`n    max_participants: 50,`n    status: "published",`n    created_at: "2025-01-01T00:00:00Z",`n    updated_at: "2025-01-01T00:00:00Z",`n    registered_count: 0
  },
  {
    id: 7,
    title: "Virtual Reality for Architectural Presentation",
    description: "Hands-on workshop on using VR technologies to create immersive architectural presentations and client experiences.",
    trainer: {
      name: "Jason Kim",
      bio: "Jason has pioneered VR applications in major architectural firms and developed custom workflows for integrating VR into the design process. His work has been featured at technology conferences worldwide."
    },
    date: "2025-09-18",
    duration: 18,
    mode: "Offline",
    venue: "Tech Innovation Hub, San Francisco",
    price: 5499,
    category: "Digital Tools",
    difficulty: "Intermediate",
    syllabus: [
      "VR hardware and software options for architecture",
      "Preparing 3D models for VR experiences",
      "Creating interactive VR architectural walkthroughs",
      "Lighting and material considerations for VR",
      "Client presentation strategies using VR",
      "VR for design development and testing",
      "Future trends in immersive architectural visualization"
    ],
    prerequisites: [
      "Basic 3D modeling skills",
      "Familiarity with rendering concepts",
      "Laptop meeting minimum requirements for VR development"
    ],
    isTrending: true,`n    max_participants: 50,`n    status: "published",`n    created_at: "2025-01-01T00:00:00Z",`n    updated_at: "2025-01-01T00:00:00Z",`n    registered_count: 0,
    imageUrl: "/placeholder.jpg",`n    max_participants: 50,`n    status: "published",`n    created_at: "2025-01-01T00:00:00Z",`n    updated_at: "2025-01-01T00:00:00Z",`n    registered_count: 0
  },
  {
    id: 8,
    title: "Digital Assessment Methods for Architecture Courses",
    description: "FDP focused on implementing effective digital evaluation tools and techniques for architecture and design education.",
    trainer: {
      name: "Dr. Michelle Wong",
      bio: "Dr. Wong specializes in educational technology for design disciplines and has developed assessment frameworks used by leading architecture schools. She consults on curriculum development and educational technology integration."
    },
    date: "2025-10-05",
    duration: 18,
    mode: "Online",
    price: 0,
    category: "Education Technology",
    difficulty: "Intermediate",
    syllabus: [
      "Digital assessment platforms for design work",
      "Developing rubrics for architectural design evaluation",
      "E-portfolio implementation and assessment",
      "Feedback methods using digital tools",
      "Tracking student progress in design development",
      "Academic integrity in digital design submission",
      "Data-informed teaching in architecture studios"
    ],
    isFDP: true,`n    max_participants: 50,`n    status: "published",`n    created_at: "2025-01-01T00:00:00Z",`n    updated_at: "2025-01-01T00:00:00Z",`n    registered_count: 0
  },
  {
    id: 9,
    title: "Architectural Acoustics Fundamentals",
    description: "Learn the principles of architectural acoustics and how to integrate acoustic considerations into design projects effectively.",
    trainer: {
      name: "Dr. Carlos Mendes",
      bio: "Acoustical engineer and architect with 20 years of experience designing concert halls, auditoriums, and acoustic solutions for various building types. Dr. Mendes combines scientific principles with practical design applications."
    },
    date: "2025-11-20",
    duration: 18,
    mode: "Online",
    price: 3999,
    category: "Building Science",
    difficulty: "Intermediate",
    syllabus: [
      "Fundamentals of sound behavior in spaces",
      "Room acoustics principles and calculations",
      "Materials selection for acoustic performance",
      "Acoustic modeling and simulation tools",
      "Integration of acoustics in the design process",
      "Case studies of acoustic design solutions",
      "Noise control strategies for different building types"
    ],
    prerequisites: [
      "Basic understanding of architectural design",
      "Familiarity with building construction principles"
    ]
  }
]




