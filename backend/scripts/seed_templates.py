#!/usr/bin/env python3
"""
Script to seed default templates
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from core.database import SessionLocal
from models.generation import Template

def seed_templates():
    db = SessionLocal()
    
    try:
        # Check if templates already exist
        existing = db.query(Template).count()
        if existing > 0:
            print(f"{existing} templates already exist")
            return
        
        # Default templates
        templates = [
            {
                "name": "Promoção Restaurante",
                "description": "Template para promoções de restaurantes e lanchonetes",
                "category": "restaurant",
                "style": "modern",
                "prompt_template": "Promoção especial: {produto} por apenas R$ {preço}. Peça agora: {telefone}",
                "default_settings": {
                    "colors": ["#FF6B35", "#FFE66D"],
                    "font": "Montserrat",
                    "layout": "food_focus"
                },
                "is_active": True,
                "is_premium": False
            },
            {
                "name": "Oferta Supermercado",
                "description": "Template para ofertas de supermercados",
                "category": "supermarket",
                "style": "bold",
                "prompt_template": "Oferta da semana: {produto} com {desconto}% de desconto! Apenas R$ {preço}. {endereço}",
                "default_settings": {
                    "colors": ["#2A9D8F", "#264653"],
                    "font": "Open Sans",
                    "layout": "product_grid"
                },
                "is_active": True,
                "is_premium": False
            },
            {
                "name": "Moda Fashion",
                "description": "Template para lojas de roupas e acessórios",
                "category": "clothing",
                "style": "elegant",
                "prompt_template": "Coleção {temporada}: {produto} com {desconto}% OFF. Visite nossa loja: {endereço}",
                "default_settings": {
                    "colors": ["#E63946", "#F1FAEE"],
                    "font": "Playfair Display",
                    "layout": "fashion_showcase"
                },
                "is_active": True,
                "is_premium": False
            },
            {
                "name": "Beleza Premium",
                "description": "Template para salões e clínicas de estética",
                "category": "beauty",
                "style": "elegant",
                "prompt_template": "Tratamento especial: {serviço} por R$ {preço}. Agende já: {telefone}",
                "default_settings": {
                    "colors": ["#FFAFCC", "#CDB4DB"],
                    "font": "Lora",
                    "layout": "beauty_product"
                },
                "is_active": True,
                "is_premium": False
            },
            {
                "name": "Serviços Profissionais",
                "description": "Template para prestadores de serviços",
                "category": "services",
                "style": "professional",
                "prompt_template": "{serviço} profissional. Orçamento gratuito: {telefone}. {detalhes}",
                "default_settings": {
                    "colors": ["#3A86FF", "#8338EC"],
                    "font": "Inter",
                    "layout": "service_card"
                },
                "is_active": True,
                "is_premium": False
            }
        ]
        
        # Create templates
        for template_data in templates:
            template = Template(
                user_id=None,  # System template
                **template_data
            )
            db.add(template)
        
        db.commit()
        print(f"{len(templates)} templates seeded successfully")
        
    except Exception as e:
        print(f"Error seeding templates: {e}")
        db.rollback()
    
    finally:
        db.close()

if __name__ == "__main__":
    seed_templates()