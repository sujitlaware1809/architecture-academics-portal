from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from database import get_db, Course, Job, Blog, Event, Workshop, NATACourse
from pydantic import BaseModel

router = APIRouter(prefix="/search", tags=["Search"])

class SearchResult(BaseModel):
    id: int
    type: str
    title: str
    description: str
    url: str
    image: Optional[str] = None

@router.get("", response_model=List[SearchResult])
def search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    results = []
    search_term = f"%{q}%"

    # Search Courses
    courses = db.query(Course).filter(
        or_(
            Course.title.like(search_term),
            Course.description.like(search_term)
        )
    ).limit(5).all()
    
    for course in courses:
        results.append(SearchResult(
            id=course.id,
            type="Course",
            title=course.title,
            description=course.short_description or course.description[:100] + "...",
            url=f"/courses/{course.id}",
            image=course.image_url
        ))

    # Search NATA Courses
    nata_courses = db.query(NATACourse).filter(
        or_(
            NATACourse.title.like(search_term),
            NATACourse.description.like(search_term)
        )
    ).limit(5).all()
    
    for course in nata_courses:
        results.append(SearchResult(
            id=course.id,
            type="NATA Course",
            title=course.title,
            description=course.description[:100] + "...",
            url=f"/nata-courses/{course.id}",
            image=course.thumbnail
        ))

    # Search Jobs
    jobs = db.query(Job).filter(
        or_(
            Job.title.like(search_term),
            Job.description.like(search_term),
            Job.company.like(search_term)
        )
    ).limit(5).all()
    
    for job in jobs:
        results.append(SearchResult(
            id=job.id,
            type="Job",
            title=job.title,
            description=f"{job.company} - {job.location}",
            url=f"/jobs-portal/{job.id}",
            image=None
        ))

    # Search Blogs
    blogs = db.query(Blog).filter(
        or_(
            Blog.title.like(search_term),
            Blog.content.like(search_term)
        )
    ).limit(5).all()
    
    for blog in blogs:
        results.append(SearchResult(
            id=blog.id,
            type="Blog",
            title=blog.title,
            description=blog.excerpt or blog.content[:100] + "...",
            url=f"/blogs/{blog.id}",
            image=blog.featured_image
        ))

    # Search Events
    events = db.query(Event).filter(
        or_(
            Event.title.like(search_term),
            Event.description.like(search_term)
        )
    ).limit(5).all()
    
    for event in events:
        results.append(SearchResult(
            id=event.id,
            type="Event",
            title=event.title,
            description=event.short_description or event.description[:100] + "...",
            url=f"/events/{event.id}",
            image=event.image_url
        ))

    # Search Workshops
    workshops = db.query(Workshop).filter(
        or_(
            Workshop.title.like(search_term),
            Workshop.description.like(search_term)
        )
    ).limit(5).all()
    
    for workshop in workshops:
        results.append(SearchResult(
            id=workshop.id,
            type="Workshop",
            title=workshop.title,
            description=workshop.short_description or workshop.description[:100] + "...",
            url=f"/workshops/{workshop.id}",
            image=workshop.image_url
        ))

    return results
