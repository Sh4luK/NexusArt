from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class PlanType(str, Enum):
    TRIAL = "trial"
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ANNUAL = "annual"

class BillingCycle(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"

class PlanResponse(BaseModel):
    id: str
    name: str
    description: str
    price_monthly: float
    price_yearly: float
    features: List[str]
    limits: Dict[str, Any]
    
    @validator('price_monthly', 'price_yearly')
    def format_price(cls, v):
        return round(v, 2)

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    TRIAL = "trial"

class SubscriptionResponse(BaseModel):
    plan_type: PlanType
    status: SubscriptionStatus
    current_period_end: Optional[datetime]
    trial_end: Optional[datetime]
    credits_used: int
    credits_limit: int
    plan_details: Optional[Dict[str, Any]] = None
    client_secret: Optional[str] = None
    
    class Config:
        from_attributes = True

class CreateSubscriptionRequest(BaseModel):
    plan_id: str = Field(..., regex="^(basic_monthly|professional_monthly|annual_professional)$")
    billing_cycle: BillingCycle = BillingCycle.MONTHLY
    payment_method_id: Optional[str] = None  # For Stripe

class UpdatePaymentMethodRequest(BaseModel):
    payment_method_id: str

class InvoiceResponse(BaseModel):
    id: str
    amount: float
    currency: str
    status: str
    created_at: datetime
    invoice_url: Optional[str]
    
    class Config:
        from_attributes = True

class CreditPurchaseRequest(BaseModel):
    amount: int = Field(..., ge=1, le=1000)
    payment_method_id: str

class CreditPurchaseResponse(BaseModel):
    success: bool
    credits_added: int
    total_credits: int
    client_secret: Optional[str] = None

class SubscriptionHistory(BaseModel):
    plan_type: PlanType
    status: SubscriptionStatus
    started_at: datetime
    ended_at: Optional[datetime]
    amount: Optional[float]