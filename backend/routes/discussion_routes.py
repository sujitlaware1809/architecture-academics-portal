from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List

import crud
import schemas
from database import get_db, User
from routes.auth_routes import get_current_user

router = APIRouter(prefix="/discussions", tags=["Discussions"])

# Get all discussions
@router.get("", response_model=List[schemas.DiscussionResponse])
async def get_discussions(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    author_id: Optional[int] = Query(None),
    is_solved: Optional[bool] = Query(None),
    is_pinned: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all discussions with optional filters"""
    discussions = crud.get_discussions(
        db=db,
        search=search,
        category=category,
        author_id=author_id,
        is_solved=is_solved,
        is_pinned=is_pinned,
        skip=skip,
        limit=limit
    )
    return discussions

# Get a single discussion
@router.get("/{discussion_id}", response_model=schemas.DiscussionResponse)
async def get_discussion(
    discussion_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific discussion by ID and increment views"""
    discussion = crud.get_discussion(db, discussion_id)
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    # Increment view count
    crud.increment_discussion_views(db, discussion_id)
    
    return discussion

# Create a new discussion
@router.post("", response_model=schemas.DiscussionResponse, status_code=status.HTTP_201_CREATED)
async def create_discussion(
    discussion: schemas.DiscussionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new discussion (requires authentication)"""
    return crud.create_discussion(db, discussion, current_user.id)

# Update a discussion
@router.put("/{discussion_id}", response_model=schemas.DiscussionResponse)
async def update_discussion(
    discussion_id: int,
    discussion: schemas.DiscussionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a discussion (author or admin only)"""
    existing_discussion = crud.get_discussion(db, discussion_id)
    if not existing_discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    # Check if user is the author or admin
    if existing_discussion.author_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to update this discussion")
    
    updated_discussion = crud.update_discussion(db, discussion_id, discussion)
    return updated_discussion

# Delete a discussion
@router.delete("/{discussion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_discussion(
    discussion_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a discussion (author or admin only)"""
    discussion = crud.get_discussion(db, discussion_id)
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    # Check if user is the author or admin
    if discussion.author_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete this discussion")
    
    crud.delete_discussion(db, discussion_id)
    return None

# Get discussion replies
@router.get("/{discussion_id}/replies", response_model=List[schemas.DiscussionReplyResponse])
async def get_discussion_replies(
    discussion_id: int,
    db: Session = Depends(get_db)
):
    """Get all replies for a discussion"""
    discussion = crud.get_discussion(db, discussion_id)
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    replies = crud.get_discussion_replies(db, discussion_id)
    return replies

# Create a reply to a discussion
@router.post("/{discussion_id}/replies", response_model=schemas.DiscussionReplyResponse, status_code=status.HTTP_201_CREATED)
async def create_discussion_reply(
    discussion_id: int,
    reply: schemas.DiscussionReplyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a reply to a discussion"""
    discussion = crud.get_discussion(db, discussion_id)
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    # Ensure the reply is for this discussion
    reply.discussion_id = discussion_id
    
    return crud.create_discussion_reply(db, reply, current_user.id)

# Update a reply
@router.put("/replies/{reply_id}", response_model=schemas.DiscussionReplyResponse)
async def update_reply(
    reply_id: int,
    reply: schemas.DiscussionReplyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a reply (author or admin only)"""
    from database import DiscussionReply
    existing_reply = db.query(DiscussionReply).filter(DiscussionReply.id == reply_id).first()
    
    if not existing_reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    # Check if user is the author or admin
    if existing_reply.author_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to update this reply")
    
    updated_reply = crud.update_discussion_reply(db, reply_id, reply)
    return updated_reply

# Delete a reply
@router.delete("/replies/{reply_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reply(
    reply_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a reply (author or admin only)"""
    from database import DiscussionReply
    reply = db.query(DiscussionReply).filter(DiscussionReply.id == reply_id).first()
    
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    # Check if user is the author or admin
    if reply.author_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete this reply")
    
    crud.delete_discussion_reply(db, reply_id)
    return None

# Mark reply as solution
@router.post("/replies/{reply_id}/mark-solution")
async def mark_as_solution(
    reply_id: int,
    discussion_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a reply as the accepted solution (discussion author only)"""
    discussion = crud.get_discussion(db, discussion_id)
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    # Only the discussion author can mark solutions
    if discussion.author_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only the discussion author can mark solutions")
    
    reply = crud.mark_reply_as_solution(db, reply_id, discussion_id)
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    return {"message": "Reply marked as solution", "reply_id": reply_id}

# Toggle like on discussion
@router.post("/{discussion_id}/like")
async def toggle_discussion_like(
    discussion_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle like on a discussion"""
    discussion = crud.get_discussion(db, discussion_id)
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    result = crud.toggle_discussion_like(db, discussion_id, current_user.id)
    return result

# Check discussion like status
@router.get("/{discussion_id}/like/status")
async def check_discussion_like_status(
    discussion_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if current user has liked a discussion"""
    liked = crud.check_user_liked_discussion(db, discussion_id, current_user.id)
    return {"liked": liked}

# Toggle like on reply
@router.post("/replies/{reply_id}/like")
async def toggle_reply_like(
    reply_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle like on a reply"""
    from database import DiscussionReply
    reply = db.query(DiscussionReply).filter(DiscussionReply.id == reply_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    result = crud.toggle_discussion_reply_like(db, reply_id, current_user.id)
    return result

# Get user's own discussions
@router.get("/my/posts", response_model=List[schemas.DiscussionResponse])
async def get_my_discussions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's discussions"""
    discussions = crud.get_discussions(
        db=db,
        skip=skip,
        limit=limit,
        author_id=current_user.id
    )
    return discussions