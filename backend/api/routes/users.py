from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from models.user import User
from models.whatsapp import WhatsAppNumber

router = APIRouter()


class OnboardingPayload(BaseModel):
    whatsapp_number: str
    preferred_style: str | None = None


@router.post('/onboarding')
async def onboarding(
    payload: OnboardingPayload,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save onboarding settings: add whatsapp number (if allowed) and optionally store preferred style."""
    user = db.query(User).filter(User.email == current_user.get('sub')).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Usuário não encontrado')

    # Check whatsapp numbers limit
    if len(user.whatsapp_numbers or []) >= (user.whatsapp_numbers_limit or 1):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Limite de números do WhatsApp atingido')

    # Create new WhatsAppNumber
    wa = WhatsAppNumber(
        user_id=user.id,
        phone_number=payload.whatsapp_number,
        is_verified=False,
        is_active=True,
    )
    db.add(wa)
    db.commit()
    db.refresh(wa)

    # Optionally store preferred_style in business_description (non-invasive)
    if payload.preferred_style:
        user.business_description = (user.business_description or '') + f"\npreferred_style:{payload.preferred_style}"
        db.commit()

    return {"message": "Onboarding settings saved", "whatsapp_number_id": wa.id}
