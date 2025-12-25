from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class PlanType(str, Enum):
    TRIAL = "trial"
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ANNUAL = "annual"

# Base
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    business_name: Optional[str] = Field(None, max_length=200)
    business_sector: Optional[str] = Field(None, max_length=100)

# Create
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str = Field(..., min_length=8, max_length=100)
    cpf_cnpj: str = Field(..., max_length=20)
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('As senhas não coincidem')
        return v
    
    @validator('cpf_cnpj')
    def validate_cpf_cnpj(cls, v):
        # Remover caracteres não numéricos
        numbers = ''.join(filter(str.isdigit, v))
        
        if len(numbers) == 11:  # CPF
            # Validação básica de CPF
            if len(set(numbers)) == 1:  # Todos dígitos iguais
                raise ValueError('CPF inválido')
        elif len(numbers) == 14:  # CNPJ
            # Validação básica de CNPJ
            if len(set(numbers)) == 1:  # Todos dígitos iguais
                raise ValueError('CNPJ inválido')
        else:
            raise ValueError('CPF/CNPJ deve ter 11 ou 14 dígitos')
        
        return numbers

# Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Update
class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    business_name: Optional[str] = Field(None, max_length=200)
    business_sector: Optional[str] = Field(None, max_length=100)
    business_address: Optional[str] = None
    business_description: Optional[str] = None

# Response
class UserResponse(UserBase):
    id: int
    cpf_cnpj: Optional[str] = None
    business_sector: Optional[str]
    plan_type: PlanType
    credits_used: int
    credits_limit: int
    remaining_credits: int
    is_active: bool
    is_verified: bool
    has_active_subscription: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Token
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Stats
class UserStats(BaseModel):
    total_generations: int
    generations_today: int
    generations_this_month: int
    whatsapp_numbers_count: int
    templates_count: int

# List
class UserList(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    page_size: int