from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query, Request
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import StreamingResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
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
import httpx
import subprocess
import signal

WHATSAPP_SERVICE_URL = "http://localhost:8002"
whatsapp_process = None

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
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
NOTIFY_TO = os.environ.get('NOTIFY_TO')
CC_TO = os.environ.get('CC_TO')

# Restaurant Configuration
RESTAURANT_NAME = "Kaisō Sushi"
RESTAURANT_PHONE = "+34 673 036 835"
RESTAURANT_ADDRESS = "Av. de Barcelona, 19, 14010 Córdoba, Espanha"
DEFAULT_DAILY_CAPACITY = 30
MAX_GUESTS_PER_RESERVATION = 12
LAST_RESERVATION_BUFFER = 30  # Minutos antes do fecho - não aceitar reservas

# Tasting Menu
TASTING_MENU_PRICE = 19.90
TASTING_MENU_NAME = "Rodízio Premium Kaisō"

# ========================
# HORÁRIOS POR DIA
# ========================
# 0=Segunda, 1=Terça, 2=Quarta, 3=Quinta, 4=Sexta, 5=Sábado, 6=Domingo
SCHEDULE = {
    0: None,  # Segunda - FECHADO
    1: {"lunch": ("12:00", "14:00"), "dinner": ("20:00", "23:00")},  # Terça
    2: {"lunch": ("12:00", "14:00"), "dinner": ("20:00", "23:00")},  # Quarta
    3: {"lunch": ("12:00", "14:00"), "dinner": ("20:00", "23:00")},  # Quinta
    4: {"lunch": ("13:00", "15:30"), "dinner": ("20:00", "23:30")},  # Sexta
    5: {"lunch": ("13:00", "15:30"), "dinner": ("20:00", "23:30")},  # Sábado
    6: {"lunch": ("13:00", "15:30"), "dinner": ("20:00", "23:00")},  # Domingo
}

# Dias com desconto 10% (Terça, Quarta, Quinta)
DISCOUNT_DAYS = [1, 2, 3]
DISCOUNT_PERCENTAGE = 10

# Degustação disponível apenas Ter-Qui, 19:00-21:00
TASTING_DAYS = [1, 2, 3]
TASTING_START = "20:00"
TASTING_END = "22:30"

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]

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
    customer_email: str = Field(..., min_length=5)
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
def generate_time_slots(start: str, end: str, interval_minutes: int = 15, buffer_minutes: int = 0) -> List[str]:
    """Gera slots de horário a cada X minutos, com buffer antes do fecho"""
    slots = []
    start_h, start_m = map(int, start.split(":"))
    end_h, end_m = map(int, end.split(":"))
    
    current = start_h * 60 + start_m
    end_time = end_h * 60 + end_m - buffer_minutes
    
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
    """Calcula valor estimado do rodízio - €19.90 por pessoa"""
    if has_tasting:
        return round(guests * TASTING_MENU_PRICE, 2)
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
    """Envia email via Resend API (HTTPS) - não usa SMTP direto para evitar bloqueios de porta"""
    if not RESEND_API_KEY:
        logger.warning(f"Email para '{to_email}' ignorado - RESEND_API_KEY não configurada")
        return False
    if not to_email:
        logger.warning("Email ignorado - destinatário em falta")
        return False

    from_addr = f"{RESTAURANT_NAME} <{ADMIN_EMAIL_FROM}>" if ADMIN_EMAIL_FROM else f"{RESTAURANT_NAME} <onboarding@resend.dev>"
    payload = {
        "from": from_addr,
        "to": [to_email],
        "subject": subject,
        "html": html_content,
    }
    if cc_email:
        payload["cc"] = [cc_email]

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
                json=payload,
            )
        if resp.status_code in (200, 201):
            logger.info(f"Email enviado para {to_email} via Resend")
            return True
        else:
            error_msg = resp.text
            logger.error(f"Resend erro {resp.status_code} para {to_email}: {error_msg}")
            raise Exception(f"Resend API error {resp.status_code}: {error_msg}")
    except Exception as e:
        logger.error(f"Erro ao enviar email para {to_email}: {str(e)}")
        raise e

def get_reservation_email_html(reservation: Reservation, lang: str = "es") -> str:
    """Email de nova reserva para o restaurante - design premium"""
    tasting_row = ""
    if reservation.has_tasting_menu:
        price = f"EUR {reservation.estimated_value:.2f}" if reservation.estimated_value > 0 else ""
        tasting_row = f'''<tr>
          <td style="padding:14px 0;border-bottom:1px solid #222;color:#999;font-size:13px;width:45%;">Menu Degustacion</td>
          <td style="padding:14px 0;border-bottom:1px solid #222;color:#C9A24A;text-align:right;font-size:13px;font-weight:bold;">Si — {price}</td>
        </tr>'''
    allergy_block = ""
    if reservation.tasting_allergies:
        allergy_block = f'''<tr><td colspan="2" style="padding:0 0 16px;">
          <div style="background-color:#3D0000;border-left:4px solid #D11B2A;padding:14px 16px;">
            <p style="margin:0;color:#FF6B6B;font-size:13px;font-weight:bold;">&#9888; ALERGIAS / INTOLERANCIAS</p>
            <p style="margin:6px 0 0;color:#FFAAAA;font-size:13px;">{reservation.tasting_allergies}</p>
          </div>
        </td></tr>'''
    obs_block = ""
    if reservation.observations:
        obs_block = f'''<tr><td colspan="2" style="padding:0 0 16px;">
          <div style="background-color:#1A1A0F;border-left:4px solid #C9A24A;padding:14px 16px;">
            <p style="margin:0;color:#C9A24A;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Observaciones</p>
            <p style="margin:6px 0 0;color:#CCC;font-size:13px;">{reservation.observations}</p>
          </div>
        </td></tr>'''
    discount_badge = ""
    if reservation.has_discount:
        discount_badge = '<span style="display:inline-block;background:#C9A24A;color:#000;font-size:10px;font-weight:bold;padding:2px 8px;letter-spacing:1px;margin-left:8px;">-10%</span>'
    source_label = "MANUAL" if reservation.source == "manual" else "ONLINE"
    source_color = "#888" if reservation.source == "manual" else "#C9A24A"

    return f"""<!DOCTYPE html><html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Nueva Reserva - Kaiso Sushi</title></head>
<body style="margin:0;padding:0;background-color:#0A0A0A;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0A0A0A;">
<tr><td align="center" style="padding:24px 12px;">
<table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background-color:#111;border:1px solid #222;">

  <!-- HEADER -->
  <tr><td style="padding:32px 36px 24px;text-align:center;border-bottom:2px solid #C9A24A;background:linear-gradient(180deg,#141414 0%,#111 100%);">
    <img src="https://kaisosushiespanha.com/assets/logo-kaiso.png" alt="Kaiso Sushi" width="100" style="display:block;margin:0 auto 16px;max-width:100px;">
    <p style="margin:0;color:{source_color};font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:4px;">&#9679; Reserva {source_label}</p>
  </td></tr>

  <!-- DATE/TIME HERO -->
  <tr><td style="padding:28px 36px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td width="50%" style="padding-right:8px;">
          <div style="background:#1A1A1A;border:1px solid #2A2A2A;padding:20px;text-align:center;border-top:3px solid #C9A24A;">
            <p style="margin:0 0 4px;color:#666;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Fecha</p>
            <p style="margin:0;color:#C9A24A;font-size:22px;font-weight:bold;">{reservation.reservation_date}</p>
            {discount_badge}
          </div>
        </td>
        <td width="50%" style="padding-left:8px;">
          <div style="background:#1A1A1A;border:1px solid #2A2A2A;padding:20px;text-align:center;border-top:3px solid #C9A24A;">
            <p style="margin:0 0 4px;color:#666;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Hora</p>
            <p style="margin:0;color:#C9A24A;font-size:22px;font-weight:bold;">{reservation.reservation_time}</p>
          </div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- CUSTOMER DATA -->
  <tr><td style="padding:24px 36px 8px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #222;color:#999;font-size:13px;width:45%;">Nombre</td>
        <td style="padding:14px 0;border-bottom:1px solid #222;color:#E5E5E5;text-align:right;font-size:13px;font-weight:bold;">{reservation.customer_name}</td>
      </tr>
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #222;color:#999;font-size:13px;">Telefono</td>
        <td style="padding:14px 0;border-bottom:1px solid #222;color:#E5E5E5;text-align:right;font-size:13px;">{reservation.customer_phone}</td>
      </tr>
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #222;color:#999;font-size:13px;">Email</td>
        <td style="padding:14px 0;border-bottom:1px solid #222;color:#AAA;text-align:right;font-size:13px;">{reservation.customer_email or '-'}</td>
      </tr>
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #222;color:#999;font-size:13px;">Personas</td>
        <td style="padding:14px 0;border-bottom:1px solid #222;color:#E5E5E5;text-align:right;font-size:20px;font-weight:bold;">{reservation.guests} <span style="font-size:13px;color:#666;">pax</span></td>
      </tr>
      {tasting_row}
    </table>
  </td></tr>

  <!-- ALLERGIES / OBSERVATIONS -->
  {f'<tr><td style="padding:0 36px 8px;">{allergy_block}{obs_block}</td></tr>' if (reservation.tasting_allergies or reservation.observations) else ''}

  <!-- FOOTER -->
  <tr><td style="padding:20px 36px;border-top:1px solid #1E1E1E;text-align:center;">
    <p style="margin:0 0 4px;color:#555;font-size:11px;">{RESTAURANT_NAME} &bull; {RESTAURANT_PHONE}</p>
    <p style="margin:0;color:#444;font-size:10px;">{RESTAURANT_ADDRESS}</p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>"""


# ========================
# AUTH
# ========================
def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    if credentials.username != ADMIN_USER or credentials.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Credenciales inválidas", headers={"WWW-Authenticate": "Basic"})
    return credentials.username


def get_client_confirmation_email(reservation: Reservation) -> str:
    """Email de confirmação para o cliente - design premium"""
    tasting_row = ""
    if reservation.has_tasting_menu:
        price = f"EUR {reservation.estimated_value:.2f}" if reservation.estimated_value > 0 else ""
        tasting_row = f'''<tr>
          <td style="padding:14px 0;border-bottom:1px solid #222;color:#999;font-size:13px;">Menu Degustacion</td>
          <td style="padding:14px 0;border-bottom:1px solid #222;color:#C9A24A;text-align:right;font-size:13px;font-weight:bold;">Premium {price}</td>
        </tr>'''
    discount_row = ""
    if reservation.has_discount:
        discount_row = '''<tr>
          <td colspan="2" style="padding:12px 0;color:#C9A24A;font-size:12px;text-align:center;">
            &#10003; Descuento 10% aplicado (Martes a Jueves)
          </td>
        </tr>'''
    obs_block = ""
    if reservation.observations:
        obs_block = f'''<tr><td colspan="2" style="padding:0 0 20px;">
          <div style="background-color:#1A1A0F;border-left:3px solid #C9A24A;padding:12px 16px;">
            <p style="margin:0 0 4px;color:#C9A24A;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Observaciones</p>
            <p style="margin:0;color:#CCC;font-size:13px;">{reservation.observations}</p>
          </div>
        </td></tr>'''

    return f"""<!DOCTYPE html><html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Reserva Confirmada - Kaiso Sushi</title></head>
<body style="margin:0;padding:0;background-color:#0A0A0A;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0A0A0A;">
<tr><td align="center" style="padding:24px 12px;">
<table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background-color:#111;border:1px solid #222;">

  <!-- HEADER -->
  <tr><td style="padding:36px 36px 28px;text-align:center;background-color:#0D0D0D;border-bottom:2px solid #C9A24A;">
    <img src="https://kaisosushiespanha.com/assets/logo-kaiso.png" alt="Kaiso Sushi" width="110" style="display:block;margin:0 auto 20px;max-width:110px;">
    <div style="display:inline-block;background-color:#1A1A0F;border:1px solid #C9A24A;padding:6px 20px;margin-bottom:16px;">
      <p style="margin:0;color:#C9A24A;font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:3px;">&#10003; Reserva Confirmada</p>
    </div>
    <h1 style="margin:0 0 8px;color:#E5E5E5;font-size:22px;font-weight:normal;">Hola, {reservation.customer_name}!</h1>
    <p style="margin:0;color:#666;font-size:14px;">Tu reserva en Kaiso Sushi ha sido confirmada.</p>
  </td></tr>

  <!-- DATE/TIME TICKET -->
  <tr><td style="padding:28px 36px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0D0D0D;border:1px solid #2A2A2A;">
      <tr>
        <td style="padding:24px;text-align:center;border-right:1px solid #2A2A2A;width:50%;">
          <p style="margin:0 0 6px;color:#666;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Fecha</p>
          <p style="margin:0;color:#C9A24A;font-size:24px;font-weight:bold;">{reservation.reservation_date}</p>
        </td>
        <td style="padding:24px;text-align:center;width:50%;">
          <p style="margin:0 0 6px;color:#666;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Hora</p>
          <p style="margin:0;color:#C9A24A;font-size:24px;font-weight:bold;">{reservation.reservation_time}</p>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding:16px 24px;border-top:1px solid #1A1A1A;text-align:center;background-color:#0A0A0A;">
          <p style="margin:0;color:#888;font-size:13px;">
            <span style="color:#C9A24A;font-weight:bold;font-size:18px;">{reservation.guests}</span>
            &nbsp;persona{'s' if reservation.guests != 1 else ''} &nbsp;&bull;&nbsp; {RESTAURANT_NAME}
          </p>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- DETAILS -->
  <tr><td style="padding:20px 36px 8px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      {tasting_row}
      {discount_row}
      {obs_block}
    </table>
  </td></tr>

  <!-- WHATSAPP CTA -->
  <tr><td style="padding:8px 36px 24px;text-align:center;">
    <table cellpadding="0" cellspacing="0" border="0" align="center">
      <tr><td style="background-color:#25D366;padding:14px 32px;">
        <a href="https://wa.me/34673036835" style="color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:2px;">
          &#128172; Contactar por WhatsApp
        </a>
      </td></tr>
    </table>
    <p style="margin:12px 0 0;color:#555;font-size:11px;">Para cambios o cancelaciones contacte con nosotros</p>
  </td></tr>

  <!-- ADDRESS -->
  <tr><td style="padding:20px 36px;border-top:1px solid #1A1A1A;text-align:center;">
    <p style="margin:0 0 4px;color:#555;font-size:12px;font-weight:bold;">{RESTAURANT_NAME}</p>
    <p style="margin:0 0 4px;color:#444;font-size:11px;">{RESTAURANT_ADDRESS}</p>
    <p style="margin:0;color:#444;font-size:11px;">{RESTAURANT_PHONE}</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>"""


# ========================
# API ROUTES - PUBLIC
# ========================
@api_router.get("/")
async def root():
    return {"message": "Kaisō Sushi Reservation API", "status": "online"}

@api_router.get("/health")
async def health_check():
    return {"status": "ok"}

@api_router.get("/admin/test-email")
async def test_email(token: str = ""):
    """Testa configuração SMTP - aceder com ?token=<ADMIN_PASSWORD>"""
    if not token or token != ADMIN_PASSWORD:
        return {"error": "Adicione ?token=SUA_PASSWORD_ADMIN ao URL"}
    config_status = {
        "RESEND_API_KEY": "SET" if RESEND_API_KEY else "MISSING",
        "ADMIN_EMAIL_FROM": ADMIN_EMAIL_FROM or "MISSING",
        "NOTIFY_TO": NOTIFY_TO or "MISSING",
    }
    if not RESEND_API_KEY:
        return {"success": False, "config": config_status, "error": "RESEND_API_KEY nao configurada"}
    try:
        html = f"<h2>Teste SMTP - Kaiso Sushi</h2><p>Enviado em {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>"
        await send_email(NOTIFY_TO, "Teste Email - Kaiso Sushi", html)
        return {"success": True, "config": config_status, "sent_to": NOTIFY_TO, "message": "Email enviado! Verifique a caixa de entrada e pasta spam."}
    except Exception as e:
        return {"success": False, "config": config_status, "error": str(e)}

@api_router.get("/debug/email-config")
async def debug_email_config():
    """Temporary debug endpoint - remove after fixing"""
    return {
        "smtp_host": SMTP_HOST,
        "smtp_port": SMTP_PORT,
        "smtp_user": SMTP_USER[:5] + "..." if SMTP_USER else None,
        "smtp_pass_set": bool(SMTP_PASS),
        "admin_email_from": ADMIN_EMAIL_FROM,
        "notify_to": NOTIFY_TO,
        "cc_to": CC_TO,
    }

@api_router.post("/debug/test-email")
async def debug_test_email():
    """Temporary debug endpoint - sends test email"""
    try:
        result = await send_email(
            NOTIFY_TO,
            "TESTE - Kaisō Sushi Email",
            "<h1>Teste de Email</h1><p>Email enviado com sucesso do Render!</p>",
        )
        if result:
            return {"status": "sent", "to": NOTIFY_TO}
        else:
            return {"status": "failed", "message": "send_email returned False - check logs"}
    except Exception as e:
        return {"status": "error", "error": str(e)}

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
    lunch_slots = generate_time_slots(schedule["lunch"][0], schedule["lunch"][1], buffer_minutes=LAST_RESERVATION_BUFFER)
    dinner_slots = generate_time_slots(schedule["dinner"][0], schedule["dinner"][1], buffer_minutes=LAST_RESERVATION_BUFFER)
    
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
    lunch_slots = generate_time_slots(schedule["lunch"][0], schedule["lunch"][1], buffer_minutes=LAST_RESERVATION_BUFFER)
    dinner_slots = generate_time_slots(schedule["dinner"][0], schedule["dinner"][1], buffer_minutes=LAST_RESERVATION_BUFFER)
    all_slots = lunch_slots + dinner_slots
    
    if input.reservation_time not in all_slots:
        raise HTTPException(status_code=400, detail=f"Horario no disponible. Horarios válidos: {all_slots}")
    
    # Validar degustação
    if input.has_tasting_menu:
        if not is_tasting_available(input.reservation_date, input.reservation_time):
            raise HTTPException(status_code=400, detail="Rodízio Premium solo disponible Martes-Jueves, 20:00-22:30")
    
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

        # Send WhatsApp to customer
        await send_whatsapp_notification(reservation.customer_phone, {
            "customer_name": reservation.customer_name,
            "reservation_date": reservation.reservation_date,
            "reservation_time": reservation.reservation_time,
            "guests": reservation.guests
        })
    
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

_Enviado desde kaisosushiespanha.com_"""
    
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

    # Send emails + WhatsApp in background
    async def send_notifications_background():
        # Notify restaurant via email
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

        # Send WhatsApp to customer
        await send_whatsapp_notification(reservation.customer_phone, doc)

    asyncio.create_task(send_notifications_background())

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


# ========================
# WHATSAPP ENDPOINTS
# ========================
async def send_whatsapp_notification(phone: str, reservation_data: dict):
    """Send WhatsApp notification via local WhatsApp service"""
    try:
        message = f"""*RESERVA CONFIRMADA - Kaisō Sushi*

Nombre: {reservation_data.get('customer_name', '')}
Fecha: {reservation_data.get('reservation_date', '')}
Hora: {reservation_data.get('reservation_time', '')}
Personas: {reservation_data.get('guests', '')}

Le esperamos! Para cualquier cambio, contacte:
{RESTAURANT_PHONE}

_{RESTAURANT_NAME}_
_{RESTAURANT_ADDRESS}_"""

        async with httpx.AsyncClient(timeout=10) as client_http:
            resp = await client_http.post(f"{WHATSAPP_SERVICE_URL}/send", json={
                "phone": phone,
                "message": message
            })
            if resp.status_code == 200:
                logger.info(f"WhatsApp enviado para {phone}")
                return True
            else:
                logger.warning(f"WhatsApp falhou para {phone}: {resp.text}")
                return False
    except Exception as e:
        logger.error(f"Erro WhatsApp: {e}")
        return False

@api_router.get("/admin/whatsapp/status")
async def whatsapp_status(credentials: HTTPBasicCredentials = Depends(verify_admin)):
    """Get WhatsApp connection status"""
    import os

    # First try to reach the service
    try:
        async with httpx.AsyncClient(timeout=5) as client_http:
            resp = await client_http.get(f"{WHATSAPP_SERVICE_URL}/status")
            return resp.json()
    except Exception as e:
        # Service not responding - try to start it
        wa_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "whatsapp-service")
        pid_file = os.path.join(wa_dir, "whatsapp.pid")

        # Check if process is dead
        if os.path.exists(pid_file):
            try:
                pid = int(open(pid_file).read().strip())
                os.kill(pid, 0)
            except (OSError, ValueError):
                os.remove(pid_file)

        # Try to restart
        await start_whatsapp_service()
        await asyncio.sleep(4)

        try:
            async with httpx.AsyncClient(timeout=5) as client_http:
                resp = await client_http.get(f"{WHATSAPP_SERVICE_URL}/status")
                return resp.json()
        except:
            pass

        local_node = os.path.join(wa_dir, "node", "bin", "node")
        return {
            "status": "offline",
            "error": str(e),
            "node_available": bool(shutil.which("node")) or os.path.exists(local_node),
            "wa_dir_exists": os.path.exists(wa_dir),
            "index_exists": os.path.exists(os.path.join(wa_dir, "index.mjs")),
            "node_modules_exists": os.path.exists(os.path.join(wa_dir, "node_modules")),
            "local_node_exists": os.path.exists(local_node),
        }

@api_router.post("/admin/whatsapp/reset")
async def whatsapp_reset(credentials: HTTPBasicCredentials = Depends(verify_admin)):
    """Reset WhatsApp connection"""
    try:
        async with httpx.AsyncClient(timeout=10) as client_http:
            resp = await client_http.post(f"{WHATSAPP_SERVICE_URL}/reset")
            return resp.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/whatsapp/reconnect")
async def whatsapp_reconnect(credentials: HTTPBasicCredentials = Depends(verify_admin)):
    """Reconnect WhatsApp"""
    try:
        async with httpx.AsyncClient(timeout=10) as client_http:
            resp = await client_http.post(f"{WHATSAPP_SERVICE_URL}/reconnect")
            return resp.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/whatsapp/send-test")
async def whatsapp_send_test(
    credentials: HTTPBasicCredentials = Depends(verify_admin)
):
    """Send a test message to verify connection"""
    try:
        async with httpx.AsyncClient(timeout=10) as client_http:
            resp = await client_http.post(f"{WHATSAPP_SERVICE_URL}/send", json={
                "phone": RESTAURANT_PHONE,
                "message": "Teste de conexao WhatsApp - Kaiso Sushi"
            })
            return resp.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Include router
app.include_router(api_router)

@app.on_event("startup")
async def check_config():
    """Log warnings for missing critical configuration"""
    if RESEND_API_KEY:
        logger.info(f"✅ Resend API configurada → notificacoes ativas para {NOTIFY_TO}")
    else:
        logger.warning("⚠️  RESEND_API_KEY nao configurada - emails desativados. Adicione no Render → Environment Variables")

@app.on_event("startup")
async def start_whatsapp_service():
    """Start the WhatsApp Node.js service as independent process"""
    global whatsapp_process
    import os, shutil, platform, tarfile, urllib.request

    wa_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "whatsapp-service")
    index_file = os.path.join(wa_dir, "index.mjs")
    nm_dir = os.path.join(wa_dir, "node_modules")
    pid_file = os.path.join(wa_dir, "whatsapp.pid")

    if not os.path.exists(index_file):
        logger.warning(f"WhatsApp service not found at {index_file}")
        return

    # Check if already running via PID file
    if os.path.exists(pid_file):
        try:
            pid = int(open(pid_file).read().strip())
            os.kill(pid, 0)  # Check if process exists
            logger.info(f"WhatsApp service already running (PID: {pid})")
            return
        except (OSError, ValueError):
            # Process not running, clean up PID file
            os.remove(pid_file)

    # Find or install Node.js
    node_path = shutil.which("node")
    local_node = os.path.join(wa_dir, "node", "bin", "node")

    if not node_path and os.path.exists(local_node):
        node_path = local_node

    if not node_path:
        try:
            arch = platform.machine()
            node_arch = "x64" if arch in ("x86_64", "amd64") else "arm64" if arch in ("aarch64", "arm64") else None
            if not node_arch:
                logger.error(f"Unsupported architecture: {arch}")
                return

            node_version = "v20.18.1"
            filename = f"node-{node_version}-linux-{node_arch}"
            url = f"https://nodejs.org/dist/{node_version}/{filename}.tar.xz"
            download_path = os.path.join(wa_dir, f"{filename}.tar.xz")
            extract_dir = os.path.join(wa_dir, "node")

            logger.info(f"Downloading Node.js {node_version} for {node_arch}...")
            urllib.request.urlretrieve(url, download_path)
            os.makedirs(extract_dir, exist_ok=True)
            subprocess.run(["tar", "-xf", download_path, "--strip-components=1", "-C", extract_dir], check=True, timeout=60)
            os.remove(download_path)
            node_path = os.path.join(extract_dir, "bin", "node")
            logger.info(f"Node.js installed at {node_path}")
        except Exception as e:
            logger.error(f"Failed to install Node.js: {e}")
            return

    # Install npm deps if missing
    if not os.path.exists(nm_dir):
        npm_path = shutil.which("npm") or os.path.join(wa_dir, "node", "bin", "npm")
        if os.path.exists(str(npm_path)):
            try:
                env = os.environ.copy()
                env["PATH"] = f"{os.path.dirname(node_path)}:{env.get('PATH', '')}"
                subprocess.run([npm_path, "install", "--production"], cwd=wa_dir, capture_output=True, timeout=120, env=env)
            except Exception as e:
                logger.error(f"npm install failed: {e}")

    if not os.path.exists(nm_dir):
        logger.error("WhatsApp node_modules missing")
        return

    try:
        # Start as DETACHED process - survives backend restarts
        whatsapp_process = subprocess.Popen(
            [node_path, "index.mjs"],
            cwd=wa_dir,
            stdout=open("/tmp/whatsapp.log", "a"),
            stderr=open("/tmp/whatsapp.err", "a"),
            start_new_session=True  # Detach from parent process
        )
        logger.info(f"WhatsApp service started (PID: {whatsapp_process.pid})")
    except Exception as e:
        logger.error(f"Failed to start WhatsApp service: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    # DON'T kill WhatsApp service - it runs independently
    client.close()

# ========================
# SERVE FRONTEND (Production / Render)
# ========================
FRONTEND_BUILD = Path(__file__).parent.parent / "frontend" / "build"

if FRONTEND_BUILD.exists() and (FRONTEND_BUILD / "index.html").exists():
    # Serve static assets (JS, CSS, images, etc.)
    app.mount("/static", StaticFiles(directory=str(FRONTEND_BUILD / "static")), name="static-assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        """Serve React SPA - all non-API routes return index.html"""
        file_path = FRONTEND_BUILD / full_path
        if full_path and file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(FRONTEND_BUILD / "index.html"))
