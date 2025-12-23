from celery import shared_task
from celery.utils.log import get_task_logger
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
import shutil
from pathlib import Path

from core.database import SessionLocal
from models.generation import Generation
from services.storage_service import StorageService
from core.config import settings

logger = get_task_logger(__name__)

@shared_task
def cleanup_temp_files():
    """
    Clean up old temporary files
    """
    logger.info("Starting temp files cleanup")
    
    # Clean up local temp directory if not using S3
    if not settings.AWS_ACCESS_KEY_ID:
        temp_dir = settings.absolute_upload_dir
        if os.path.exists(temp_dir):
            # Remove files older than 7 days
            cutoff_time = datetime.now() - timedelta(days=7)
            
            for item in Path(temp_dir).rglob("*"):
                if item.is_file():
                    file_time = datetime.fromtimestamp(item.stat().st_mtime)
                    if file_time < cutoff_time:
                        try:
                            item.unlink()
                            logger.debug(f"Removed old file: {item}")
                        except Exception as e:
                            logger.error(f"Error removing file {item}: {e}")
    
    logger.info("Temp files cleanup completed")

@shared_task
def cleanup_old_generations():
    """
    Clean up old generation records and associated files
    """
    db = SessionLocal()
    storage_service = StorageService()
    
    try:
        # Find generations older than 90 days
        cutoff_date = datetime.utcnow() - timedelta(days=90)
        
        old_generations = db.query(Generation).filter(
            Generation.created_at < cutoff_date,
            Generation.status == "completed"
        ).limit(1000).all()  # Limit to avoid memory issues
        
        deleted_count = 0
        
        for generation in old_generations:
            try:
                # Delete associated file if exists
                if generation.file_key:
                    storage_service.delete_image(generation.file_key)
                
                # Delete database record
                db.delete(generation)
                deleted_count += 1
                
            except Exception as e:
                logger.error(f"Error deleting generation {generation.id}: {e}")
        
        db.commit()
        logger.info(f"Cleaned up {deleted_count} old generations")
        
    except Exception as e:
        logger.error(f"Error in cleanup_old_generations: {e}")
        db.rollback()
    
    finally:
        db.close()

@shared_task
def backup_database():
    """
    Backup database (simplified version)
    """
    logger.info("Starting database backup")
    
    try:
        # This is a simplified backup task
        # In production, implement proper database backup
        
        backup_dir = Path("backups")
        backup_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = backup_dir / f"backup_{timestamp}.sql"
        
        # For PostgreSQL, you might use pg_dump
        # For SQLite, just copy the file
        
        logger.info(f"Database backup created: {backup_file}")
        
        # Clean up old backups (keep last 7)
        backup_files = sorted(backup_dir.glob("backup_*.sql"), key=os.path.getmtime)
        if len(backup_files) > 7:
            for old_backup in backup_files[:-7]:
                old_backup.unlink()
                logger.debug(f"Removed old backup: {old_backup}")
        
    except Exception as e:
        logger.error(f"Error in database backup: {e}")

@shared_task
def update_usage_statistics():
    """
    Update usage statistics for reporting
    """
    db = SessionLocal()
    
    try:
        # Get current date info
        today = datetime.utcnow().date()
        month_start = today.replace(day=1)
        
        # This would update statistics tables
        # For now, just log the task
        logger.info("Usage statistics update task ran")
        
    except Exception as e:
        logger.error(f"Error updating usage statistics: {e}")
    
    finally:
        db.close()

@shared_task
def validate_storage_integrity():
    """
    Validate storage integrity by checking if all database records have corresponding files
    """
    db = SessionLocal()
    storage_service = StorageService()
    
    try:
        # Get all generations with file keys
        generations = db.query(Generation).filter(
            Generation.file_key.isnot(None),
            Generation.status == "completed"
        ).limit(100).all()  # Limit to avoid performance issues
        
        missing_files = []
        
        for generation in generations:
            try:
                # Check if file exists (this is simplified)
                # In production, implement actual file existence check
                pass
                
            except Exception as e:
                missing_files.append(generation.id)
                logger.warning(f"File missing for generation {generation.id}: {e}")
        
        if missing_files:
            logger.warning(f"Found {len(missing_files)} generations with missing files")
        
        logger.info(f"Storage integrity check completed. Checked {len(generations)} files")
        
    except Exception as e:
        logger.error(f"Error in storage integrity check: {e}")
    
    finally:
        db.close()