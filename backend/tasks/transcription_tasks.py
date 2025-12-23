from celery import shared_task
from celery.utils.log import get_task_logger
from sqlalchemy.orm import Session
import aiohttp
import asyncio
from datetime import datetime
from typing import Optional

from core.database import SessionLocal
from services.audio_processor import AudioProcessor
from services.gemini_service import GeminiService
from services.storage_service import StorageService
from core.config import settings
from models.generation import Generation
from models.user import User

logger = get_task_logger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def transcribe_audio_task(self, audio_url: str, user_id: int, phone_number: str):
    """
    Transcribe audio from WhatsApp and generate art
    
    Args:
        audio_url: URL of the audio file from Twilio
        user_id: User ID
        phone_number: User's phone number for sending result
    """
    db = SessionLocal()
    
    try:
        logger.info(f"Starting audio transcription for user {user_id}")
        
        # Get user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.error(f"User {user_id} not found")
            return
        
        # Check credits
        if not user.can_generate():
            logger.warning(f"User {user_id} has no credits")
            # Send WhatsApp message about no credits
            send_whatsapp_message.delay(
                phone_number,
                "❌ Seus créditos acabaram. Atualize seu plano em nexusart.com.br/plans"
            )
            return
        
        # Download audio file
        logger.info(f"Downloading audio from {audio_url}")
        audio_data = download_file(audio_url)
        
        if not audio_data:
            raise Exception("Failed to download audio file")
        
        # Transcribe audio
        audio_processor = AudioProcessor(model_size=settings.WHISPER_MODEL)
        
        # Validate audio
        is_valid = audio_processor.validate_audio(audio_data)
        if not is_valid:
            raise Exception("Invalid audio file")
        
        # Get audio info
        audio_info = audio_processor.get_audio_info(audio_data)
        logger.info(f"Audio info: {audio_info}")
        
        # Transcribe
        transcription, metadata = audio_processor.transcribe_audio(audio_data)
        logger.info(f"Transcription completed: {transcription[:100]}...")
        
        # Create generation record
        generation = Generation(
            user_id=user_id,
            prompt=transcription,
            input_type="audio",
            status="processing",
            metadata={
                "audio_info": audio_info,
                "transcription_metadata": metadata
            }
        )
        db.add(generation)
        db.commit()
        db.refresh(generation)
        
        # Send processing message
        send_whatsapp_message.delay(
            phone_number,
            f"✅ Áudio transcrito com sucesso!\n\n📝 *Transcrição:*\n{transcription}\n\n⚡ Gerando arte..."
        )
        
        # Generate art from transcription
        generate_art_task.delay(
            generation_id=generation.id,
            prompt=transcription,
            user_id=user_id,
            phone_number=phone_number
        )
        
        logger.info(f"Audio transcription task completed for generation {generation.id}")
        
    except Exception as exc:
        logger.error(f"Error in transcribe_audio_task: {exc}")
        
        # Update generation as failed
        try:
            generation = Generation(
                user_id=user_id,
                prompt="Audio transcription",
                input_type="audio",
                status="failed",
                error_message=str(exc),
                credits_used=0
            )
            db.add(generation)
            db.commit()
        except:
            pass
        
        # Send error message
        send_whatsapp_message.delay(
            phone_number,
            "❌ Ocorreu um erro ao processar seu áudio. Tente novamente ou envie um texto."
        )
        
        # Retry the task
        raise self.retry(exc=exc)
    
    finally:
        db.close()

def download_file(url: str) -> Optional[bytes]:
    """
    Download file from URL
    
    Args:
        url: File URL
    
    Returns:
        File bytes or None
    """
    try:
        import requests
        
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        return response.content
        
    except Exception as e:
        logger.error(f"Failed to download file {url}: {e}")
        return None

@shared_task
def send_whatsapp_message(phone_number: str, message: str):
    """
    Send WhatsApp message using Twilio
    
    Args:
        phone_number: Recipient phone number
        message: Message text
    """
    try:
        from twilio.rest import Client
        
        if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN]):
            logger.warning("Twilio not configured, skipping WhatsApp message")
            return
        
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        message = client.messages.create(
            body=message,
            from_='whatsapp:+14155238886',
            to=f'whatsapp:{phone_number}'
        )
        
        logger.info(f"WhatsApp message sent to {phone_number}: {message.sid}")
        
    except Exception as e:
        logger.error(f"Failed to send WhatsApp message: {e}")