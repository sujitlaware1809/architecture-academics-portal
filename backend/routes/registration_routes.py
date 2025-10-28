from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import crud
import schemas
from database import get_db, User, EventRegistration, WorkshopRegistration, Event, Workshop
from routes.auth_routes import get_current_user

router = APIRouter(prefix="/api", tags=["User Registrations"])

@router.get("/event-registrations/my-events")
async def get_my_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all registered events for current user"""
    registrations = db.query(EventRegistration).filter(
        EventRegistration.participant_id == current_user.id
    ).all()
    
    result = []
    for registration in registrations:
        event = db.query(Event).filter(Event.id == registration.event_id).first()
        if event:
            registered_count = db.query(EventRegistration).filter(
                EventRegistration.event_id == event.id
            ).count()
            
            result.append({
                "id": registration.id,
                "event_id": registration.event_id,
                "registered_at": registration.registered_at.isoformat() if registration.registered_at else None,
                "status": "confirmed",  # You can add status field to EventRegistration model if needed
                "event": {
                    "id": event.id,
                    "title": event.title,
                    "description": event.description,
                    "image_url": event.image_url,
                    "event_date": event.event_date.isoformat() if event.event_date else None,
                    "event_time": event.event_time,
                    "location": event.location,
                    "capacity": event.capacity,
                    "registered_count": registered_count,
                    "event_type": event.event_type or "Conference"
                }
            })
    
    return result

@router.get("/workshop-registrations/my-workshops")
async def get_my_workshops(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all registered workshops for current user"""
    registrations = db.query(WorkshopRegistration).filter(
        WorkshopRegistration.participant_id == current_user.id
    ).all()
    
    result = []
    for registration in registrations:
        workshop = db.query(Workshop).filter(Workshop.id == registration.workshop_id).first()
        if workshop:
            registered_count = db.query(WorkshopRegistration).filter(
                WorkshopRegistration.workshop_id == workshop.id
            ).count()
            
            result.append({
                "id": registration.id,
                "workshop_id": registration.workshop_id,
                "registered_at": registration.registered_at.isoformat() if registration.registered_at else None,
                "status": "confirmed",  # You can add status field to WorkshopRegistration model if needed
                "workshop": {
                    "id": workshop.id,
                    "title": workshop.title,
                    "description": workshop.description,
                    "image_url": workshop.image_url,
                    "date": workshop.date.isoformat() if workshop.date else None,
                    "time": workshop.time,
                    "location": workshop.location,
                    "capacity": workshop.capacity,
                    "registered_count": registered_count,
                    "category": workshop.category,
                    "skill_level": workshop.skill_level
                }
            })
    
    return result