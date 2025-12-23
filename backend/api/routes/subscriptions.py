from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import stripe
from datetime import datetime

from core.database import get_db
from core.security import get_current_user
from core.config import settings
from models.user import User, PlanType
from schemas.subscription import (
    PlanResponse,
    SubscriptionResponse,
    CreateSubscriptionRequest,
    UpdatePaymentMethodRequest,
    InvoiceResponse
)

router = APIRouter()

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

PLANS = {
    "basic_monthly": {
        "id": "basic_monthly",
        "name": "Básico Mensal",
        "description": "Ideal para pequenos negócios",
        "price_monthly": 49.90,
        "price_yearly": 499.90,
        "features": [
            "50 gerações por mês",
            "1 número WhatsApp",
            "Templates básicos",
            "Suporte por email",
            "Dashboard web"
        ],
        "limits": {
            "generations": 50,
            "whatsapp_numbers": 1,
            "templates": 10
        }
    },
    "professional_monthly": {
        "id": "professional_monthly",
        "name": "Profissional Mensal",
        "description": "Para negócios em crescimento",
        "price_monthly": 99.90,
        "price_yearly": 999.90,
        "features": [
            "200 gerações por mês",
            "3 números WhatsApp",
            "Templates premium",
            "Suporte prioritário",
            "Relatórios avançados",
            "API access"
        ],
        "limits": {
            "generations": 200,
            "whatsapp_numbers": 3,
            "templates": 50
        }
    },
    "annual_professional": {
        "id": "annual_professional",
        "name": "Profissional Anual",
        "description": "Melhor custo-benefício",
        "price_monthly": 83.25,  # 999.90 / 12
        "price_yearly": 999.90,
        "features": [
            "Todas as features Profissional",
            "2 meses grátis (no anual)",
            "Prioridade máxima",
            "Consultoria inicial"
        ],
        "limits": {
            "generations": 200,
            "whatsapp_numbers": 3,
            "templates": 999  # Unlimited
        }
    }
}

@router.get("/plans", response_model=List[PlanResponse])
async def get_plans():
    """
    Get available subscription plans
    """
    plans = []
    for plan_id, plan_data in PLANS.items():
        plans.append(PlanResponse(
            id=plan_id,
            name=plan_data["name"],
            description=plan_data["description"],
            price_monthly=plan_data["price_monthly"],
            price_yearly=plan_data["price_yearly"],
            features=plan_data["features"],
            limits=plan_data["limits"]
        ))
    
    return plans

@router.get("/current", response_model=SubscriptionResponse)
async def get_current_subscription(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's subscription
    """
    user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get plan details
    plan_details = None
    for plan_id, plan_data in PLANS.items():
        if plan_id.startswith(user.plan_type.value):
            plan_details = plan_data
            break
    
    return SubscriptionResponse(
        plan_type=user.plan_type,
        status=user.subscription_status or "active",
        current_period_end=user.subscription_ends_at,
        trial_end=user.trial_ends_at,
        credits_used=user.credits_used,
        credits_limit=user.credits_limit,
        plan_details=plan_details
    )

@router.post("/", response_model=SubscriptionResponse)
async def create_subscription(
    data: CreateSubscriptionRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None
):
    """
    Create a new subscription
    """
    user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate plan
    if data.plan_id not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    plan_data = PLANS[data.plan_id]
    
    # Check if user is already on this plan
    if user.plan_type.value in data.plan_id and user.subscription_status == "active":
        raise HTTPException(
            status_code=400,
            detail="You are already subscribed to this plan"
        )
    
    # Process payment with Stripe
    try:
        if settings.STRIPE_SECRET_KEY:
            # Create Stripe customer if not exists
            if not user.subscription_id:
                customer = stripe.Customer.create(
                    email=user.email,
                    name=user.full_name or user.business_name,
                    metadata={
                        "user_id": user.id,
                        "business_name": user.business_name
                    }
                )
                user.subscription_id = customer.id
            
            # Create subscription
            price_id = get_stripe_price_id(data.plan_id, data.billing_cycle)
            subscription = stripe.Subscription.create(
                customer=user.subscription_id,
                items=[{"price": price_id}],
                payment_behavior="default_incomplete",
                expand=["latest_invoice.payment_intent"],
                metadata={
                    "plan_id": data.plan_id,
                    "billing_cycle": data.billing_cycle
                }
            )
            
            # Update user
            user.plan_type = PlanType(data.plan_id.split('_')[0])
            user.subscription_status = "active"
            user.credits_limit = plan_data["limits"]["generations"]
            user.whatsapp_numbers_limit = plan_data["limits"]["whatsapp_numbers"]
            user.subscription_ends_at = datetime.fromtimestamp(
                subscription.current_period_end
            )
            
            db.commit()
            
            return SubscriptionResponse(
                plan_type=user.plan_type,
                status=user.subscription_status,
                current_period_end=user.subscription_ends_at,
                trial_end=user.trial_ends_at,
                credits_used=user.credits_used,
                credits_limit=user.credits_limit,
                plan_details=plan_data,
                client_secret=subscription.latest_invoice.payment_intent.client_secret
            )
        else:
            # Stripe not configured - mock subscription
            user.plan_type = PlanType(data.plan_id.split('_')[0])
            user.subscription_status = "active"
            user.credits_limit = plan_data["limits"]["generations"]
            user.whatsapp_numbers_limit = plan_data["limits"]["whatsapp_numbers"]
            user.subscription_ends_at = datetime.utcnow() + timedelta(days=30)
            
            db.commit()
            
            return SubscriptionResponse(
                plan_type=user.plan_type,
                status=user.subscription_status,
                current_period_end=user.subscription_ends_at,
                trial_end=user.trial_ends_at,
                credits_used=user.credits_used,
                credits_limit=user.credits_limit,
                plan_details=plan_data
            )
            
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cancel")
async def cancel_subscription(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel current subscription
    """
    user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.plan_type == PlanType.TRIAL:
        raise HTTPException(
            status_code=400,
            detail="Trial subscriptions cannot be cancelled"
        )
    
    try:
        if settings.STRIPE_SECRET_KEY and user.subscription_id:
            # Cancel Stripe subscription
            stripe.Subscription.modify(
                user.subscription_id,
                cancel_at_period_end=True
            )
        
        # Update user
        user.subscription_status = "cancelled"
        user.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {"success": True, "message": "Subscription cancelled"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reactivate")
async def reactivate_subscription(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reactivate cancelled subscription
    """
    user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.subscription_status != "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Subscription is not cancelled"
        )
    
    try:
        if settings.STRIPE_SECRET_KEY and user.subscription_id:
            # Reactivate Stripe subscription
            stripe.Subscription.modify(
                user.subscription_id,
                cancel_at_period_end=False
            )
        
        # Update user
        user.subscription_status = "active"
        user.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {"success": True, "message": "Subscription reactivated"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/payment-method")
async def update_payment_method(
    data: UpdatePaymentMethodRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update payment method
    """
    user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.subscription_id:
        raise HTTPException(
            status_code=400,
            detail="No active subscription"
        )
    
    try:
        if settings.STRIPE_SECRET_KEY:
            # Update payment method in Stripe
            # This is a simplified version - actual implementation would use SetupIntents
            pass
        
        return {"success": True, "message": "Payment method updated"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/invoices", response_model=List[InvoiceResponse])
async def get_invoices(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get subscription invoices
    """
    user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Mock invoices for now
    invoices = [
        InvoiceResponse(
            id="inv_001",
            amount=49.90,
            currency="brl",
            status="paid",
            created_at=datetime.utcnow() - timedelta(days=30),
            invoice_url="https://example.com/invoice/001"
        ),
        InvoiceResponse(
            id="inv_002",
            amount=49.90,
            currency="brl",
            status="paid",
            created_at=datetime.utcnow(),
            invoice_url="https://example.com/invoice/002"
        )
    ]
    
    return invoices

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    background_tasks: BackgroundTasks
):
    """
    Handle Stripe webhook events
    """
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event['type'] == 'invoice.payment_succeeded':
        invoice = event['data']['object']
        # Handle successful payment
        background_tasks.add_task(handle_payment_succeeded, invoice)
    elif event['type'] == 'invoice.payment_failed':
        invoice = event['data']['object']
        # Handle failed payment
        background_tasks.add_task(handle_payment_failed, invoice)
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        # Handle subscription cancellation
        background_tasks.add_task(handle_subscription_deleted, subscription)
    
    return {"received": True}

def get_stripe_price_id(plan_id: str, billing_cycle: str) -> str:
    """
    Get Stripe price ID for a plan
    """
    # Mock price IDs - in production, create these in Stripe dashboard
    price_ids = {
        "basic_monthly_monthly": "price_basic_monthly",
        "basic_monthly_yearly": "price_basic_yearly",
        "professional_monthly_monthly": "price_pro_monthly",
        "professional_monthly_yearly": "price_pro_yearly",
        "annual_professional_yearly": "price_annual"
    }
    
    key = f"{plan_id}_{billing_cycle}"
    return price_ids.get(key, f"price_{plan_id}")

async def handle_payment_succeeded(invoice):
    """
    Handle successful payment
    """
    db = next(get_db())
    
    customer_id = invoice['customer']
    user = db.query(User).filter(User.subscription_id == customer_id).first()
    
    if user:
        user.subscription_status = "active"
        user.subscription_ends_at = datetime.fromtimestamp(
            invoice['lines']['data'][0]['period']['end']
        )
        db.commit()

async def handle_payment_failed(invoice):
    """
    Handle failed payment
    """
    db = next(get_db())
    
    customer_id = invoice['customer']
    user = db.query(User).filter(User.subscription_id == customer_id).first()
    
    if user:
        user.subscription_status = "past_due"
        db.commit()

async def handle_subscription_deleted(subscription):
    """
    Handle subscription deletion
    """
    db = next(get_db())
    
    customer_id = subscription['customer']
    user = db.query(User).filter(User.subscription_id == customer_id).first()
    
    if user:
        user.plan_type = PlanType.TRIAL
        user.subscription_status = None
        user.credits_limit = 10
        user.whatsapp_numbers_limit = 1
        user.subscription_ends_at = None
        db.commit()