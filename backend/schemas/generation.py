from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class GenerationStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class GenerationInputType(str, Enum):
    TEXT = "text"
    AUDIO = "audio"
    WEB = "web"

class GenerationBase(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)
    template_id: Optional[int] = None
    style: Optional[str] = None

class GenerationCreate(GenerationBase):
    pass

class GenerationResponse(GenerationBase):
    id: int
    user_id: int
    input_type: GenerationInputType
    status: GenerationStatus
    image_url: Optional[str]
    thumbnail_url: Optional[str]
    credits_used: int
    processing_time: Optional[float]
    downloads: int
    shares: int
    error_message: Optional[str]
    meta: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    @validator('image_url')
    def ensure_full_url(cls, v):
        if v and v.startswith('/'):
            # In production, prepend CDN URL
            return f"https://cdn.nexusart.com.br{v}"
        return v
    
    class Config:
        from_attributes = True

class GenerationUpdate(BaseModel):
    name: Optional[str] = None
    tags: Optional[List[str]] = None

class GenerationListResponse(BaseModel):
    generations: List[GenerationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class GenerationStats(BaseModel):
    total_generations: int
    period_generations: int
    successful_generations: int
    failed_generations: int
    success_rate: float
    avg_processing_time: float
    total_credits_used: int
    input_type_stats: Dict[str, int]
    period: str

class TemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    category: str
    style: str
    prompt_template: str
    default_settings: Optional[Dict[str, Any]] = None

class TemplateCreate(TemplateBase):
    is_premium: bool = False

class TemplateResponse(TemplateBase):
    id: int
    user_id: Optional[int]
    preview_url: Optional[str]
    is_active: bool
    is_premium: bool
    is_favorite: bool
    usage_count: int
    average_rating: Optional[float]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class TemplateListResponse(BaseModel):
    templates: List[TemplateResponse]
    total: int
    categories: List[str]
    styles: List[str]