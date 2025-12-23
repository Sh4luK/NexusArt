from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
import uvicorn

from core.config import settings
from core.database import engine, Base, get_db
from api.routes import auth, whatsapp, generations, subscriptions
from models.user import User

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting NexusArt API...")
    
    # Criar tabelas do banco de dados
    Base.metadata.create_all(bind=engine)
    
    # Criar usuário admin de desenvolvimento (apenas em dev)
    if settings.DEBUG:
        db = next(get_db())
        try:
            admin = db.query(User).filter(User.email == "admin@nexusart.com").first()
            if not admin:
                print("👤 Creating default admin user...")
                from core.security import get_password_hash
                admin = User(
                    email="admin@nexusart.com",
                    hashed_password=get_password_hash("admin123"),
                    full_name="Admin NexusArt",
                    business_name="NexusArt Dev",
                    plan_type="professional",
                    credits_limit=9999,
                    is_active=True
                )
                db.add(admin)
                db.commit()
        except Exception as e:
            print(f"⚠️ Could not create admin user: {e}")
        finally:
            db.close()
    
    yield
    
    # Shutdown
    print("👋 Shutting down NexusArt API...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="API para geração de artes promocionais via WhatsApp",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas da API
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(whatsapp.router, prefix="/api/whatsapp", tags=["WhatsApp"])
app.include_router(generations.router, prefix="/api/generations", tags=["Generations"])
app.include_router(subscriptions.router, prefix="/api/subscriptions", tags=["Subscriptions"])

# Servir arquivos estáticos
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Rotas básicas
@app.get("/")
async def root():
    return {
        "message": "Welcome to NexusArt API",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        # Testar conexão com banco de dados
        db.execute("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": "2024-01-01T00:00:00Z"  # TODO: usar datetime atual
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}"
        )

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {
        "error": "Not Found",
        "message": "The requested resource was not found",
        "path": request.url.path
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )