from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class WhatsAppNumberStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    INACTIVE = "inactive"

class WhatsAppNumberBase(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=20)

class WhatsAppNumberCreate(WhatsAppNumberBase):
    pass

class WhatsAppNumberResponse(WhatsAppNumberBase):
    id: int
    user_id: int
    is_verified: bool
    is_active: bool
    status: WhatsAppNumberStatus
    messages_received: int
    messages_sent: int
    last_used_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    
    @validator('phone_number')
    def format_phone_number(cls, v):
        # Format phone number for display
        v = ''.join(filter(str.isdigit, v))
        if len(v) == 11:  # Brazilian cell phone
            return f"({v[:2]}) {v[2:7]}-{v[7:]}"
        elif len(v) == 10:  # Brazilian landline
            return f"({v[:2]}) {v[2:6]}-{v[6:]}"
        return v
    
    class Config:
        from_attributes = True

class WhatsAppMessageBase(BaseModel):
    direction: str
    message_type: str
    body: Optional[str] = None
    media_url: Optional[str] = None

class WhatsAppMessageResponse(WhatsAppMessageBase):
    id: int
    whatsapp_number_id: int
    generation_id: Optional[int]
    message_sid: Optional[str]
    status: str
    received_at: Optional[datetime]
    processed_at: Optional[datetime]
    sent_at: Optional[datetime]
    delivered_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class WhatsAppTestRequest(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=20)
    message: str = Field(..., min_length=1, max_length=1000)

class WhatsAppWebhookRequest(BaseModel):
    From: str
    Body: Optional[str] = None
    MediaUrl0: Optional[str] = None
    NumMedia: Optional[int] = 0
    MessageSid: str
    AccountSid: str

class WhatsAppNumberList(BaseModel):
    numbers: List[WhatsAppNumberResponse]
    total: int
    active_count: int
    verified_count: int

class WhatsAppStats(BaseModel):
    total_messages_received: int
    total_messages_sent: int
    messages_today: int
    messages_this_week: int
    messages_this_month: int
    avg_response_time: float  # in seconds
    most_active_number: Optional[str]

# Backwards-compatible alias expected by some routes
WhatsAppMessage = WhatsAppMessageResponse