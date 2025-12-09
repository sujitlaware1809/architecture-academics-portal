"""Sample lesson data with YouTube videos for courses."""

def get_sample_lessons_for_course(course_id: int):
    """Returns a list of sample lessons with YouTube video URLs for a course."""
    
    # Architecture introduction videos from YouTube
    lessons = [
        {
            "course_id": course_id,
            "title": "Introduction to Architectural Design Principles",
            "description": "Learn the fundamental principles of architectural design including form, function, space, and composition.",
            "video_url": "https://www.youtube.com/watch?v=Mw3zzxPbKvc",  # Architecture Design Principles
            "video_duration": 845,  # 14:05 minutes
            "order_index": 0,
            "is_free": True
        },
        {
            "course_id": course_id,
            "title": "Understanding Spatial Organization",
            "description": "Explore how architects organize space to create functional and beautiful environments.",
            "video_url": "https://www.youtube.com/watch?v=YsNj9N-rAHI",  # Space in architecture
            "video_duration": 612,  # 10:12 minutes
            "order_index": 1,
            "is_free": False
        },
        {
            "course_id": course_id,
            "title": "Architectural Drawing Techniques",
            "description": "Master the essential drawing techniques used by professional architects.",
            "video_url": "https://www.youtube.com/watch?v=0jh6YYziLp4",  # Drawing tutorial
            "video_duration": 723,  # 12:03 minutes
            "order_index": 2,
            "is_free": False
        },
        {
            "course_id": course_id,
            "title": "Design Thinking in Architecture",
            "description": "Learn how to apply design thinking methodology to architectural problems.",
            "video_url": "https://www.youtube.com/watch?v=_r0VX-aU_T8",  # Design thinking
            "video_duration": 520,  # 8:40 minutes
            "order_index": 3,
            "is_free": False
        },
        {
            "course_id": course_id,
            "title": "Form and Function in Modern Architecture",
            "description": "Understand the relationship between form and function in contemporary design.",
            "video_url": "https://www.youtube.com/watch?v=kkGeOWYOFoA",  # Modern architecture
            "video_duration": 680,  # 11:20 minutes
            "order_index": 4,
            "is_free": False
        },
        {
            "course_id": course_id,
            "title": "Color Theory in Architecture",
            "description": "Discover how color influences architectural design and user experience.",
            "video_url": "https://www.youtube.com/watch?v=9ylQPwhlAbU",  # Color in architecture
            "video_duration": 456,  # 7:36 minutes
            "order_index": 5,
            "is_free": False
        },
        {
            "course_id": course_id,
            "title": "Materials and Textures",
            "description": "Learn about different architectural materials and how to use textures effectively.",
            "video_url": "https://www.youtube.com/watch?v=5Y4lHHmPQH8",  # Materials in architecture
            "video_duration": 532,  # 8:52 minutes
            "order_index": 6,
            "is_free": False
        },
        {
            "course_id": course_id,
            "title": "Architectural Composition",
            "description": "Master the art of architectural composition and visual balance.",
            "video_url": "https://www.youtube.com/watch?v=wvjc4qo-K6I",  # Composition basics
            "video_duration": 598,  # 9:58 minutes
            "order_index": 7,
            "is_free": False
        }
    ]
    
    return lessons


def get_digital_tools_lessons(course_id: int):
    """Lessons for Digital Tools for Architects course."""
    return [
        {
            "course_id": course_id,
            "title": "Introduction to AutoCAD for Architects",
            "description": "Get started with AutoCAD basics and essential commands for architectural drafting.",
            "video_url": "https://www.youtube.com/watch?v=gcMBLkXS88s",  # AutoCAD tutorial
            "video_duration": 1245,  # 20:45 minutes
            "order_index": 0,
            "is_free": True
        },
        {
            "course_id": course_id,
            "title": "SketchUp Fundamentals",
            "description": "Learn the basics of 3D modeling with SketchUp for architectural visualization.",
            "video_url": "https://www.youtube.com/watch?v=OUmEEI0GM0w",  # SketchUp tutorial
            "video_duration": 892,  # 14:52 minutes
            "order_index": 1,
            "is_free": False
        },
        {
            "course_id": course_id,
            "title": "Revit Architecture Basics",
            "description": "Introduction to BIM (Building Information Modeling) using Revit Architecture.",
            "video_url": "https://www.youtube.com/watch?v=zBLVAQ46tiY",  # Revit basics
            "video_duration": 1823,  # 30:23 minutes
            "order_index": 2,
            "is_free": False
        },
        {
            "course_id": course_id,
            "title": "3ds Max for Architectural Visualization",
            "description": "Create photorealistic architectural renders using 3ds Max.",
            "video_url": "https://www.youtube.com/watch?v=4DHZXpSDqCQ",  # 3ds Max tutorial
            "video_duration": 1456,  # 24:16 minutes
            "order_index": 3,
            "is_free": False
        },
        {
            "course_id": course_id,
            "title": "V-Ray Rendering Techniques",
            "description": "Master V-Ray rendering engine for stunning architectural visualizations.",
            "video_url": "https://www.youtube.com/watch?v=U8V-K8xjgBg",  # V-Ray tutorial
            "video_duration": 967,  # 16:07 minutes
            "order_index": 4,
            "is_free": False
        },
        {
            "course_id": course_id,
            "title": "Photoshop for Architects",
            "description": "Learn post-processing techniques to enhance architectural presentations.",
            "video_url": "https://www.youtube.com/watch?v=7jYPp9w-0UI",  # Photoshop for architecture
            "video_duration": 1134,  # 18:54 minutes
            "order_index": 5,
            "is_free": False
        }
    ]


def get_sustainable_architecture_lessons(course_id: int):
    """Lessons for Sustainable Architecture course."""
    return [
        {
            "course_id": course_id,
            "title": "Principles of Sustainable Design",
            "description": "Understand the core principles of sustainable and green architecture.",
            "video_url": "https://www.youtube.com/watch?v=TzYHMCksymbolic",  # Sustainable design principles
            "video_duration": 678,  # 11:18 minutes
            "order_index": 0,
            "is_free": True
        },
        {
            "course_id": course_id,
            "title": "Green Building Materials",
            "description": "Explore eco-friendly building materials and their applications.",
            "video_url": "https://www.youtube.com/watch?v=9kYPpvyP-_A",  # Green materials
            "video_duration": 543,  # 9:03 minutes
            "order_index": 1,
            "is_free": False
        },
        {
            "course_id": course_id,
            "title": "Passive Solar Design Strategies",
            "description": "Learn how to harness solar energy for heating and cooling buildings naturally.",
            "video_url": "https://www.youtube.com/watch?v=3BQS9TH4kmw",  # Passive solar design
            "video_duration": 734,  # 12:14 minutes
            "order_index": 2,
            "is_free": False
        },
        {
            "course_id": course_id,
            "title": "Water Conservation in Architecture",
            "description": "Techniques for rainwater harvesting and greywater recycling in buildings.",
            "video_url": "https://www.youtube.com/watch?v=KHGmFVyHxZI",  # Water conservation
            "video_duration": 489,  # 8:09 minutes
            "order_index": 3,
            "is_free": False
        },
        {
            "course_id": course_id,
            "title": "LEED Certification Guide",
            "description": "Understanding LEED rating system and achieving green building certification.",
            "video_url": "https://www.youtube.com/watch?v=W5fP6F5EJEY",  # LEED certification
            "video_duration": 612,  # 10:12 minutes
            "order_index": 4,
            "is_free": False
        },
        {
            "course_id": course_id,
            "title": "Net Zero Energy Buildings",
            "description": "Design buildings that produce as much energy as they consume.",
            "video_url": "https://www.youtube.com/watch?v=4ROdh5i1_Q4",  # Net zero buildings
            "video_duration": 823,  # 13:43 minutes
            "order_index": 5,
            "is_free": False
        }
    ]
