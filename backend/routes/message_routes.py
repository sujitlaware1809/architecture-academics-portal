from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import database
import schemas
import crud
from database import get_db, Message, User
from routes.auth_routes import get_current_user, get_current_admin

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.post("/", response_model=schemas.MessageResponse)
async def send_message(
    message: schemas.MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message to a user (by email)"""
    recipient = crud.get_user_by_email(db, email=message.recipient_email)
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email {message.recipient_email} not found"
        )
    
    db_message = Message(
        sender_id=current_user.id,
        recipient_id=recipient.id,
        subject=message.subject,
        content=message.content
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/", response_model=List[schemas.MessageResponse])
async def get_my_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    """Get messages received by the current user"""
    messages = db.query(Message).filter(
        Message.recipient_id == current_user.id
    ).order_by(Message.created_at.desc()).offset(skip).limit(limit).all()
    return messages

@router.get("/sent", response_model=List[schemas.MessageResponse])
async def get_sent_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    """Get messages sent by the current user"""
    messages = db.query(Message).filter(
        Message.sender_id == current_user.id
    ).order_by(Message.created_at.desc()).offset(skip).limit(limit).all()
    return messages

@router.put("/{message_id}/read", response_model=schemas.MessageResponse)
async def mark_message_read(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a message as read"""
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if message.recipient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this message")
    
    message.is_read = True
    db.commit()
    db.refresh(message)
    return message

@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get count of unread messages"""
    count = db.query(Message).filter(
        Message.recipient_id == current_user.id,
        Message.is_read == False
    ).count()
    return {"count": count}
