from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from twilio.rest import Client
from twilio.request_validator import RequestValidator

from core.database import get_db
from core.security import get_current_user
from core.config import settings
from models.user import User
from schemas.whatsapp import (
    WhatsAppNumberCreate, 
    WhatsAppNumberResponse,
    WhatsAppMessage,
    WhatsAppTestRequest
)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Initialize Twilio client
twilio_client = None
if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
    twilio_client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

@router.post("/connect", response_model=WhatsAppNumberResponse)
async def connect_whatsapp_number(
    data: WhatsAppNumberCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Connect a WhatsApp number to the user's account
    """
    user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user has reached WhatsApp number limit
    current_numbers_count = len(user.whatsapp_numbers)
    if current_numbers_count >= user.whatsapp_numbers_limit:
        raise HTTPException(
            status_code=400,
            detail=f"You can only connect {user.whatsapp_numbers_limit} WhatsApp numbers"
        )
    
    # Validate phone number format
    phone_number = data.phone_number
    if not phone_number.startswith("+"):
        phone_number = f"+55{phone_number}"  # Default to Brazil
    
    # Check if number already exists
    from models.whatsapp import WhatsAppNumber
    existing_number = db.query(WhatsAppNumber).filter(
        WhatsAppNumber.phone_number == phone_number
    ).first()
    
    if existing_number:
        raise HTTPException(
            status_code=400,
            detail="This WhatsApp number is already connected to another account"
        )
    
    # Create WhatsApp number record
    whatsapp_number = WhatsAppNumber(
        user_id=user.id,
        phone_number=phone_number,
        is_verified=False,
        is_active=True
    )
    
    db.add(whatsapp_number)
    db.commit()
    db.refresh(whatsapp_number)
    
    # Send verification code via WhatsApp
    if twilio_client:
        try:
            message = twilio_client.messages.create(
                body=f"Seu código de verificação NexusArt é: 123456\n\nUse este código para verificar seu número.",
                from_='whatsapp:+14155238886',  # Twilio sandbox number
                to=f'whatsapp:{phone_number}'
            )
            # Store verification code (in production, store securely)
            whatsapp_number.verification_code = "123456"  # Mock code
            whatsapp_number.verification_sent_at = datetime.utcnow()
            db.commit()
        except Exception as e:
            # Log error but don't fail - number still saved
            print(f"Failed to send WhatsApp message: {e}")
    
    return WhatsAppNumberResponse.from_orm(whatsapp_number)

@router.post("/webhook")
async def whatsapp_webhook(
    background_tasks: BackgroundTasks,
    request: Request,
    From: str = Form(None),
    Body: str = Form(None),
    MediaUrl0: str = Form(None),
    NumMedia: int = Form(0)
):
    """
    Webhook endpoint for receiving WhatsApp messages from Twilio
    """
    # Validate Twilio signature
    validator = RequestValidator(settings.TWILIO_AUTH_TOKEN)
    
    # Get the full URL
    url = str(request.url)
    signature = request.headers.get('X-Twilio-Signature', '')
    
    # Get POST parameters
    params = await request.form()
    
    if not validator.validate(url, params, signature):
        raise HTTPException(status_code=403, detail="Invalid signature")
    
    # Find user by phone number
    from models.whatsapp import WhatsAppNumber
    db = next(get_db())
    
    whatsapp_number = db.query(WhatsAppNumber).filter(
        WhatsAppNumber.phone_number == From,
        WhatsAppNumber.is_active == True,
        WhatsAppNumber.is_verified == True
    ).first()
    
    if not whatsapp_number:
        # Number not registered, send welcome message
        if twilio_client:
            try:
                twilio_client.messages.create(
                    body="Olá! Para usar o NexusArt, primeiro registre-se em nexusart.com.br",
                    from_='whatsapp:+14155238886',
                    to=From
                )
            except:
                pass
        return {"status": "number_not_registered"}
    
    # Check if user has credits
    user = whatsapp_number.user
    if not user.can_generate():
        if twilio_client:
            try:
                twilio_client.messages.create(
                    body="❌ Seus créditos acabaram. Atualize seu plano em nexusart.com.br/plans",
                    from_='whatsapp:+14155238886',
                    to=From
                )
            except:
                pass
        return {"status": "no_credits"}
    
    # Process message
    if NumMedia > 0 and MediaUrl0:
        # Audio message
        background_tasks.add_task(
            process_audio_message,
            MediaUrl0,
            user.id,
            From
        )
        response_message = "🎤 Processando seu áudio... Em segundos você receberá a arte!"
    elif Body:
        # Text message
        if Body.strip().lower() in ["menu", "ajuda", "help"]:
            # Send help menu
            help_message = """
🤖 *NexusArt - Menu de Ajuda*

📱 *Como usar:*
1. Digite ou grave um áudio com sua promoção
2. Receba a arte pronta em segundos
3. Compartilhe com seus clientes

⚡ *Comandos rápidos:*
• *menu* - Ver este menu
• *creditos* - Ver créditos restantes
• *plano* - Ver seu plano atual

💡 *Dica:* Grave áudios para ser mais rápido!
"""
            if twilio_client:
                twilio_client.messages.create(
                    body=help_message,
                    from_='whatsapp:+14155238886',
                    to=From
                )
            return {"status": "help_sent"}
        elif Body.strip().lower() in ["creditos", "créditos"]:
            # Send credits info
            credits_message = f"""
💰 *Seus Créditos*

• Usados: {user.credits_used}
• Limite: {user.credits_limit}
• Restantes: {user.remaining_credits}

Plano: {user.plan_type.value.capitalize()}
"""
            if twilio_client:
                twilio_client.messages.create(
                    body=credits_message,
                    from_='whatsapp:+14155238886',
                    to=From
                )
            return {"status": "credits_sent"}
        else:
            # Process text for generation
            background_tasks.add_task(
                process_text_message,
                Body,
                user.id,
                From
            )
            response_message = "✍️ Processando sua mensagem... Arte chegando em instantes!"
    
    # Send immediate response
    if twilio_client and 'response_message' in locals():
        try:
            twilio_client.messages.create(
                body=response_message,
                from_='whatsapp:+14155238886',
                to=From
            )
        except Exception as e:
            print(f"Failed to send response: {e}")
    
    return {"status": "processing"}

@router.get("/numbers", response_model=List[WhatsAppNumberResponse])
async def get_whatsapp_numbers(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all WhatsApp numbers connected to user's account
    """
    user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return [WhatsAppNumberResponse.from_orm(num) for num in user.whatsapp_numbers]

@router.post("/test")
async def send_test_message(
    data: WhatsAppTestRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a test WhatsApp message
    """
    if not twilio_client:
        raise HTTPException(status_code=503, detail="WhatsApp service not configured")
    
    user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        message = twilio_client.messages.create(
            body=data.message,
            from_='whatsapp:+14155238886',
            to=f'whatsapp:{data.phone_number}'
        )
        
        return {
            "success": True,
            "message_sid": message.sid,
            "status": message.status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

@router.delete("/numbers/{number_id}")
async def disconnect_whatsapp_number(
    number_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Disconnect a WhatsApp number
    """
    from models.whatsapp import WhatsAppNumber
    
    whatsapp_number = db.query(WhatsAppNumber).filter(
        WhatsAppNumber.id == number_id,
        WhatsAppNumber.user_id == current_user.get("user_id")
    ).first()
    
    if not whatsapp_number:
        raise HTTPException(status_code=404, detail="WhatsApp number not found")
    
    # Check if this is the last number (user must have at least one)
    user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    if len(user.whatsapp_numbers) <= 1:
        raise HTTPException(
            status_code=400,
            detail="You must have at least one WhatsApp number connected"
        )
    
    db.delete(whatsapp_number)
    db.commit()
    
    return {"success": True, "message": "WhatsApp number disconnected"}

# Background task functions
async def process_audio_message(audio_url: str, user_id: int, from_number: str):
    """
    Process audio message and generate art
    """
    db = next(get_db())
    
    try:
        # Download audio file
        import aiohttp
        import asyncio
        
        async with aiohttp.ClientSession() as session:
            async with session.get(audio_url) as response:
                audio_data = await response.read()
        
        # Transcribe audio using Whisper
        from services.audio_processor import AudioProcessor
        audio_processor = AudioProcessor(model_size=settings.WHISPER_MODEL)
        transcription = audio_processor.transcribe_audio(audio_data)
        
        # Generate art using transcription
        await generate_and_send_art(transcription, user_id, from_number, "audio", db)
        
    except Exception as e:
        print(f"Error processing audio: {e}")
        # Send error message
        if twilio_client:
            try:
                twilio_client.messages.create(
                    body="❌ Ocorreu um erro ao processar seu áudio. Tente novamente ou envie um texto.",
                    from_='whatsapp:+14155238886',
                    to=from_number
                )
            except:
                pass

async def process_text_message(text: str, user_id: int, from_number: str):
    """
    Process text message and generate art
    """
    db = next(get_db())
    
    try:
        await generate_and_send_art(text, user_id, from_number, "text", db)
    except Exception as e:
        print(f"Error processing text: {e}")
        if twilio_client:
            try:
                twilio_client.messages.create(
                    body="❌ Ocorreu um erro ao processar sua mensagem. Tente novamente.",
                    from_='whatsapp:+14155238886',
                    to=from_number
                )
            except:
                pass

async def generate_and_send_art(
    prompt: str, 
    user_id: int, 
    phone_number: str,
    input_type: str,
    db: Session
):
    """
    Generate art and send via WhatsApp
    """
    from services.gemini_service import GeminiService
    from models.generation import Generation
    from datetime import datetime
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return
    
    # Check credits again (in case changed during processing)
    if not user.can_generate():
        if twilio_client:
            twilio_client.messages.create(
                body="❌ Seus créditos acabaram. Atualize seu plano em nexusart.com.br/plans",
                from_='whatsapp:+14155238886',
                to=phone_number
            )
        return
    
    try:
        # Generate art using Gemini
        gemini_service = GeminiService(api_key=settings.GEMINI_API_KEY)
        
        # For now, mock the image generation
        # In production, integrate with actual image generation API
        image_url = f"https://via.placeholder.com/800x800/3b82f6/ffffff?text={prompt[:30]}"
        
        # Create generation record
        generation = Generation(
            user_id=user.id,
            prompt=prompt,
            input_type=input_type,
            status="completed",
            image_url=image_url,
            credits_used=1
        )
        
        db.add(generation)
        
        # Update user credits
        user.credits_used += 1
        user.updated_at = datetime.utcnow()
        
        db.commit()
        
        # Send image via WhatsApp
        if twilio_client:
            # First send a message
            twilio_client.messages.create(
                body="✅ Sua arte está pronta! Aqui está:",
                from_='whatsapp:+14155238886',
                to=phone_number
            )
            
            # Then send the image (Twilio sandbox might have limitations)
            try:
                twilio_client.messages.create(
                    media_url=[image_url],
                    from_='whatsapp:+14155238886',
                    to=phone_number
                )
            except:
                # If can't send image, send link
                twilio_client.messages.create(
                    body=f"📎 Acesse sua arte: {image_url}",
                    from_='whatsapp:+14155238886',
                    to=phone_number
                )
            
            # Send usage info
            remaining = user.remaining_credits
            twilio_client.messages.create(
                body=f"💡 Créditos restantes: {remaining}",
                from_='whatsapp:+14155238886',
                to=phone_number
            )
        
    except Exception as e:
        print(f"Error generating art: {e}")
        
        # Update generation as failed
        generation = Generation(
            user_id=user.id,
            prompt=prompt,
            input_type=input_type,
            status="failed",
            error_message=str(e),
            credits_used=0
        )
        db.add(generation)
        db.commit()
        
        # Send error message
        if twilio_client:
            twilio_client.messages.create(
                body="❌ Ocorreu um erro ao gerar sua arte. Tente novamente com um texto mais claro.",
                from_='whatsapp:+14155238886',
                to=phone_number
            )