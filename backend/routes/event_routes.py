from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import crud
import schemas
from database import get_db, User, Event, EventRegistration
from routes.auth_routes import get_current_user

router = APIRouter(prefix="/events", tags=["Events"])

# Public Events Endpoint
@router.get("", response_model=List[schemas.EventResponse])
async def get_public_events(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all events for public view"""
    # Return all events without status filtering for now
    return crud.get_events(db, skip=skip, limit=limit)

# Event Registration (Public)
@router.post("/{event_id}/register")
async def register_for_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register current user for an event (free registration)"""
    # Check if event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if event is full (count registrations directly)
    if event.max_participants:
        current_count = db.query(EventRegistration).filter(EventRegistration.event_id == event_id).count()
        if current_count >= event.max_participants:
            raise HTTPException(status_code=400, detail="Event is full")
    
    # Register user
    registration = crud.register_for_event(db, event_id, current_user.id)
    if not registration:
        raise HTTPException(status_code=400, detail="You are already registered for this event")
    
    return {
        "message": "Successfully registered for event",
        "event_id": event_id,
        "registration_id": registration.id,
        "registered_at": registration.registered_at
    }

@router.get("/{event_id}/registration-status")
async def check_event_registration_status(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if current user is registered for an event"""
    from sqlalchemy import and_
    
    registration = db.query(EventRegistration).filter(
        and_(
            EventRegistration.event_id == event_id,
            EventRegistration.participant_id == current_user.id
        )
    ).first()
    
    return {
        "is_registered": registration is not None,
        "registration": {
            "id": registration.id,
            "registered_at": registration.registered_at,
            "attended": registration.attended
        } if registration else None
    }