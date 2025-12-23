from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from core.database import Base

class WhatsAppNumber(Base):
    __tablename__ = "whatsapp_numbers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    phone_number = Column(String(20), nullable=False)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    verification_code = Column(String(6), nullable=True)
    verification_sent_at = Column(DateTime, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    
    # Twilio info
    twilio_sid = Column(String(100), nullable=True)
    twilio_status = Column(String(50), nullable=True)
    
    # Usage stats
    messages_received = Column(Integer, default=0)
    messages_sent = Column(Integer, default=0)
    last_used_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="whatsapp_numbers")
    
    def __repr__(self):
        return f"<WhatsAppNumber {self.phone_number} ({'verified' if self.is_verified else 'pending'})>"

class WhatsAppMessage(Base):
    __tablename__ = "whatsapp_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    whatsapp_number_id = Column(Integer, ForeignKey("whatsapp_numbers.id"), nullable=False)
    generation_id = Column(Integer, ForeignKey("generations.id"), nullable=True)
    
    # Message info
    message_sid = Column(String(100), nullable=True)  # Twilio SID
    direction = Column(String(10), nullable=False)  # 'inbound' or 'outbound'
    message_type = Column(String(20), nullable=False)  # 'text', 'audio', 'image', 'document'
    body = Column(Text, nullable=True)
    media_url = Column(String(500), nullable=True)
    
    # Status
    status = Column(String(20), default="received")  # received, processed, sent, delivered, failed
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    received_at = Column(DateTime, nullable=True)
    processed_at = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    whatsapp_number = relationship("WhatsAppNumber")
    generation = relationship("Generation", back_populates="whatsapp_messages")
    
    def __repr__(self):
        return f"<WhatsAppMessage {self.message_sid or self.id} ({self.direction})>"