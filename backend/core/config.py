from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # App
    APP_NAME: str = "NexusArt"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Database
    DATABASE_URL: str = "postgresql://localhost/nexusart"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # APIs
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    
    # AWS S3
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "sa-east-1"
    AWS_S3_BUCKET: str = "nexusart-media"
    
    # Stripe
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    # Whisper
    WHISPER_MODEL: str = "base"
    
    # Paths
    UPLOAD_DIR: str = "uploads"
    
    @property
    def absolute_upload_dir(self):
        """Retorna o caminho absoluto da pasta de uploads"""
        return os.path.join(os.path.dirname(os.path.dirname(__file__)), self.UPLOAD_DIR)
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()