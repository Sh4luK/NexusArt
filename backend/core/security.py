from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
import secrets

from core.config import settings

# Contexto para hash de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Scheme para OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Cria um token JWT de acesso.
    
    Args:
        data: Dados a serem incluídos no token
        expires_delta: Tempo de expiração do token
    
    Returns:
        Token JWT codificado
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt

def verify_token(token: str) -> Dict[str, Any]:
    """
    Verifica e decodifica um token JWT.
    
    Args:
        token: Token JWT
    
    Returns:
        Dados decodificados do token
    
    Raises:
        HTTPException: Se o token for inválido ou expirado
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        
        return payload
        
    except JWTError:
        raise credentials_exception

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica se a senha plain corresponde ao hash.
    
    Args:
        plain_password: Senha em texto claro
        hashed_password: Hash da senha
    
    Returns:
        True se a senha corresponder, False caso contrário
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Gera hash da senha.
    
    Args:
        password: Senha em texto claro
    
    Returns:
        Hash da senha
    """
    return pwd_context.hash(password)

def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Dependência para obter o usuário atual a partir do token.
    
    Args:
        token: Token JWT
    
    Returns:
        Dados do usuário do token
    """
    return verify_token(token)

def generate_api_key() -> str:
    """
    Gera uma chave API segura.
    
    Returns:
        Chave API gerada
    """
    return secrets.token_urlsafe(32)