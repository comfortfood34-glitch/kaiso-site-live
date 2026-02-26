from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date, timedelta
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import secrets
import csv
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ========================
# CONFIGURAÇÕES EDITÁVEIS
# ========================
ADMIN_USER = os.environ.get('ADMIN_USER')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD')

# Email Configuration
SMTP_HOST = os.environ.get('SMTP_HOST')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USER = os.environ.get('SMTP_USER')
SMTP_PASS = os.environ.get('SMTP_PASS')
ADMIN_EMAIL_FROM = os.environ.get('ADMIN_EMAIL_FROM')
NOTIFY_TO = os.environ.get('NOTIFY_TO')
CC_TO = os.environ.get('CC_TO')

# Restaurant Configuration
RESTAURANT_NAME = "Kaisō Sushi"
RESTAURANT_PHONE = "+34 673 036 835"
RESTAURANT_ADDRESS = "Av. de Barcelona, 19, 14010 Córdoba, Espanha"
DEFAULT_DAILY_CAPACITY = 30
MAX_GUESTS_PER_RESERVATION = 12

# Tasting Menu
TASTING_MENU_PRICE = 65.90
TASTING_MENU_NAME = "Menú Degustación Premium"

# ========================
# HORÁRIOS POR DIA
# ========================
# 0=Segunda, 1=Terça, 2=Quarta, 3=Quinta, 4=Sexta, 5=Sábado, 6=Domingo
SCHEDULE = {
    0: None,  # Segunda - FECHADO
    1: {"lunch": ("12:00", "14:00"), "dinner": ("19:00", "23:00")},  # Terça
    2: {"lunch": ("12:00", "14:00"), "dinner": ("19:00", "23:00")},  # Quarta
    3: {"lunch": ("12:00", "14:00"), "dinner": ("19:00", "23:00")},  # Quinta
    4: {"lunch": ("12:00", "15:30"), "dinner": ("19:00", "23:30")},  # Sexta
    5: {"lunch": ("12:00", "15:30"), "dinner": ("19:00", "23:30")},  # Sábado
    6: {"lunch": ("12:00", "15:30"), "dinner": ("19:00", "23:00")},  # Domingo
}

# Dias com desconto 10% (Terça, Quarta, Quinta)
DISCOUNT_DAYS = [1, 2, 3]
DISCOUNT_PERCENTAGE = 10

# Degustação disponível apenas Ter-Qui, 19:00-21:00
TASTING_DAYS = [1, 2, 3]
TASTING_START = "19:00"
TASTING_END = "21:00"

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'kaiso_db')]

# Create the main app
app = FastAPI(title="Kaisō Sushi Reservation System")

# CORS must be before routes
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

api_router = APIRouter(prefix="/api")
security = HTTPBasic()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ========================
# MODELS
# ========================
class ReservationCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=100)
    customer_phone: str = Field(..., min_length=9, max_length=20)
    customer_email: Optional[str] = None
    guests: int = Field(..., ge=1, le=MAX_GUESTS_PER_RESERVATION)
    reservation_date: str  # YYYY-MM-DD
    reservation_time: str  # HH:MM
    observations: Optional[str] = ""
    has_tasting_menu: bool = False
    tasting_allergies: Optional[str] = ""

class ManualReservationCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=100)
    customer_phone: str = Field(..., min_length=9, max_length=20)
    customer_email: Optional[str] = None
    guests: int = Field(..., ge=1, le=MAX_GUESTS_PER_RESERVATION)
    reservation_date: str  # YYYY-MM-DD
    reservation_time: str  # HH:MM
    observations: Optional[str] = ""

class Reservation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    guests: int
    reservation_date: str
    reservation_time: str
    observations: str = ""
    has_tasting_menu: bool = False
    tasting_allergies: str = ""
    has_discount: bool = False
    discount_percentage: int = 0
    estimated_value: float = 0.0
    status: str = "confirmada"  # AUTO-ACEITAR: confirmada por padrão
    admin_notes: str = ""
    source: str = "online"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReservationUpdate(BaseModel):
    guests: Optional[int] = None
    reservation_time: Optional[str] = None
    status: Optional[str] = None
    admin_notes: Optional[str] = None

class ConfigUpdate(BaseModel):
    daily_capacity: Optional[int] = None

class BlackoutDate(BaseModel):
    date: str
    reason: Optional[str] = ""

class AnalyticsEvent(BaseModel):
    event_type: str  # page_view, reservation_open, reservation_complete
    page: Optional[str] = "/"
    referrer: Optional[str] = ""
    user_agent: Optional[str] = ""
    language: Optional[str] = "es"
    screen_width: Optional[int] = 0


# ========================
# HELPER FUNCTIONS
# ========================
def generate_time_slots(start: str, end: str, interval_minutes: int = 15) -> List[str]:
    """Gera slots de horário a cada X minutos"""
    slots = []
    start_h, start_m = map(int, start.split(":"))
    end_h, end_m = map(int, end.split(":"))
    
    current = start_h * 60 + start_m
    end_time = end_h * 60 + end_m
    
    while current <= end_time:
        h, m = divmod(current, 60)
        slots.append(f"{h:02d}:{m:02d}")
        current += interval_minutes
    
    return slots

def get_day_schedule(date_str: str) -> dict:
    """Retorna os horários disponíveis para uma data específica"""
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    weekday = dt.weekday()
    return SCHEDULE.get(weekday)

def is_discount_day(date_str: str) -> bool:
    """Verifica se o dia tem desconto (Ter-Qui)"""
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    return dt.weekday() in DISCOUNT_DAYS

def is_tasting_available(date_str: str, time_str: str) -> bool:
    """Verifica se degustação está disponível para data/hora"""
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    if dt.weekday() not in TASTING_DAYS:
        return False
    
    time_minutes = int(time_str.split(":")[0]) * 60 + int(time_str.split(":")[1])
    start_minutes = int(TASTING_START.split(":")[0]) * 60 + int(TASTING_START.split(":")[1])
    end_minutes = int(TASTING_END.split(":")[0]) * 60 + int(TASTING_END.split(":")[1])
    
    return start_minutes <= time_minutes <= end_minutes

def calculate_estimated_value(guests: int, has_tasting: bool, has_discount: bool) -> float:
    """Calcula valor estimado da reserva - €65.90 por casal"""
    if has_tasting:
        couples = max(1, (guests + 1) // 2)  # Round up: 1-2 guests = 1 couple, 3-4 = 2 couples
        value = couples * TASTING_MENU_PRICE
        if has_discount:
            value = value * (1 - DISCOUNT_PERCENTAGE / 100)
        return round(value, 2)
    return 0.0

async def get_daily_capacity() -> int:
    """Obtém capacidade diária configurada"""
    config = await db.config.find_one({"key": "daily_capacity"})
    return config["value"] if config else DEFAULT_DAILY_CAPACITY

async def get_current_guests(date_str: str) -> int:
    """Conta total de comensais já reservados para uma data"""
    reservations = await db.reservations.find({
        "reservation_date": date_str,
        "status": {"$nin": ["cancelada"]}
    }, {"guests": 1}).to_list(1000)
    return sum(r.get("guests", 0) for r in reservations)

async def is_blackout_date(date_str: str) -> bool:
    """Verifica se é uma data bloqueada"""
    blackout = await db.blackout_dates.find_one({"date": date_str})
    return blackout is not None


# ========================
# EMAIL FUNCTIONS
# ========================
async def send_email(to_email: str, subject: str, html_content: str, cc_email: str = None):
    """Envia email via SMTP Gmail"""
    try:
        message = MIMEMultipart("alternative")
        message["From"] = f"{RESTAURANT_NAME} <{ADMIN_EMAIL_FROM}>"
        message["To"] = to_email
        message["Subject"] = subject
        if cc_email:
            message["Cc"] = cc_email
        
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        recipients = [to_email]
        if cc_email:
            recipients.append(cc_email)
        
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            start_tls=True,
            username=SMTP_USER,
            password=SMTP_PASS,
        )
        logger.info(f"Email enviado para {to_email}")
        return True
    except Exception as e:
        logger.error(f"Erro ao enviar email: {str(e)}")
        return False

def get_reservation_email_html(reservation: Reservation, lang: str = "es") -> str:
    """Gera HTML do email de reserva"""
    tasting_text = {
        "es": "Menú Degustación Premium (Pareja)" if reservation.has_tasting_menu else "No",
        "pt": "Menu Degustação Premium (Casal)" if reservation.has_tasting_menu else "Não",
        "en": "Premium Tasting Menu (Couple)" if reservation.has_tasting_menu else "No"
    }
    
    discount_text = ""
    if reservation.has_discount:
        discount_text = f"<p style='color:#C9A24A;'>&#10003; 10% descuento aplicado (Martes-Jueves)</p>"
    
    base_url = os.environ.get("BASE_URL", "https://manual-reservations.preview.emergentagent.com")
    logo_url = f"{base_url}/assets/logo-kaiso.png"
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: 'Montserrat', Arial, sans-serif; background-color: #050608; color: #E5E5E5; margin: 0; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0D0D0D; border: 1px solid #1A1A1A; padding: 40px;">
            <div style="text-align: center; border-bottom: 1px solid #C9A24A; padding-bottom: 30px; margin-bottom: 30px;">
                <img src="{logo_url}" alt="Kaiso Sushi" style="max-height: 60px; width: auto; margin-bottom: 15px;" />
                <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin-top: 10px;">Nueva Reserva</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #888;">Nombre</td><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #E5E5E5; text-align: right;">{reservation.customer_name}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #888;">Telefono</td><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #E5E5E5; text-align: right;">{reservation.customer_phone}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #888;">Email</td><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #E5E5E5; text-align: right;">{reservation.customer_email or '-'}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #888;">Fecha</td><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #C9A24A; text-align: right; font-weight: bold;">{reservation.reservation_date}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #888;">Hora</td><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #C9A24A; text-align: right; font-weight: bold;">{reservation.reservation_time}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #888;">Personas</td><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #E5E5E5; text-align: right;">{reservation.guests}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #888;">Degustacion</td><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #E5E5E5; text-align: right;">{tasting_text.get(lang, tasting_text['es'])}</td></tr>
                {f'<tr><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #888;">Valor Estimado</td><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #C9A24A; text-align: right;">EUR {reservation.estimated_value:.2f}</td></tr>' if reservation.estimated_value > 0 else ''}
            </table>
            
            {discount_text}
            
            {f'<div style="background-color: #1A1A1A; padding: 15px; margin-top: 20px;"><p style="color: #888; margin: 0; font-size: 14px;"><strong>Observaciones:</strong> {reservation.observations}</p></div>' if reservation.observations else ''}
            {f'<div style="background-color: #1A1A1A; padding: 15px; margin-top: 10px;"><p style="color: #D11B2A; margin: 0; font-size: 14px;"><strong>Alergias:</strong> {reservation.tasting_allergies}</p></div>' if reservation.tasting_allergies else ''}
            
            <!-- QR Code Promotion -->
            <div style="background: linear-gradient(135deg, #1A1A1A 0%, #0D0D0D 100%); border: 1px solid #C9A24A; padding: 25px; margin-top: 30px; text-align: center;">
                <p style="color: #C9A24A; font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">Haga su pedido por el QR Code en la mesa</p>
                <p style="color: #E5E5E5; font-size: 14px; margin: 0 0 15px 0;">
                    Acumule puntos que se convierten en dinero y descuentos para comprar en la mesa o por delivery.
                </p>
                <p style="color: #C9A24A; font-size: 13px; margin: 0;">
                    Todo automatico y online
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #1A1A1A; color: #666; font-size: 12px;">
                <p>{RESTAURANT_NAME} &middot; {RESTAURANT_ADDRESS}</p>
                <p>{RESTAURANT_PHONE}</p>
            </div>
        </div>
    </body>
    </html>
    """


# ========================
# AUTH
# ========================
def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    if credentials.username != ADMIN_USER or credentials.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Credenciales inválidas", headers={"WWW-Authenticate": "Basic"})
    return credentials.username


def get_client_confirmation_email(reservation: Reservation) -> str:
    """Email de confirmação para o cliente"""
    base_url = os.environ.get("BASE_URL", "https://manual-reservations.preview.emergentagent.com")
    logo_url = f"{base_url}/assets/logo-kaiso.png"
    
    tasting_row = ""
    if reservation.has_tasting_menu:
        tasting_row = f'<tr><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #888;">Menu Degustacion</td><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #C9A24A; text-align: right;">Premium (Pareja) - EUR {reservation.estimated_value:.2f}</td></tr>'
    
    discount_text = ""
    if reservation.has_discount:
        discount_text = '<p style="color:#C9A24A; margin-top: 15px;">&#10003; 10% descuento aplicado (Martes-Jueves)</p>'
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #050608; color: #E5E5E5; margin: 0; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0D0D0D; border: 1px solid #1A1A1A; padding: 40px;">
            <div style="text-align: center; border-bottom: 1px solid #C9A24A; padding-bottom: 30px; margin-bottom: 30px;">
                <img src="{logo_url}" alt="Kaiso Sushi" style="max-height: 60px; width: auto; margin-bottom: 15px;" />
                <h2 style="color: #C9A24A; margin: 10px 0 5px;">Reserva Confirmada</h2>
                <p style="color: #888; font-size: 13px;">Gracias por elegir Kaiso Sushi, {reservation.customer_name}!</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #888;">Fecha</td><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #C9A24A; text-align: right; font-weight: bold;">{reservation.reservation_date}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #888;">Hora</td><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #C9A24A; text-align: right; font-weight: bold;">{reservation.reservation_time}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #888;">Personas</td><td style="padding: 12px 0; border-bottom: 1px solid #1A1A1A; color: #E5E5E5; text-align: right;">{reservation.guests}</td></tr>
                {tasting_row}
            </table>
            
            {discount_text}
            
            <!-- QR Code Promotion -->
            <div style="background: linear-gradient(135deg, #1A1A1A 0%, #0D0D0D 100%); border: 1px solid #C9A24A; padding: 25px; margin-top: 30px; text-align: center;">
                <p style="color: #C9A24A; font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">Haga su pedido por el QR Code en la mesa</p>
                <p style="color: #E5E5E5; font-size: 14px; margin: 0 0 15px 0;">
                    Acumule puntos que se convierten en dinero y descuentos para comprar en la mesa o por delivery.
                </p>
                <p style="color: #C9A24A; font-size: 13px; margin: 0;">Todo automatico y online</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://wa.me/34673036835" style="display: inline-block; background-color: #C9A24A; color: #000; padding: 12px 30px; text-decoration: none; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">Contactar por WhatsApp</a>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #1A1A1A; color: #666; font-size: 12px;">
                <p>{RESTAURANT_NAME}</p>
                <p>{RESTAURANT_ADDRESS}</p>
                <p>{RESTAURANT_PHONE}</p>
            </div>
        </div>
    </body>
    </html>
    """


# ========================
# API ROUTES - PUBLIC
# ========================
@api_router.get("/")
async def root():
    return {"message": "Kaisō Sushi Reservation API", "status": "online"}

@api_router.get("/config")
async def get_public_config():
    """Configuração pública do restaurante"""
    return {
        "restaurant_name": RESTAURANT_NAME,
        "phone": RESTAURANT_PHONE,
        "address": RESTAURANT_ADDRESS,
        "max_guests_per_reservation": MAX_GUESTS_PER_RESERVATION,
        "tasting_menu_price": TASTING_MENU_PRICE,
        "discount_percentage": DISCOUNT_PERCENTAGE,
        "discount_days": DISCOUNT_DAYS,
        "tasting_days": TASTING_DAYS,
        "tasting_hours": {"start": TASTING_START, "end": TASTING_END}
    }

@api_router.get("/availability/{date_str}")
async def get_availability(date_str: str):
    """Retorna disponibilidade para uma data"""
    # Validar formato
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de data inválido. Use YYYY-MM-DD")
    
    # Verificar se não é data passada
    if dt.date() < datetime.now().date():
        raise HTTPException(status_code=400, detail="Não é possível reservar datas passadas")
    
    # Verificar blackout
    if await is_blackout_date(date_str):
        return {"available": False, "reason": "Data bloqueada pelo restaurante", "slots": []}
    
    # Verificar se é segunda (fechado)
    schedule = get_day_schedule(date_str)
    if not schedule:
        return {"available": False, "reason": "Restaurante fechado às segundas-feiras", "slots": []}
    
    # Verificar capacidade
    capacity = await get_daily_capacity()
    current_guests = await get_current_guests(date_str)
    remaining = capacity - current_guests
    
    if remaining <= 0:
        return {"available": False, "reason": "Capacidade esgotada para esta data", "remaining_capacity": 0, "slots": []}
    
    # Gerar slots
    lunch_slots = generate_time_slots(schedule["lunch"][0], schedule["lunch"][1])
    dinner_slots = generate_time_slots(schedule["dinner"][0], schedule["dinner"][1])
    
    # Verificar desconto
    has_discount = is_discount_day(date_str)
    
    return {
        "available": True,
        "date": date_str,
        "weekday": dt.weekday(),
        "remaining_capacity": remaining,
        "has_discount": has_discount,
        "discount_percentage": DISCOUNT_PERCENTAGE if has_discount else 0,
        "lunch_slots": lunch_slots,
        "dinner_slots": dinner_slots,
        "tasting_available": dt.weekday() in TASTING_DAYS,
        "tasting_slots": generate_time_slots(TASTING_START, TASTING_END) if dt.weekday() in TASTING_DAYS else []
    }

@api_router.post("/reservations")
async def create_reservation(input: ReservationCreate):
    """Criar nova reserva"""
    # Validar data
    schedule = get_day_schedule(input.reservation_date)
    if not schedule:
        raise HTTPException(status_code=400, detail="Restaurante cerrado los lunes")
    
    # Verificar blackout
    if await is_blackout_date(input.reservation_date):
        raise HTTPException(status_code=400, detail="Esta fecha no está disponible para reservas")
    
    # Verificar capacidade
    capacity = await get_daily_capacity()
    current_guests = await get_current_guests(input.reservation_date)
    
    if current_guests + input.guests > capacity:
        remaining = capacity - current_guests
        raise HTTPException(status_code=400, detail=f"Capacidad agotada para esta fecha. Plazas disponibles: {remaining}")
    
    # Validar horário
    lunch_slots = generate_time_slots(schedule["lunch"][0], schedule["lunch"][1])
    dinner_slots = generate_time_slots(schedule["dinner"][0], schedule["dinner"][1])
    all_slots = lunch_slots + dinner_slots
    
    if input.reservation_time not in all_slots:
        raise HTTPException(status_code=400, detail=f"Horario no disponible. Horarios válidos: {all_slots}")
    
    # Validar degustação
    if input.has_tasting_menu:
        if not is_tasting_available(input.reservation_date, input.reservation_time):
            raise HTTPException(status_code=400, detail="Menú Degustación solo disponible Martes-Jueves, 19:00-21:00")
    
    # Calcular desconto e valor
    has_discount = is_discount_day(input.reservation_date)
    estimated_value = calculate_estimated_value(input.guests, input.has_tasting_menu, has_discount)
    
    # Criar reserva - AUTO-ACEITAR se dentro dos horários permitidos
    reservation = Reservation(
        **input.model_dump(),
        has_discount=has_discount,
        discount_percentage=DISCOUNT_PERCENTAGE if has_discount else 0,
        estimated_value=estimated_value,
        status="confirmada"  # AUTO-ACEITAR todas as reservas válidas
    )
    
    # Salvar no banco
    doc = reservation.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.reservations.insert_one(doc)
    
    # Enviar emails em BACKGROUND (não bloqueia a resposta)
    async def send_emails_background():
        try:
            email_html = get_reservation_email_html(reservation)
            await send_email(NOTIFY_TO, f"Nueva Reserva: {reservation.customer_name} - {reservation.reservation_date}", email_html, CC_TO)
        except Exception as e:
            logger.error(f"Erro ao enviar email empresa: {e}")
        
        if reservation.customer_email:
            try:
                client_html = get_client_confirmation_email(reservation)
                await send_email(reservation.customer_email, "Confirmación de Reserva - Kaisō Sushi", client_html)
            except Exception as e:
                logger.error(f"Erro ao enviar email cliente: {e}")
    
    asyncio.create_task(send_emails_background())
    
    return reservation

@api_router.get("/whatsapp-message")
async def generate_whatsapp_message(
    name: str, guests: int, date: str, time: str, 
    tasting: bool = False, observations: str = ""
):
    """Gera mensagem formatada para WhatsApp"""
    tasting_text = "✓ Menú Degustación Premium" if tasting else ""
    obs_text = f"\nObservaciones: {observations}" if observations else ""
    
    message = f"""🍣 *RESERVA KAISŌ SUSHI*

👤 Nombre: {name}
👥 Personas: {guests}
📅 Fecha: {date}
🕐 Hora: {time}
{tasting_text}{obs_text}

_Enviado desde kaisosushi.es_"""
    
    import urllib.parse
    encoded = urllib.parse.quote(message)
    return {"whatsapp_url": f"https://wa.me/34673036835?text={encoded}"}


# ========================
# API ROUTES - ADMIN
# ========================
@api_router.post("/admin/reservations")
async def admin_create_reservation(
    input: ManualReservationCreate,
    credentials: HTTPBasicCredentials = Depends(verify_admin)
):
    """Create reservation manually (admin) - bypasses availability checks"""
    has_discount = is_discount_day(input.reservation_date)

    reservation = Reservation(
        customer_name=input.customer_name,
        customer_phone=input.customer_phone,
        customer_email=input.customer_email,
        guests=input.guests,
        reservation_date=input.reservation_date,
        reservation_time=input.reservation_time,
        observations=input.observations or "",
        has_discount=has_discount,
        discount_percentage=DISCOUNT_PERCENTAGE if has_discount else 0,
        estimated_value=0.0,
        status="confirmada",
        source="manual"
    )

    doc = reservation.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.reservations.insert_one(doc)

    # Remove _id added by MongoDB
    doc.pop('_id', None)

    # Send emails in background
    async def send_emails_background():
        # Notify restaurant
        try:
            email_html = get_reservation_email_html(reservation)
            await send_email(NOTIFY_TO, f"Nueva Reserva Manual: {reservation.customer_name} - {reservation.reservation_date}", email_html, CC_TO)
        except Exception as e:
            logger.error(f"Erro ao enviar email admin (manual): {e}")

        # Notify customer if email provided
        if reservation.customer_email:
            try:
                client_html = get_client_confirmation_email(reservation)
                await send_email(reservation.customer_email, "Confirmación de Reserva - Kaisō Sushi", client_html)
            except Exception as e:
                logger.error(f"Erro ao enviar email cliente (manual): {e}")

    asyncio.create_task(send_emails_background())

    return doc

@api_router.get("/admin/reservations")
async def admin_get_reservations(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    status: Optional[str] = None,
    credentials: HTTPBasicCredentials = Depends(verify_admin)
):
    """Lista reservas (admin)"""
    query = {}
    
    if date_from and date_to:
        query["reservation_date"] = {"$gte": date_from, "$lte": date_to}
    elif date_from:
        query["reservation_date"] = {"$gte": date_from}
    elif date_to:
        query["reservation_date"] = {"$lte": date_to}
    
    if status:
        query["status"] = status
    
    reservations = await db.reservations.find(query, {"_id": 0}).to_list(1000)
    
    for res in reservations:
        if isinstance(res.get('created_at'), str):
            res['created_at'] = datetime.fromisoformat(res['created_at'])
    
    reservations.sort(key=lambda x: (x['reservation_date'], x['reservation_time']))
    return reservations

@api_router.patch("/admin/reservations/{reservation_id}")
async def admin_update_reservation(
    reservation_id: str,
    update: ReservationUpdate,
    credentials: HTTPBasicCredentials = Depends(verify_admin)
):
    """Atualiza reserva (admin)"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")
    
    result = await db.reservations.update_one(
        {"id": reservation_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    
    return {"message": "Reserva atualizada", "id": reservation_id}

@api_router.get("/admin/stats")
async def admin_get_stats(credentials: HTTPBasicCredentials = Depends(verify_admin)):
    """Estatísticas do admin"""
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Reservas de hoje
    today_reservations = await db.reservations.find({
        "reservation_date": today,
        "status": {"$nin": ["cancelada"]}
    }).to_list(1000)
    
    today_guests = sum(r.get("guests", 0) for r in today_reservations)
    
    # Total confirmadas
    total_confirmed = await db.reservations.count_documents({"status": "confirmada"})
    total_pending = await db.reservations.count_documents({"status": "pendente"})
    
    # Capacidade
    capacity = await get_daily_capacity()
    
    return {
        "today_date": today,
        "today_reservations": len(today_reservations),
        "today_guests": today_guests,
        "today_capacity": capacity,
        "today_remaining": capacity - today_guests,
        "total_confirmed": total_confirmed,
        "total_pending": total_pending
    }

@api_router.post("/admin/config")
async def admin_update_config(
    config: ConfigUpdate,
    credentials: HTTPBasicCredentials = Depends(verify_admin)
):
    """Atualiza configurações (admin)"""
    if config.daily_capacity:
        await db.config.update_one(
            {"key": "daily_capacity"},
            {"$set": {"value": config.daily_capacity}},
            upsert=True
        )
    return {"message": "Configuração atualizada"}

@api_router.post("/admin/blackout")
async def admin_add_blackout(
    blackout: BlackoutDate,
    credentials: HTTPBasicCredentials = Depends(verify_admin)
):
    """Adiciona data bloqueada"""
    await db.blackout_dates.update_one(
        {"date": blackout.date},
        {"$set": {"date": blackout.date, "reason": blackout.reason}},
        upsert=True
    )
    return {"message": "Data bloqueada", "date": blackout.date}

@api_router.delete("/admin/blackout/{date_str}")
async def admin_remove_blackout(
    date_str: str,
    credentials: HTTPBasicCredentials = Depends(verify_admin)
):
    """Remove data bloqueada"""
    await db.blackout_dates.delete_one({"date": date_str})
    return {"message": "Bloqueio removido", "date": date_str}

@api_router.get("/admin/blackout")
async def admin_get_blackouts(credentials: HTTPBasicCredentials = Depends(verify_admin)):
    """Lista datas bloqueadas"""
    blackouts = await db.blackout_dates.find({}, {"_id": 0}).to_list(100)
    return blackouts

@api_router.get("/admin/export")
async def admin_export_csv(
    date_from: str,
    date_to: str,
    credentials: HTTPBasicCredentials = Depends(verify_admin)
):
    """Exporta reservas em CSV"""
    reservations = await db.reservations.find({
        "reservation_date": {"$gte": date_from, "$lte": date_to}
    }, {"_id": 0}).to_list(1000)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Nome", "Telefone", "Email", "Data", "Hora", "Pessoas", "Degustação", "Valor", "Status", "Observações"])
    
    for r in reservations:
        writer.writerow([
            r.get("id"), r.get("customer_name"), r.get("customer_phone"),
            r.get("customer_email", ""), r.get("reservation_date"), r.get("reservation_time"),
            r.get("guests"), "Sim" if r.get("has_tasting_menu") else "Não",
            r.get("estimated_value", 0), r.get("status"), r.get("observations", "")
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=reservas_{date_from}_{date_to}.csv"}
    )


# ========================
# ANALYTICS ENDPOINTS
# ========================
@api_router.post("/analytics/track")
async def track_event(event: AnalyticsEvent):
    """Track a page view or user action"""
    doc = {
        "event_type": event.event_type,
        "page": event.page,
        "referrer": event.referrer,
        "language": event.language,
        "device": "mobile" if event.screen_width and event.screen_width < 768 else "desktop",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "hour": datetime.now(timezone.utc).hour
    }
    await db.analytics.insert_one(doc)
    return {"status": "ok"}

@api_router.get("/analytics/stats")
async def get_analytics_stats(
    period: str = Query("7d", description="7d, 30d, 90d"),
    credentials: HTTPBasicCredentials = Depends(verify_admin)
):
    """Get analytics dashboard data"""
    days_map = {"7d": 7, "30d": 30, "90d": 90}
    num_days = days_map.get(period, 7)
    
    start_date = (datetime.now(timezone.utc) - timedelta(days=num_days)).strftime("%Y-%m-%d")
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Get all events in period
    events = await db.analytics.find(
        {"date": {"$gte": start_date}},
        {"_id": 0}
    ).to_list(50000)
    
    # Visitors per day
    daily_views = {}
    pages_count = {}
    languages = {}
    devices = {}
    hourly = {h: 0 for h in range(24)}
    funnel = {"page_view": 0, "reservation_open": 0, "reservation_complete": 0}
    
    for e in events:
        d = e.get("date", "")
        event_type = e.get("event_type", "")
        
        # Daily count
        if event_type == "page_view":
            daily_views[d] = daily_views.get(d, 0) + 1
        
        # Funnel
        if event_type in funnel:
            funnel[event_type] += 1
        
        # Pages
        page = e.get("page", "/")
        pages_count[page] = pages_count.get(page, 0) + 1
        
        # Languages
        lang = e.get("language", "es")
        languages[lang] = languages.get(lang, 0) + 1
        
        # Devices
        device = e.get("device", "desktop")
        devices[device] = devices.get(device, 0) + 1
        
        # Hourly
        hour = e.get("hour", 0)
        hourly[hour] = hourly.get(hour, 0) + 1
    
    # Build daily chart data for the period
    daily_chart = []
    for i in range(num_days):
        d = (datetime.now(timezone.utc) - timedelta(days=num_days - 1 - i)).strftime("%Y-%m-%d")
        daily_chart.append({"date": d, "views": daily_views.get(d, 0)})
    
    # Get reservations in period for correlation
    reservations = await db.reservations.find(
        {"reservation_date": {"$gte": start_date}},
        {"_id": 0, "reservation_date": 1, "guests": 1, "status": 1}
    ).to_list(5000)
    
    daily_reservations = {}
    for r in reservations:
        d = r.get("reservation_date", "")
        daily_reservations[d] = daily_reservations.get(d, 0) + 1
    
    # Add reservations to daily chart
    for item in daily_chart:
        item["reservations"] = daily_reservations.get(item["date"], 0)
    
    # Top pages
    top_pages = sorted(pages_count.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # Today stats
    today_events = [e for e in events if e.get("date") == today]
    today_views = sum(1 for e in today_events if e.get("event_type") == "page_view")
    
    total_views = sum(1 for e in events if e.get("event_type") == "page_view")
    
    return {
        "period": period,
        "total_views": total_views,
        "today_views": today_views,
        "total_reservations_opened": funnel["reservation_open"],
        "total_reservations_completed": funnel["reservation_complete"],
        "conversion_rate": round((funnel["reservation_complete"] / funnel["reservation_open"] * 100), 1) if funnel["reservation_open"] > 0 else 0,
        "daily_chart": daily_chart,
        "top_pages": [{"page": p, "views": v} for p, v in top_pages],
        "languages": [{"lang": k, "count": v} for k, v in sorted(languages.items(), key=lambda x: x[1], reverse=True)],
        "devices": [{"device": k, "count": v} for k, v in devices.items()],
        "hourly": [{"hour": h, "count": c} for h, c in sorted(hourly.items())],
        "funnel": funnel
    }


# Include router
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
