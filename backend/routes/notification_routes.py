from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db, Notification, User
import schemas
import crud
from services.auth_service import get_current_user
from routes.auth_routes import get_current_admin
from email_service import send_email

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"]
)

class NotificationCreate(schemas.BaseModel):
    recipient_id: Optional[int] = None  # None means all users
    title: str
    message: str
    link: Optional[str] = None

class EmailSend(schemas.BaseModel):
    recipient_id: Optional[int] = None  # None means all users
    subject: str
    body: str

@router.post("/send", status_code=status.HTTP_201_CREATED)
async def send_notification(
    notification: schemas.NotificationCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Send notification to a user or all users (Admin only)"""
    if notification.recipient_id:
        # Send to specific user
        db_notification = Notification(
            recipient_id=notification.recipient_id,
            title=notification.title,
            message=notification.message,
            link=notification.link
        )
        db.add(db_notification)
    else:
        # Send to all users
        users = db.query(User).all()
        for user in users:
            db_notification = Notification(
                recipient_id=user.id,
                title=notification.title,
                message=notification.message,
                link=notification.link
            )
            db.add(db_notification)
    
    db.commit()
    return {"message": "Notification sent successfully"}

@router.post("/send-email", status_code=status.HTTP_200_OK)
async def send_email_notification(
    email_data: schemas.EmailSend,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Send email to a user or all users (Admin only)"""
    if email_data.recipient_id:
        # Send to specific user
        user = crud.get_user_by_id(db, email_data.recipient_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        background_tasks.add_task(
            send_email,
            to_email=user.email,
            subject=email_data.subject,
            body=email_data.body
        )
    else:
        # Send to all users
        users = db.query(User).all()
        for user in users:
            background_tasks.add_task(
                send_email,
                to_email=user.email,
                subject=email_data.subject,
                body=email_data.body
            )
            
    return {"message": "Email sending queued"}


@router.get("/", response_model=List[schemas.NotificationResponse])
async def get_notifications(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get notifications for current user"""
    notifications = db.query(Notification).filter(
        Notification.recipient_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(limit).all()
    return notifications

@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get count of unread notifications"""
    count = db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.is_read == False
    ).count()
    return {"count": count}

@router.put("/{id}/read")
async def mark_as_read(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark notification as read"""
    notification = db.query(Notification).filter(
        Notification.id == id,
        Notification.recipient_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}

@router.put("/read-all")
async def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read"""
    db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.is_read == False
    ).update({Notification.is_read: True})
    
    db.commit()
    return {"message": "All notifications marked as read"}
