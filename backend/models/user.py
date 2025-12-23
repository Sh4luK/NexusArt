from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from core.database import Base

class PlanType(enum.Enum):
    TRIAL = "trial"
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ANNUAL = "annual"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String(100))
    cpf_cnpj = Column(String(20), unique=True, index=True)
    phone = Column(String(20))
    business_name = Column(String(200))
    business_sector = Column(String(100))
    business_address = Column(Text, nullable=True)
    business_description = Column(Text, nullable=True)
    
    # Configurações da conta
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    plan_type = Column(Enum(PlanType), default=PlanType.TRIAL)
    
    # Limites e uso
    credits_used = Column(Integer, default=0)
    credits_limit = Column(Integer, default=10)  # 10 para trial
    whatsapp_numbers_limit = Column(Integer, default=1)
    
    # Dados da assinatura
    subscription_id = Column(String(100), nullable=True)
    subscription_status = Column(String(50), nullable=True)
    subscription_ends_at = Column(DateTime, nullable=True)
    trial_ends_at = Column(DateTime, nullable=True)
    
    # API Key para integração
    api_key = Column(String(100), unique=True, index=True, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    last_login_at = Column(DateTime, nullable=True)
    
    # Relacionamentos
    whatsapp_numbers = relationship("WhatsAppNumber", back_populates="user", cascade="all, delete-orphan")
    generations = relationship("Generation", back_populates="user", cascade="all, delete-orphan")
    templates = relationship("Template", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.email} ({self.plan_type.value})>"
    
    @property
    def has_active_subscription(self) -> bool:
        """Verifica se o usuário tem assinatura ativa."""
        if self.plan_type == PlanType.TRIAL:
            if self.trial_ends_at:
                from datetime import datetime
                return datetime.utcnow() < self.trial_ends_at
            return True
        
        if self.subscription_status == "active":
            return True
        
        return False
    
    @property
    def remaining_credits(self) -> int:
        """Retorna créditos restantes."""
        return max(0, self.credits_limit - self.credits_used)
    
    def can_generate(self) -> bool:
        """Verifica se o usuário pode gerar mais conteúdo."""
        return self.has_active_subscription and self.remaining_credits > 0