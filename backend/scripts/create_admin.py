#!/usr/bin/env python3
"""
Script to create admin user
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from core.database import SessionLocal
from core.security import get_password_hash
from models.user import User, PlanType
from datetime import datetime, timedelta

def create_admin_user():
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == "admin@nexusart.com").first()
        
        if admin:
            print("Admin user already exists")
            return admin
        
        # Create admin user
        admin = User(
            email="admin@nexusart.com",
            hashed_password=get_password_hash("Admin@123"),
            full_name="Administrator",
            business_name="NexusArt Admin",
            business_sector="technology",
            plan_type=PlanType.PROFESSIONAL,
            credits_limit=9999,
            whatsapp_numbers_limit=10,
            is_active=True,
            is_verified=True,
            is_admin=True,
            api_key="admin_key_" + datetime.utcnow().strftime("%Y%m%d%H%M%S"),
            trial_ends_at=datetime.utcnow() + timedelta(days=365)
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print("Admin user created successfully:")
        print(f"Email: {admin.email}")
        print(f"Password: Admin@123")
        print(f"API Key: {admin.api_key}")
        
        return admin
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
        return None
    
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()