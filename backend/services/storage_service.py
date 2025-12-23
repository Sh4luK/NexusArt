from celery import Celery
from celery.schedules import crontab
import os
from core.config import settings

# Create Celery instance
celery_app = Celery(
    'nexusart',
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        'tasks.transcription_tasks',
        'tasks.generation_tasks',
        'tasks.notification_tasks',
        'tasks.cleanup_tasks'
    ]
)

# Configure Celery
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='America/Sao_Paulo',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_max_tasks_per_child=1000,
    worker_prefetch_multiplier=1,
    
    # Beat schedule for periodic tasks
    beat_schedule={
        # Clean up old temporary files every day at 3 AM
        'cleanup-temp-files': {
            'task': 'tasks.cleanup_tasks.cleanup_temp_files',
            'schedule': crontab(hour=3, minute=0),
        },
        
        # Send daily usage reports at 8 AM
        'send-daily-reports': {
            'task': 'tasks.notification_tasks.send_daily_reports',
            'schedule': crontab(hour=8, minute=0),
        },
        
        # Check for expired trials every 6 hours
        'check-expired-trials': {
            'task': 'tasks.notification_tasks.check_expired_trials',
            'schedule': crontab(hour='*/6', minute=0),
        },
        
        # Backup database every Sunday at 2 AM
        'backup-database': {
            'task': 'tasks.cleanup_tasks.backup_database',
            'schedule': crontab(day_of_week=0, hour=2, minute=0),
        },
    }
)

if __name__ == '__main__':
    celery_app.start()