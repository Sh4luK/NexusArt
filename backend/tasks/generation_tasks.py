from celery import shared_task
from celery.utils.log import get_task_logger
from sqlalchemy.orm import Session
import asyncio
from datetime import datetime
import requests
import io
from PIL import Image

from core.database import SessionLocal
from services.gemini_service import GeminiService
from services.storage_service import StorageService
from core.config import settings
from models.generation import Generation
from models.user import User

logger = get_task_logger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def generate_art_task(self, generation_id: int, prompt: str, user_id: int, phone_number: str = None):
    """
    Generate art from text prompt
    
    Args:
        generation_id: Generation record ID
        prompt: Text prompt for generation
        user_id: User ID
        phone_number: Optional phone number for WhatsApp notifications
    """
    db = SessionLocal()
    
    try:
        logger.info(f"Starting art generation for generation {generation_id}")
        
        # Get generation record
        generation = db.query(Generation).filter(Generation.id == generation_id).first()
        if not generation:
            logger.error(f"Generation {generation_id} not found")
            return
        
        # Get user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.error(f"User {user_id} not found")
            return
        
        # Check credits again
        if not user.can_generate():
            logger.warning(f"User {user_id} has no credits")
            generation.status = "failed"
            generation.error_message = "No credits available"
            db.commit()
            
            if phone_number:
                from tasks.transcription_tasks import send_whatsapp_message
                send_whatsapp_message.delay(
                    phone_number,
                    "❌ Seus créditos acabaram. Atualize seu plano em nexusart.com.br/plans"
                )
            return
        
        # Initialize services
        gemini_service = GeminiService(api_key=settings.GEMINI_API_KEY)
        storage_service = StorageService()
        
        # Get user's preferred style
        style = user.business_sector or "modern"
        
        # Generate enhanced prompt
        logger.info(f"Generating enhanced prompt for: {prompt[:50]}...")
        prompt_data = gemini_service.generate_promotional_image_prompt(
            user_prompt=prompt,
            business_type=style,
            style=style
        )
        
        # Update generation with prompt data
        generation.metadata = {
            **generation.metadata,
            "prompt_data": prompt_data,
            "generation_started_at": datetime.utcnow().isoformat()
        }
        db.commit()
        
        # Generate image (using mock for now - replace with actual AI image generation)
        logger.info("Generating image...")
        image_url = generate_mock_image(prompt_data, user.business_name or "Seu Negócio")
        
        # Download and optimize image
        image_data = download_image(image_url)
        if not image_data:
            raise Exception("Failed to download generated image")
        
        # Optimize for WhatsApp
        optimized_image = storage_service.optimize_image(image_data)
        
        # Upload to storage
        file_url, file_key = storage_service.upload_image(
            image_data=optimized_image,
            user_id=user_id,
            content_type="image/jpeg"
        )
        
        # Update generation record
        generation.status = "completed"
        generation.image_url = file_url
        generation.file_key = file_key
        generation.credits_used = 1
        generation.completed_at = datetime.utcnow()
        generation.metadata = {
            **generation.metadata,
            "generation_completed_at": datetime.utcnow().isoformat(),
            "image_specs": {
                "url": file_url,
                "key": file_key,
                "size": len(optimized_image)
            }
        }
        
        # Update user credits
        user.credits_used += 1
        user.updated_at = datetime.utcnow()
        
        db.commit()
        
        logger.info(f"Art generation completed for generation {generation.id}")
        
        # Send WhatsApp notification if phone number provided
        if phone_number:
            from tasks.transcription_tasks import send_whatsapp_message
            
            # Send success message
            send_whatsapp_message.delay(
                phone_number,
                f"✅ Sua arte está pronta!\n\n📝 *Sua promoção:*\n{prompt}\n\n"
                f"🖼️ *Arte gerada:*\n{file_url}\n\n"
                f"💡 Créditos restantes: {user.remaining_credits}"
            )
            
            # Try to send image (Twilio sandbox may have limitations)
            try:
                # In production, use Twilio Media API
                pass
            except:
                pass
        
    except Exception as exc:
        logger.error(f"Error in generate_art_task: {exc}")
        
        # Update generation as failed
        try:
            generation = db.query(Generation).filter(Generation.id == generation_id).first()
            if generation:
                generation.status = "failed"
                generation.error_message = str(exc)
                generation.credits_used = 0
                db.commit()
        except:
            pass
        
        # Send error notification
        if phone_number:
            from tasks.transcription_tasks import send_whatsapp_message
            send_whatsapp_message.delay(
                phone_number,
                "❌ Ocorreu um erro ao gerar sua arte. Tente novamente com um texto mais claro."
            )
        
        # Retry the task
        raise self.retry(exc=exc)
    
    finally:
        db.close()

def generate_mock_image(prompt_data: dict, business_name: str) -> str:
    """
    Generate a mock image URL (replace with actual AI image generation)
    
    Args:
        prompt_data: Enhanced prompt data
        business_name: Business name for the image
    
    Returns:
        Image URL
    """
    # This is a mock function - replace with actual AI image generation
    
    # For now, use a placeholder service or generate simple image
    # In production, integrate with Stable Diffusion, DALL-E, or similar
    
    # Example using placeholder.com
    import urllib.parse
    
    # Create text for image
    text = f"{business_name}\nPromoção Especial"
    encoded_text = urllib.parse.quote(text)
    
    # Create mock image URL
    colors = {
        "restaurant": "FF6B35,FFE66D",  # Orange/Yellow
        "supermarket": "2A9D8F,264653",  # Teal/Blue
        "clothing": "E63946,F1FAEE",     # Red/White
        "beauty": "FFAFCC,CDB4DB",       # Pink/Purple
        "services": "3A86FF,8338EC",     # Blue/Purple
    }
    
    business_type = prompt_data.get("business_type", "services")
    color_gradient = colors.get(business_type, colors["services"])
    
    image_url = (
        f"https://placehold.co/1080x1080/{color_gradient}/FFFFFF.png?"
        f"text={encoded_text}&"
        f"font=montserrat"
    )
    
    return image_url

def download_image(url: str) -> Optional[bytes]:
    """
    Download image from URL
    
    Args:
        url: Image URL
    
    Returns:
        Image bytes or None
    """
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        return response.content
        
    except Exception as e:
        logger.error(f"Failed to download image {url}: {e}")
        return None

@shared_task
def batch_generate_art(prompts: list, user_id: int):
    """
    Batch generate multiple arts
    
    Args:
        prompts: List of prompts
        user_id: User ID
    """
    for i, prompt in enumerate(prompts):
        # Add delay between generations to avoid rate limiting
        generate_art_task.apply_async(
            args=[None, prompt, user_id],
            countdown=i * 5  # 5 seconds between each
        )
    
    logger.info(f"Scheduled {len(prompts)} batch generations for user {user_id}")