from celery import shared_task
from celery.utils.log import get_task_logger
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from core.database import SessionLocal
from models.user import User
from models.generation import Generation

logger = get_task_logger(__name__)

@shared_task
def send_daily_reports():
    """
    Send daily usage reports to users
    """
    db = SessionLocal()
    
    try:
        # Get all active users
        users = db.query(User).filter(
            User.is_active == True,
            User.plan_type != 'trial'  # Don't send to trial users
        ).all()
        
        for user in users:
            # Get yesterday's generations
            yesterday = datetime.utcnow() - timedelta(days=1)
            start_of_day = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            generations = db.query(Generation).filter(
                Generation.user_id == user.id,
                Generation.created_at >= start_of_day,
                Generation.created_at <= end_of_day,
                Generation.status == "completed"
            ).all()
            
            if generations:
                # Prepare report
                total_generations = len(generations)
                credits_used = sum(g.credits_used or 0 for g in generations)
                credits_remaining = max(0, user.credits_limit - user.credits_used)
                
                report_message = f"""
📊 *Relatório Diário NexusArt*

📅 Data: {yesterday.strftime('%d/%m/%Y')}

📈 *Estatísticas do dia:*
• Gerações realizadas: {total_generations}
• Créditos usados: {credits_used}
• Créditos restantes: {credits_remaining}

🏪 *Seu negócio:* {user.business_name or 'Não informado'}

💡 *Dica do dia:* Compartilhe suas artes em grupos de WhatsApp para alcançar mais clientes!

Acesse seu dashboard: nexusart.com.br/dashboard
                """
                
                # Send report (implement based on user preference)
                # For now, just log
                logger.info(f"Daily report for user {user.id}: {total_generations} generations")
                
        logger.info(f"Daily reports sent to {len(users)} users")
        
    except Exception as e:
        logger.error(f"Error sending daily reports: {e}")
    
    finally:
        db.close()

@shared_task
def check_expired_trials():
    """
    Check for expired trial accounts and send notifications
    """
    db = SessionLocal()
    
    try:
        # Get users with expired trials
        expired_users = db.query(User).filter(
            User.plan_type == 'trial',
            User.trial_ends_at < datetime.utcnow(),
            User.is_active == True
        ).all()
        
        for user in expired_users:
            # Send expiration notification
            expiration_message = f"""
⏰ *Seu período de teste expirou!*

Olá {user.full_name or 'empreendedor'},

Seu período de teste gratuito do NexusArt terminou.

📊 *Seu uso durante o teste:*
• Gerações realizadas: {user.credits_used}
• Templates utilizados: 0 (mock)

🚀 *Continue criando artes incríveis!*
Escolha um de nossos planos a partir de R$ 49,90/mês:

• Plano Básico: 50 gerações/mês
• Plano Profissional: 200 gerações/mês
• Plano Anual: Economize 2 meses

👉 Acesse: nexusart.com.br/plans

Qualquer dúvida, estamos aqui para ajudar!
            """
            
            # Send notification (implement based on user preference)
            logger.info(f"Trial expired for user {user.id}")
            
            # Update user status
            user.subscription_status = "expired"
            db.commit()
        
        logger.info(f"Checked {len(expired_users)} expired trials")
        
    except Exception as e:
        logger.error(f"Error checking expired trials: {e}")
    
    finally:
        db.close()

@shared_task
def send_low_credit_notifications():
    """
    Send notifications to users with low credits
    """
    db = SessionLocal()
    
    try:
        # Get users with less than 20% credits remaining
        users = db.query(User).filter(
            User.is_active == True,
            User.plan_type != 'trial'
        ).all()
        
        for user in users:
            credits_remaining = user.remaining_credits
            credits_percentage = (credits_remaining / user.credits_limit) * 100
            
            if credits_percentage < 20 and credits_remaining > 0:
                # Send low credit notification
                notification_message = f"""
⚠️ *Créditos baixos!*

Você tem apenas {credits_remaining} créditos restantes ({credits_percentage:.0f}% do seu limite).

Para não interromper suas criações, considere:
1. *Comprar créditos extras*
2. *Fazer upgrade do plano*

Acesse: nexusart.com.br/plans

Seus créditos renovam em {(user.subscription_ends_at or datetime.utcnow() + timedelta(days=30)).strftime('%d/%m/%Y')}
                """
                
                # Send notification
                logger.info(f"Low credits notification for user {user.id}: {credits_remaining} remaining")
        
        logger.info(f"Sent low credit notifications to users")
        
    except Exception as e:
        logger.error(f"Error sending low credit notifications: {e}")
    
    finally:
        db.close()

@shared_task
def send_welcome_email(user_id: int):
    """
    Send welcome email to new user
    """
    db = SessionLocal()
    
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return
        
        # Prepare welcome email content
        welcome_content = {
            "subject": "Bem-vindo ao NexusArt! 🚀",
            "body": f"""
Olá {user.full_name or 'empreendedor'},

Seja muito bem-vindo(a) ao NexusArt! Estamos muito felizes por você ter escolhido nossa plataforma.

🎉 *O que você ganhou:*
• 7 dias de teste gratuito
• 10 artes promocionais para testar
• Acesso a todos os templates básicos
• Suporte por WhatsApp

🚀 *Primeiros passos:*
1. Conecte seu WhatsApp no painel
2. Envie sua primeira promoção (texto ou áudio)
3. Receba a arte pronta em segundos
4. Compartilhe com seus clientes!

💡 *Dica rápida:* Use áudios para ser mais rápido! O sistema transcreve automaticamente.

📞 *Precisa de ajuda?*
Nosso time está disponível pelo WhatsApp: +55 11 99999-9999

Acesse seu painel: nexusart.com.br/dashboard

Atenciosamente,
Equipe NexusArt
            """,
            "to": user.email
        }
        
        # Send email (implement email service)
        logger.info(f"Welcome email prepared for user {user.id}")
        
    except Exception as e:
        logger.error(f"Error sending welcome email: {e}")
    
    finally:
        db.close()