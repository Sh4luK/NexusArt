from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, Any

from core.database import get_db
from core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    get_current_user
)
from core.config import settings
from models.user import User, PlanType
from schemas.user import (
    UserCreate, 
    UserResponse, 
    Token, 
    UserUpdate,
    UserStats
)
import secrets

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Registra um novo usuário.
    
    Returns:
        Token de acesso e dados do usuário
    """
    # Verificar se usuário já existe
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | 
        (User.cpf_cnpj == user_data.cpf_cnpj)
    ).first()
    
    if existing_user:
        if existing_user.email == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já registrado"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CPF/CNPJ já registrado"
            )
    
    # Criar novo usuário
    hashed_password = get_password_hash(user_data.password)
    
    # Gerar chave API
    api_key = secrets.token_urlsafe(32)
    
    # Definir fim do período de trial (7 dias)
    trial_ends_at = datetime.utcnow() + timedelta(days=7)
    
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        cpf_cnpj=user_data.cpf_cnpj,
        phone=user_data.phone,
        business_name=user_data.business_name,
        business_sector=user_data.business_sector,
        plan_type=PlanType.TRIAL,
        credits_limit=10,  # 10 gerações no trial
        api_key=api_key,
        trial_ends_at=trial_ends_at,
        is_active=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Criar token de acesso
    access_token = create_access_token(
        data={"sub": db_user.email, "user_id": db_user.id}
    )
    
    # TODO: Enviar email de boas-vindas (background task)
    # background_tasks.add_task(send_welcome_email, db_user.email)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(db_user)
    )

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login de usuário.
    
    Returns:
        Token de acesso e dados do usuário
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Conta desativada"
        )
    
    # Atualizar último login
    user.last_login_at = datetime.utcnow()
    db.commit()
    
    # Criar token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna informações do usuário atual.
    """
    user = db.query(User).filter(User.email == current_user.get("sub")).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    return UserResponse.from_orm(user)

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_data: UserUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Atualiza informações do usuário atual.
    """
    user = db.query(User).filter(User.email == current_user.get("sub")).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Atualizar campos
    for field, value in user_data.dict(exclude_unset=True).items():
        setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    return UserResponse.from_orm(user)

@router.get("/me/stats", response_model=UserStats)
async def get_user_stats(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna estatísticas do usuário atual.
    """
    user = db.query(User).filter(User.email == current_user.get("sub")).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # TODO: Implementar estatísticas reais
    # Por enquanto, retornar dados mock
    return UserStats(
        total_generations=user.credits_used,
        generations_today=0,
        generations_this_month=user.credits_used,
        whatsapp_numbers_count=len(user.whatsapp_numbers),
        templates_count=len(user.templates)
    )

@router.post("/logout")
async def logout(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Logout do usuário.
    Em uma implementação real, invalidaríamos o token.
    """
    return {"message": "Logout realizado com sucesso"}

@router.post("/reset-password")
async def request_password_reset(
    email: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Solicita reset de senha.
    """
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # TODO: Gerar token de reset e enviar email
        # Para evitar ataques de enumeração, sempre retornar sucesso
        pass
    
    return {"message": "Se o email existir, você receberá instruções para resetar sua senha"}

@router.get("/validate-token")
async def validate_token(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Valida se o token atual é válido.
    """
    return {"valid": True, "user_id": current_user.get("user_id")}