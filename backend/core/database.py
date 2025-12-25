from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from core.config import settings

# Criar engine do banco de dados
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=settings.DEBUG
)

# Criar session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base para os modelos
Base = declarative_base()

# Dependência para obter sessão do banco
def get_db():
    """
    Fornece uma sessão do banco de dados para cada request.
    Fecha automaticamente ao final.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Import models to ensure SQLAlchemy mappers are registered
# This makes sure relationships using string class names
# (e.g. "WhatsAppNumber") can be resolved when mappers
# are configured during runtime.
try:
    from models import user, whatsapp, generation
except Exception:
    # Import errors here are non-fatal for environments
    # where models are imported elsewhere.
    pass