from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List

import crud
import schemas
from database import get_db, User
from routes.auth_routes import get_current_user

router = APIRouter(prefix="/blogs", tags=["Blogs"])

@router.get("", response_model=List[schemas.BlogResponse])
async def get_blogs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category: Optional[schemas.BlogCategory] = None,
    author_id: Optional[int] = None,
    is_featured: Optional[bool] = None,
    status: Optional[schemas.BlogStatus] = None,
    db: Session = Depends(get_db)
):
    """Get all blogs with optional filters"""
    blogs = crud.get_blogs(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        category=category,
        author_id=author_id,
        is_featured=is_featured,
        status=status
    )
    return blogs

@router.get("/{blog_id}", response_model=schemas.BlogResponse)
async def get_blog(
    blog_id: int,
    db: Session = Depends(get_db)
):
    """Get blog by ID and increment view count"""
    blog = crud.increment_blog_views(db, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog

@router.get("/slug/{slug}", response_model=schemas.BlogResponse)
async def get_blog_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """Get blog by slug"""
    blog = crud.get_blog_by_slug(db, slug)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Increment view count
    crud.increment_blog_views(db, blog.id)
    return blog

@router.post("", response_model=schemas.BlogResponse)
async def create_blog(
    blog: schemas.BlogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new blog post (authenticated users only)"""
    new_blog = crud.create_blog(db=db, blog=blog, author_id=current_user.id)
    return new_blog

@router.put("/{blog_id}", response_model=schemas.BlogResponse)
async def update_blog(
    blog_id: int,
    blog_update: schemas.BlogUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a blog post (author or admin only)"""
    blog = crud.get_blog_by_id(db, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Check if user is author or admin
    if blog.author_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to update this blog")
    
    updated_blog = crud.update_blog(db, blog_id, blog_update)
    return updated_blog

@router.delete("/{blog_id}")
async def delete_blog(
    blog_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a blog post (author or admin only)"""
    blog = crud.get_blog_by_id(db, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Check if user is author or admin
    if blog.author_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete this blog")
    
    crud.delete_blog(db, blog_id)
    return {"message": "Blog deleted successfully"}

# Blog Comments Endpoints

@router.get("/{blog_id}/comments", response_model=List[schemas.BlogCommentResponse])
async def get_blog_comments(
    blog_id: int,
    db: Session = Depends(get_db)
):
    """Get all comments for a blog"""
    comments = crud.get_blog_comments(db, blog_id)
    return comments

@router.post("/{blog_id}/comments", response_model=schemas.BlogCommentResponse)
async def create_comment(
    blog_id: int,
    comment: schemas.BlogCommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a comment on a blog"""
    # Verify blog exists
    blog = crud.get_blog_by_id(db, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Create comment
    new_comment = crud.create_blog_comment(
        db=db,
        comment=comment,
        author_id=current_user.id
    )
    return new_comment

@router.put("/comments/{comment_id}", response_model=schemas.BlogCommentResponse)
async def update_comment(
    comment_id: int,
    comment_update: schemas.BlogCommentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a comment (author only)"""
    comment = crud.get_comment_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user is author
    if comment.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this comment")
    
    updated_comment = crud.update_blog_comment(db, comment_id, comment_update)
    return updated_comment

@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a comment (author or admin only)"""
    comment = crud.get_comment_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user is author or admin
    if comment.author_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    crud.delete_blog_comment(db, comment_id)
    return {"message": "Comment deleted successfully"}

# Blog Likes Endpoints

@router.post("/{blog_id}/like")
async def toggle_blog_like(
    blog_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle like on a blog post"""
    blog = crud.get_blog_by_id(db, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    result = crud.toggle_blog_like(db, blog_id, current_user.id)
    return result

@router.get("/{blog_id}/like/status")
async def check_blog_like_status(
    blog_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if current user has liked a blog"""
    liked = crud.check_user_liked_blog(db, blog_id, current_user.id)
    return {"liked": liked}

@router.post("/comments/{comment_id}/like")
async def toggle_comment_like(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle like on a comment"""
    comment = crud.get_comment_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    result = crud.toggle_comment_like(db, comment_id, current_user.id)
    return result

@router.get("/comments/{comment_id}/like/status")
async def check_comment_like_status(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if current user has liked a comment"""
    liked = crud.check_user_liked_comment(db, comment_id, current_user.id)
    return {"liked": liked}

# Get user's own blogs
@router.get("/my/posts", response_model=List[schemas.BlogResponse])
async def get_my_blogs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's blogs"""
    blogs = crud.get_blogs(
        db=db,
        skip=skip,
        limit=limit,
        author_id=current_user.id,
        status=None  # Show all statuses for own blogs
    )
    return blogs