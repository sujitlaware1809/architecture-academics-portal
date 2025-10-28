from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import crud
import schemas
from database import get_db, User, Workshop, WorkshopRegistration
from routes.auth_routes import get_current_user

router = APIRouter(prefix="/workshops", tags=["Workshops"])

# Public Workshops Endpoint
@router.get("", response_model=List[schemas.WorkshopResponse])
async def get_public_workshops(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all workshops for public view"""
    # Return all workshops without status filtering for now
    return crud.get_workshops(db, skip=skip, limit=limit)

# Workshop Registration (Public)
@router.post("/{workshop_id}/register")
async def register_for_workshop(
    workshop_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register current user for a workshop (free registration)"""
    # Check if workshop exists
    workshop = db.query(Workshop).filter(Workshop.id == workshop_id).first()
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    
    # Check if workshop is full (count registrations directly)
    if workshop.max_participants:
        current_count = db.query(WorkshopRegistration).filter(WorkshopRegistration.workshop_id == workshop_id).count()
        if current_count >= workshop.max_participants:
            raise HTTPException(status_code=400, detail="Workshop is full")
    
    # Register user
    registration = crud.register_for_workshop(db, workshop_id, current_user.id)
    if not registration:
        raise HTTPException(status_code=400, detail="You are already registered for this workshop")
    
    return {
        "message": "Successfully registered for workshop",
        "workshop_id": workshop_id,
        "registration_id": registration.id,
        "registered_at": registration.registered_at
    }

@router.get("/{workshop_id}/registration-status")
async def check_workshop_registration_status(
    workshop_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if current user is registered for a workshop"""
    from sqlalchemy import and_
    
    registration = db.query(WorkshopRegistration).filter(
        and_(
            WorkshopRegistration.workshop_id == workshop_id,
            WorkshopRegistration.participant_id == current_user.id
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