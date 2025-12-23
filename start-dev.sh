#!/bin/bash

echo "🚀 Iniciando NexusArt em modo desenvolvimento..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker Desktop."
    exit 1
fi

# Verificar se o arquivo .env existe
if [ ! -f "backend/.env" ]; then
    echo "📄 Criando arquivo .env..."
    cat > backend/.env << EOF
# App
SECRET_KEY=dev_secret_key_change_in_production_123

# Database
DATABASE_URL=postgresql://nexusart:nexusart123@postgres:5432/nexusart

# Redis
REDIS_URL=redis://redis:6379/0

# APIs (preencher posteriormente)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
GEMINI_API_KEY=your_gemini_key

# AWS (opcional para desenvolvimento)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=sa-east-1
AWS_S3_BUCKET=nexusart-media-dev

# Whisper
WHISPER_MODEL=base
EOF
fi

# Criar pastas necessárias
mkdir -p backend/uploads

echo "🐳 Construindo e iniciando containers..."
docker-compose down
docker-compose up --build

echo "✅ NexusArt está rodando!"
echo "🌐 Frontend: http://localhost:3000"
echo "📡 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "💾 PostgreSQL: localhost:5432"
echo "🔴 Redis: localhost:6379"