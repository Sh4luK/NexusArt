import google.generativeai as genai
from typing import Dict, List, Optional, Any
import json
import re
from datetime import datetime

class GeminiService:
    def __init__(self, api_key: str):
        """
        Initialize Gemini API service
        
        Args:
            api_key: Google AI API key
        """
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        self.vision_model = genai.GenerativeModel('gemini-pro-vision')
        
    def generate_promotional_image_prompt(self, 
        user_prompt: str, 
        business_type: str,
        template_type: str = None,
        style: str = "modern"
    ) -> Dict[str, Any]:
        """
        Generate a detailed prompt for image generation
        
        Args:
            user_prompt: User's original prompt
            business_type: Type of business (restaurant, clothing, etc.)
            template_type: Specific template to use
            style: Visual style preference
        
        Returns:
            Dictionary with enhanced prompt and metadata
        """
        # Define business-specific templates
        business_templates = {
            "restaurant": {
                "style": "appetizing food photography with warm colors",
                "elements": ["food item", "price", "restaurant name", "contact info", "appetizing lighting"],
                "color_palette": "warm colors like red, orange, yellow, brown",
                "mood": "inviting, delicious, cozy"
            },
            "supermarket": {
                "style": "bright, clean, promotional style with clear pricing",
                "elements": ["products", "prices", "discount badges", "supermarket logo", "contact"],
                "color_palette": "bright colors, green for savings, red for discounts",
                "mood": "fresh, economical, trustworthy"
            },
            "clothing": {
                "style": "fashion photography with models or mannequins",
                "elements": ["clothing items", "prices", "discount percentage", "store name", "sizes available"],
                "color_palette": "varies by season, elegant colors",
                "mood": "stylish, trendy, sophisticated"
            },
            "beauty": {
                "style": "beauty product photography with clean aesthetic",
                "elements": ["beauty products", "prices", "benefits", "store name", "contact"],
                "color_palette": "soft colors, pastels, clean whites",
                "mood": "clean, luxurious, refreshing"
            },
            "services": {
                "style": "professional service advertisement",
                "elements": ["service description", "price/packages", "contact info", "benefits", "call to action"],
                "color_palette": "professional blues, greens, neutral tones",
                "mood": "trustworthy, professional, reliable"
            }
        }
        
        # Get template for business type or use default
        template = business_templates.get(
            business_type, 
            business_templates["services"]
        )
        
        # Define visual styles
        style_descriptions = {
            "modern": "clean, minimalist design with ample white space, modern typography",
            "elegant": "sophisticated, premium look with subtle textures, elegant fonts",
            "fun": "colorful, playful design with fun graphics, rounded shapes, happy vibe",
            "minimal": "extremely simple, focusing only on essential information",
            "bold": "high contrast, strong typography, attention-grabbing design",
            "vintage": "retro style with vintage colors, textures, and typography"
        }
        
        # Build the enhanced prompt
        enhanced_prompt = f"""
        Create a promotional image for WhatsApp with these specifications:
        
        BUSINESS TYPE: {business_type}
        USER PROMPT: "{user_prompt}"
        VISUAL STYLE: {style_descriptions.get(style, style_descriptions['modern'])}
        
        DESIGN REQUIREMENTS:
        1. Image format: Square (1:1 aspect ratio) optimized for WhatsApp
        2. Style: {template['style']}
        3. Mood: {template['mood']}
        4. Color palette: {template['color_palette']}
        
        MUST INCLUDE ELEMENTS:
        - Clear, readable text with the promotional message
        - Business name/logo area (top corner)
        - Contact information (phone/WhatsApp)
        - Prices clearly displayed
        - Call to action ("Ligue agora", "Peça já", etc.)
        
        TEXT CONTENT:
        Extract key information from the user prompt:
        - Product/service name
        - Prices and discounts
        - Promotional details
        - Contact information if mentioned
        
        VISUAL GUIDELINES:
        - Text must be large enough to read on mobile screens
        - Important information should be emphasized
        - Use appropriate imagery for the business type
        - Maintain visual hierarchy
        - Ensure color contrast for readability
        
        OUTPUT FORMAT:
        Generate a detailed image description that an AI image generator can use to create this promotional image.
        Focus on describing the visual elements, layout, colors, and text placement.
        """
        
        try:
            # Attempt to generate enhanced prompt using Gemini; fall back to the
            # raw enhanced prompt if the API key is not configured or the call fails.
            try:
                response = self.model.generate_content(enhanced_prompt)
                generated_description = response.text
            except Exception:
                # Fallback: use the constructed enhanced prompt as the description
                generated_description = enhanced_prompt
            
            # Extract key information
            extracted_info = self._extract_promotional_info(user_prompt)
            
            return {
                "enhanced_prompt": generated_description,
                "original_prompt": user_prompt,
                "business_type": business_type,
                "style": style,
                "template": template,
                "extracted_info": extracted_info,
                "generated_at": datetime.utcnow().isoformat(),
                "image_specs": {
                    "aspect_ratio": "1:1",
                    "recommended_size": "1080x1080",
                    "format": "jpg",
                    "optimized_for": "whatsapp"
                }
            }
            
        except Exception as e:
            raise Exception(f"Failed to generate prompt: {str(e)}")
    
    def _extract_promotional_info(self, text: str) -> Dict[str, Any]:
        """
        Extract promotional information from text
        
        Args:
            text: User's promotional text
        
        Returns:
            Dictionary with extracted information
        """
        info = {
            "products": [],
            "prices": [],
            "discounts": [],
            "contact_info": None,
            "dates": None,
            "call_to_action": None
        }
        
        # Extract prices (R$ format)
        price_pattern = r'R\$\s*(\d+[.,]\d+|\d+)'
        prices = re.findall(price_pattern, text, re.IGNORECASE)
        info["prices"] = [p.replace(',', '.') for p in prices]
        
        # Extract discounts
        discount_pattern = r'(\d+)%|\b(\d+)\s*por cento\b'
        discounts = re.findall(discount_pattern, text, re.IGNORECASE)
        info["discounts"] = [d[0] or d[1] for d in discounts if any(d)]
        
        # Extract phone numbers
        phone_pattern = r'\(?\d{2}\)?\s*\d{4,5}[-.\s]?\d{4}'
        phones = re.findall(phone_pattern, text)
        if phones:
            info["contact_info"] = phones[0]
        
        # Extract dates
        date_pattern = r'\d{1,2}/\d{1,2}(?:/\d{2,4})?'
        dates = re.findall(date_pattern, text)
        if dates:
            info["dates"] = dates
        
        # Simple product extraction (words in quotes or after keywords)
        product_keywords = ['promoção', 'oferta', 'desconto', 'venda', 'lançamento']
        words = text.lower().split()
        for i, word in enumerate(words):
            if word in product_keywords and i + 1 < len(words):
                info["products"].append(words[i + 1])
        
        return info

    def generate_promotional_image(self, prompt: str, business_type: str, template_type: str = None, style: str = "modern") -> Dict[str, Any]:
        """
        High-level convenience method used by the API to generate a promotional image.
        For now this composes an enhanced prompt and returns a mocked image URL along
        with metadata. In production this should call the vision/image generation
        API and return the real image URL and metadata.
        """
        try:
            result = self.generate_promotional_image_prompt(
                user_prompt=prompt,
                business_type=business_type,
                template_type=template_type,
                style=style,
            )
            # Mock image generation for smoke tests
            result["image_url"] = "https://via.placeholder.com/1080"
            return result
        except Exception as e:
            raise
    
    def generate_text_content(self, prompt: str, max_tokens: int = 500) -> str:
        """
        Generate text content using Gemini
        
        Args:
            prompt: Text prompt
            max_tokens: Maximum tokens in response
        
        Returns:
            Generated text
        """
        try:
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "max_output_tokens": max_tokens,
                    "temperature": 0.7,
                }
            )
            return response.text
        except Exception as e:
            raise Exception(f"Text generation failed: {str(e)}")
    
    def analyze_image_prompt(self, image_prompt: str) -> Dict[str, Any]:
        """
        Analyze an image generation prompt for quality and completeness
        
        Args:
            image_prompt: Prompt for image generation
        
        Returns:
            Analysis results
        """
        analysis_prompt = f"""
        Analyze this image generation prompt for a WhatsApp promotional image:
        
        PROMPT: {image_prompt}
        
        Please evaluate:
        1. Clarity and specificity
        2. Inclusion of key promotional elements
        3. Technical specifications (size, format, etc.)
        4. Visual appeal factors
        5. Missing elements
        
        Return analysis as JSON with these keys:
        - clarity_score (1-10)
        - completeness_score (1-10)
        - has_prices (boolean)
        - has_contact (boolean)
        - has_call_to_action (boolean)
        - recommended_improvements (list)
        - overall_quality (good/fair/poor)
        """
        
        try:
            response = self.model.generate_content(analysis_prompt)
            
            # Try to parse JSON from response
            try:
                # Extract JSON from response
                json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
                if json_match:
                    analysis = json.loads(json_match.group())
                else:
                    # Fallback to simple analysis
                    analysis = {
                        "clarity_score": 7,
                        "completeness_score": 6,
                        "has_prices": "R$" in image_prompt or "preço" in image_prompt.lower(),
                        "has_contact": any(word in image_prompt.lower() for word in ["whatsapp", "telefone", "contato"]),
                        "has_call_to_action": any(word in image_prompt.lower() for word in ["ligue", "peça", "visite", "compre"]),
                        "recommended_improvements": ["Add specific prices", "Include contact information"],
                        "overall_quality": "fair"
                    }
            except json.JSONDecodeError:
                analysis = {
                    "clarity_score": 5,
                    "completeness_score": 5,
                    "has_prices": False,
                    "has_contact": False,
                    "has_call_to_action": False,
                    "recommended_improvements": ["Could not parse analysis"],
                    "overall_quality": "fair"
                }
            
            return analysis
            
        except Exception as e:
            raise Exception(f"Prompt analysis failed: {str(e)}")
    
    def suggest_improvements(self, original_prompt: str) -> List[str]:
        """
        Suggest improvements for a promotional text
        
        Args:
            original_prompt: Original user prompt
        
        Returns:
            List of improvement suggestions
        """
        improvement_prompt = f"""
        Given this promotional text for a small business:
        
        TEXT: "{original_prompt}"
        
        Suggest 3 specific improvements to make it more effective as a WhatsApp promotional message.
        Focus on:
        1. Adding missing information (prices, contact, etc.)
        2. Making it more engaging and action-oriented
        3. Optimizing for mobile viewing
        
        Return suggestions as a numbered list.
        """
        
        try:
            response = self.model.generate_content(improvement_prompt)
            
            # Parse suggestions from response
            suggestions = []
            lines = response.text.split('\n')
            for line in lines:
                line = line.strip()
                if line and (line[0].isdigit() or line.startswith('-') or line.startswith('•')):
                    # Remove numbering/bullets
                    clean_line = re.sub(r'^[0-9•\-\.\)\s]+', '', line).strip()
                    if clean_line:
                        suggestions.append(clean_line)
            
            return suggestions[:3]  # Return top 3
            
        except Exception as e:
            return [
                "Adicione preços específicos",
                "Inclua número para contato",
                "Use uma chamada para ação clara (ex: 'Ligue agora!')"
            ]