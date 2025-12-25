from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from core.database import Base

class Generation(Base):
    __tablename__ = "generations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=True)
    
    # Content
    prompt = Column(Text, nullable=False)
    input_type = Column(String(20), nullable=False)  # 'text', 'audio', 'web'
    style = Column(String(50), nullable=True)
    
    # Output
    image_url = Column(String(500), nullable=True)
    file_key = Column(String(500), nullable=True)  # Storage key
    thumbnail_url = Column(String(500), nullable=True)
    
    # Status
    status = Column(String(20), default="pending")  # pending, processing, completed, failed
    error_message = Column(Text, nullable=True)
    
    # Usage
    credits_used = Column(Integer, default=1)
    processing_time = Column(Float, nullable=True)  # in seconds
    file_size = Column(Integer, nullable=True)  # in bytes
    
    # Engagement
    downloads = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    views = Column(Integer, default=0)
    
    # Metadata (attribute named `meta` to avoid collision with SQLAlchemy internals)
    # Database column is `generation_metadata` in the existing schema, map to that name.
    meta = Column('generation_metadata', JSON, nullable=True)  # Store additional data like AI parameters
    tags = Column(JSON, nullable=True)  # Array of tags
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="generations")
    template = relationship("Template", back_populates="generations")
    whatsapp_messages = relationship("WhatsAppMessage", back_populates="generation")
    
    def __repr__(self):
        return f"<Generation {self.id} ({self.status})>"

    @property
    def metadata(self):
        """Compatibility property so Pydantic schemas expecting `metadata` can
        read the value stored in the `meta` attribute without colliding with
        SQLAlchemy's class-level `metadata` object.
        """
        return self.meta

class Template(Base):
    __tablename__ = "templates"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Null for system templates
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    
    # Template info
    category = Column(String(50), nullable=False)  # restaurant, clothing, supermarket, etc.
    style = Column(String(50), nullable=False)  # modern, elegant, fun, etc.
    preview_url = Column(String(500), nullable=True)
    
    # Content
    prompt_template = Column(Text, nullable=False)  # Template with placeholders
    default_settings = Column(JSON, nullable=True)  # Default colors, fonts, etc.
    
    # Status
    is_active = Column(Boolean, default=True)
    is_premium = Column(Boolean, default=False)
    is_favorite = Column(Boolean, default=False)
    
    # Usage
    usage_count = Column(Integer, default=0)
    average_rating = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="templates")
    generations = relationship("Generation", back_populates="template")
    
    def __repr__(self):
        return f"<Template {self.name} ({self.category})>"