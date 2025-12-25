from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, timedelta
import io

from core.database import get_db
from core.security import get_current_user
from models.user import User
from models.generation import Generation
from schemas.generation import (
    GenerationCreate,
    GenerationResponse,
    GenerationListResponse,
    GenerationStats
)

router = APIRouter()

@router.post("/", response_model=GenerationResponse, status_code=status.HTTP_201_CREATED)
async def create_generation(
    data: GenerationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new generation manually (via web dashboard)
    """
    user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user has credits
    if not user.can_generate():
        raise HTTPException(
            status_code=400,
            detail="No credits available. Please upgrade your plan."
        )
    
    # Generate art
    from services.gemini_service import GeminiService
    from core.config import settings
    
    try:
        gemini_service = GeminiService(api_key=settings.GEMINI_API_KEY)
        
        # Get user's preferred style
        style = user.business_sector or "modern"
        
        # Generate image (mock for now)
        result = gemini_service.generate_promotional_image(
            prompt=data.prompt,
            business_type=style,
            template_type=data.template_id
        )
        
        # Create generation record
        generation = Generation(
            user_id=user.id,
            prompt=data.prompt,
            input_type="web",
            status="completed",
            image_url=result["image_url"],
            template_id=data.template_id,
            style=style,
            credits_used=1,
            meta=result
        )
        
        db.add(generation)
        
        # Update user credits
        user.credits_used += 1
        user.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(generation)
        
        return GenerationResponse.from_orm(generation)
        
    except Exception as e:
        # Create failed generation record
        generation = Generation(
            user_id=user.id,
            prompt=data.prompt,
            input_type="web",
            status="failed",
            error_message=str(e),
            credits_used=0
        )
        db.add(generation)
        db.commit()
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate art: {str(e)}"
        )

@router.get("/", response_model=GenerationListResponse)
async def get_generations(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """
    Get user's generations with pagination and filters
    """
    user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    query = db.query(Generation).filter(Generation.user_id == user.id)
    
    # Apply filters
    if status_filter:
        query = query.filter(Generation.status == status_filter)
    
    if search:
        query = query.filter(
            (Generation.prompt.ilike(f"%{search}%")) |
            (Generation.id == search if search.isdigit() else False)
        )
    
    if start_date:
        try:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(Generation.created_at >= start)
        except ValueError:
            pass
    
    if end_date:
        try:
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(Generation.created_at <= end)
        except ValueError:
            pass
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    generations = query.order_by(Generation.created_at.desc()).offset(offset).limit(limit).all()
    
    return GenerationListResponse(
        generations=[GenerationResponse.from_orm(g) for g in generations],
        total=total,
        page=page,
        page_size=limit,
        total_pages=(total + limit - 1) // limit
    )

@router.get("/{generation_id}", response_model=GenerationResponse)
async def get_generation(
    generation_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific generation
    """
    generation = db.query(Generation).filter(
        Generation.id == generation_id,
        Generation.user_id == current_user.get("user_id")
    ).first()
    
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")
    
    return GenerationResponse.from_orm(generation)

@router.get("/{generation_id}/download")
async def download_generation(
    generation_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download generation image
    """
    generation = db.query(Generation).filter(
        Generation.id == generation_id,
        Generation.user_id == current_user.get("user_id"),
        Generation.status == "completed"
    ).first()
    
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found or not completed")
    
    if not generation.image_url:
        raise HTTPException(status_code=404, detail="Image not available")
    
    # In production, download from S3/CDN
    # For now, return the URL
    return {"url": generation.image_url}

@router.post("/{generation_id}/share")
async def share_generation(
    generation_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a shareable link for a generation
    """
    generation = db.query(Generation).filter(
        Generation.id == generation_id,
        Generation.user_id == current_user.get("user_id"),
        Generation.status == "completed"
    ).first()
    
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")
    
    # Increment share count
    generation.shares = (generation.shares or 0) + 1
    db.commit()
    
    # Generate shareable link
    share_token = "mock_share_token"  # In production, generate JWT
    share_url = f"https://nexusart.com.br/share/{share_token}"
    
    return {
        "share_url": share_url,
        "share_count": generation.shares
    }

@router.delete("/{generation_id}")
async def delete_generation(
    generation_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a generation
    """
    generation = db.query(Generation).filter(
        Generation.id == generation_id,
        Generation.user_id == current_user.get("user_id")
    ).first()
    
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")
    
    db.delete(generation)
    db.commit()
    
    return {"success": True, "message": "Generation deleted"}

@router.get("/stats/summary", response_model=GenerationStats)
async def get_generation_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    period: str = Query("month", regex="^(day|week|month|year)$")
):
    """
    Get generation statistics for the user
    """
    user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    now = datetime.utcnow()
    
    # Calculate time range
    if period == "day":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        start_date = now - timedelta(days=now.weekday())
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "month":
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    else:  # year
        start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Query stats
    total_generations = db.query(Generation).filter(
        Generation.user_id == user.id
    ).count()
    
    period_generations = db.query(Generation).filter(
        Generation.user_id == user.id,
        Generation.created_at >= start_date
    ).count()
    
    successful_generations = db.query(Generation).filter(
        Generation.user_id == user.id,
        Generation.status == "completed"
    ).count()
    
    failed_generations = db.query(Generation).filter(
        Generation.user_id == user.id,
        Generation.status == "failed"
    ).count()
    
    # Average processing time (mock for now)
    avg_processing_time = 5.2
    
    # Credits used
    total_credits_used = db.query(db.func.sum(Generation.credits_used)).filter(
        Generation.user_id == user.id
    ).scalar() or 0
    
    # Most used input type
    input_type_stats = db.query(
        Generation.input_type,
        db.func.count(Generation.id).label('count')
    ).filter(
        Generation.user_id == user.id
    ).group_by(Generation.input_type).all()
    
    return GenerationStats(
        total_generations=total_generations,
        period_generations=period_generations,
        successful_generations=successful_generations,
        failed_generations=failed_generations,
        success_rate=(
            (successful_generations / total_generations * 100) 
            if total_generations > 0 else 0
        ),
        avg_processing_time=avg_processing_time,
        total_credits_used=total_credits_used,
        input_type_stats={it: count for it, count in input_type_stats},
        period=period
    )