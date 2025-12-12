from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List
from sqlalchemy.orm import Session

import crud
from database import get_db
from services.auth_service import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/blog-views")
async def top_blog_views(limit: int = Query(5, ge=1, le=50), db: Session = Depends(get_db)):
    """Return top blogs by views_count"""
    blogs = crud.get_top_blogs(db, limit=limit)
    # Convert ORM objects to serializable dicts (FastAPI will handle Pydantic models elsewhere)
    result = []
    for b in blogs:
        result.append({
            'id': b.id,
            'title': b.title,
            'slug': b.slug,
            'views_count': b.views_count,
            'likes_count': b.likes_count,
            'comments_count': b.comments_count,
            'author_id': b.author_id,
            'created_at': b.created_at,
        })
    return result


@router.get("/competitions")
async def competition_metrics(limit: int = Query(5, ge=1, le=50), db: Session = Depends(get_db)):
    """Return competition-like events and simple metrics"""
    metrics = crud.get_competition_metrics(db, limit=limit)
    return metrics


@router.get("/blog-timeseries")
async def blog_timeseries(days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db)):
    """Return per-day published blog counts (best-effort)"""
    series = crud.get_blog_timeseries(db, days=days)
    return series


@router.get("/competition-timeseries")
async def competition_timeseries(days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db)):
    """Return per-day registration counts for competition-like events"""
    series = crud.get_competition_timeseries(db, days=days)
    return series


@router.get("/competition-rank")
async def competition_rank(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Return the authenticated user's competition participation and rank."""
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    stats = crud.get_user_competition_rank(db, current_user.id)
    return {"data": stats}


@router.get("/engagement-timeseries")
async def engagement_timeseries(days: int = Query(14, ge=1, le=365), db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Return per-day engagement score for the authenticated user."""
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    series = crud.get_user_engagement_timeseries(db, current_user.id, days=days)
    return series
