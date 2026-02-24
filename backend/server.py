from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Restaurant Configuration
RESTAURANT_NAME = "Kaisō Sushi España"
RESTAURANT_EMAIL = "grupokaiso@kaisosushiespanha.com"
RESTAURANT_CAPACITY = 40  # Max people per time slot

# Time slots configuration
LUNCH_SLOTS = ["12:30", "13:00", "13:30", "14:00", "14:30", "15:00"]
DINNER_SLOTS = ["20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00"]
TIME_SLOTS = LUNCH_SLOTS + DINNER_SLOTS

# SMTP Configuration
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "grupokaiso@kaisosushiespanha.com"
SMTP_PASSWORD = "qmohkrspsqdrjmc"

# Create the main app
app = FastAPI(title="Kaisō Sushi Reservation System")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============== MODELS ==============

class ReservationCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=100)
    customer_email: EmailStr
    customer_phone: str = Field(..., min_length=9, max_length=20)
    guests: int = Field(..., ge=1, le=20)
    reservation_date: str  # Format: YYYY-MM-DD
    reservation_time: str  # Format: HH:MM
    observations: Optional[str] = Field(default="", max_length=500)

class Reservation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_email: str
    customer_phone: str
    guests: int
    reservation_date: str
    reservation_time: str
    observations: str = ""
    status: str = "confirmed"  # confirmed, cancelled
    cancel_token: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TimeSlotAvailability(BaseModel):
    time: str
    available_capacity: int
    is_available: bool
    period: str  # lunch or dinner

class DayAvailability(BaseModel):
    date: str
    lunch_slots: List[TimeSlotAvailability]
    dinner_slots: List[TimeSlotAvailability]


# ============== EMAIL FUNCTIONS ==============

async def send_email(to_email: str, subject: str, html_content: str):
    """Send email using Gmail SMTP"""
    try:
        message = MIMEMultipart("alternative")
        message["From"] = f"{RESTAURANT_NAME} <{SMTP_USER}>"
        message["To"] = to_email
        message["Subject"] = subject
        
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            start_tls=True,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
        )
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def get_customer_confirmation_email(reservation: Reservation, cancel_url: str) -> str:
    """Generate HTML email for customer confirmation"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: 'Montserrat', Arial, sans-serif; background-color: #0A0A0A; color: #E5E5E5; margin: 0; padding: 40px 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #121212; border: 1px solid #2A2A2A; padding: 40px; }}
            .header {{ text-align: center; border-bottom: 1px solid #C9A24A; padding-bottom: 30px; margin-bottom: 30px; }}
            .logo {{ font-family: 'Playfair Display', Georgia, serif; font-size: 32px; color: #C9A24A; margin: 0; }}
            .subtitle {{ color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin-top: 10px; }}
            h2 {{ font-family: 'Playfair Display', Georgia, serif; color: #C9A24A; font-weight: 400; }}
            .details {{ background-color: #1A1A1A; padding: 25px; margin: 20px 0; border-left: 3px solid #C9A24A; }}
            .detail-row {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #2A2A2A; }}
            .detail-row:last-child {{ border-bottom: none; }}
            .label {{ color: #888; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }}
            .value {{ color: #E5E5E5; font-weight: 500; }}
            .cancel-btn {{ display: inline-block; background-color: transparent; border: 1px solid #7F1D1D; color: #E5E5E5; padding: 15px 30px; text-decoration: none; text-transform: uppercase; font-size: 11px; letter-spacing: 2px; margin-top: 30px; }}
            .cancel-btn:hover {{ background-color: #7F1D1D; }}
            .footer {{ text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #2A2A2A; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="logo">Kaisō</h1>
                <p class="subtitle">Sushi & Japanese Cuisine</p>
            </div>
            
            <h2>Reserva Confirmada</h2>
            <p>Estimado/a {reservation.customer_name},</p>
            <p>Su reserva ha sido confirmada con éxito. A continuación, los detalles:</p>
            
            <div class="details">
                <div class="detail-row">
                    <span class="label">Fecha</span>
                    <span class="value">{reservation.reservation_date}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Hora</span>
                    <span class="value">{reservation.reservation_time}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Personas</span>
                    <span class="value">{reservation.guests}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Teléfono</span>
                    <span class="value">{reservation.customer_phone}</span>
                </div>
                {f'<div class="detail-row"><span class="label">Observaciones</span><span class="value">{reservation.observations}</span></div>' if reservation.observations else ''}
            </div>
            
            <p>Si necesita cancelar su reserva, haga clic en el siguiente enlace:</p>
            <a href="{cancel_url}" class="cancel-btn">Cancelar Reserva</a>
            
            <div class="footer">
                <p>{RESTAURANT_NAME}</p>
                <p>Le esperamos con mucho gusto</p>
            </div>
        </div>
    </body>
    </html>
    """

def get_restaurant_notification_email(reservation: Reservation) -> str:
    """Generate HTML email for restaurant notification"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            h1 {{ color: #C9A24A; border-bottom: 2px solid #C9A24A; padding-bottom: 15px; }}
            .alert {{ background-color: #C9A24A; color: #000; padding: 15px; font-weight: bold; text-align: center; margin-bottom: 20px; }}
            table {{ width: 100%; border-collapse: collapse; }}
            th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }}
            th {{ background-color: #f8f8f8; color: #333; width: 40%; }}
            .observations {{ background-color: #fff3cd; padding: 15px; margin-top: 20px; border-left: 4px solid #ffc107; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="alert">NUEVA RESERVA</div>
            <h1>Detalles de la Reserva</h1>
            
            <table>
                <tr>
                    <th>Cliente</th>
                    <td><strong>{reservation.customer_name}</strong></td>
                </tr>
                <tr>
                    <th>Email</th>
                    <td>{reservation.customer_email}</td>
                </tr>
                <tr>
                    <th>Teléfono</th>
                    <td>{reservation.customer_phone}</td>
                </tr>
                <tr>
                    <th>Fecha</th>
                    <td><strong>{reservation.reservation_date}</strong></td>
                </tr>
                <tr>
                    <th>Hora</th>
                    <td><strong>{reservation.reservation_time}</strong></td>
                </tr>
                <tr>
                    <th>Personas</th>
                    <td><strong>{reservation.guests}</strong></td>
                </tr>
                <tr>
                    <th>ID Reserva</th>
                    <td>{reservation.id}</td>
                </tr>
            </table>
            
            {f'<div class="observations"><strong>Observaciones:</strong><br>{reservation.observations}</div>' if reservation.observations else ''}
        </div>
    </body>
    </html>
    """

def get_cancellation_email(reservation: Reservation) -> str:
    """Generate HTML email for cancellation confirmation"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: 'Montserrat', Arial, sans-serif; background-color: #0A0A0A; color: #E5E5E5; margin: 0; padding: 40px 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #121212; border: 1px solid #2A2A2A; padding: 40px; }}
            .header {{ text-align: center; border-bottom: 1px solid #7F1D1D; padding-bottom: 30px; margin-bottom: 30px; }}
            .logo {{ font-family: 'Playfair Display', Georgia, serif; font-size: 32px; color: #C9A24A; margin: 0; }}
            h2 {{ color: #7F1D1D; }}
            .details {{ background-color: #1A1A1A; padding: 25px; margin: 20px 0; border-left: 3px solid #7F1D1D; }}
            .footer {{ text-align: center; margin-top: 40px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="logo">Kaisō</h1>
            </div>
            <h2>Reserva Cancelada</h2>
            <p>Estimado/a {reservation.customer_name},</p>
            <p>Su reserva ha sido cancelada exitosamente.</p>
            <div class="details">
                <p><strong>Fecha:</strong> {reservation.reservation_date}</p>
                <p><strong>Hora:</strong> {reservation.reservation_time}</p>
                <p><strong>Personas:</strong> {reservation.guests}</p>
            </div>
            <p>Si desea hacer una nueva reserva, visite nuestro sitio web.</p>
            <div class="footer">
                <p>Esperamos verle pronto en {RESTAURANT_NAME}</p>
            </div>
        </div>
    </body>
    </html>
    """


# ============== API ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "Kaisō Sushi Reservation API", "status": "online"}

@api_router.get("/config")
async def get_config():
    """Get restaurant configuration"""
    return {
        "restaurant_name": RESTAURANT_NAME,
        "capacity_per_slot": RESTAURANT_CAPACITY,
        "lunch_slots": LUNCH_SLOTS,
        "dinner_slots": DINNER_SLOTS,
        "time_slots": TIME_SLOTS
    }

@api_router.get("/reservations/availability/{date_str}", response_model=DayAvailability)
async def get_availability(date_str: str):
    """Get availability for a specific date"""
    try:
        # Validate date format
        datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Get all confirmed reservations for this date
    reservations = await db.reservations.find({
        "reservation_date": date_str,
        "status": "confirmed"
    }, {"_id": 0}).to_list(1000)
    
    # Calculate capacity used per time slot
    capacity_used = {}
    for res in reservations:
        time = res["reservation_time"]
        capacity_used[time] = capacity_used.get(time, 0) + res["guests"]
    
    # Build availability response
    lunch_slots = []
    dinner_slots = []
    
    for time in LUNCH_SLOTS:
        used = capacity_used.get(time, 0)
        available = RESTAURANT_CAPACITY - used
        lunch_slots.append(TimeSlotAvailability(
            time=time,
            available_capacity=available,
            is_available=available > 0,
            period="lunch"
        ))
    
    for time in DINNER_SLOTS:
        used = capacity_used.get(time, 0)
        available = RESTAURANT_CAPACITY - used
        dinner_slots.append(TimeSlotAvailability(
            time=time,
            available_capacity=available,
            is_available=available > 0,
            period="dinner"
        ))
    
    return DayAvailability(
        date=date_str,
        lunch_slots=lunch_slots,
        dinner_slots=dinner_slots
    )

@api_router.post("/reservations", response_model=Reservation)
async def create_reservation(input: ReservationCreate):
    """Create a new reservation"""
    # Validate time slot
    if input.reservation_time not in TIME_SLOTS:
        raise HTTPException(status_code=400, detail=f"Invalid time slot. Available slots: {TIME_SLOTS}")
    
    # Check availability
    existing = await db.reservations.find({
        "reservation_date": input.reservation_date,
        "reservation_time": input.reservation_time,
        "status": "confirmed"
    }, {"_id": 0}).to_list(1000)
    
    current_capacity = sum(r["guests"] for r in existing)
    
    if current_capacity + input.guests > RESTAURANT_CAPACITY:
        available = RESTAURANT_CAPACITY - current_capacity
        raise HTTPException(
            status_code=400, 
            detail=f"Not enough capacity. Available: {available} people for this time slot"
        )
    
    # Create reservation
    reservation = Reservation(**input.model_dump())
    
    # Save to database
    doc = reservation.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.reservations.insert_one(doc)
    
    # Generate cancel URL (use frontend URL)
    frontend_url = os.environ.get('FRONTEND_URL', 'https://server-bridge-3.preview.emergentagent.com')
    cancel_url = f"{frontend_url}/cancel/{reservation.cancel_token}"
    
    # Send emails (don't block on failures)
    try:
        # Email to customer
        await send_email(
            reservation.customer_email,
            f"Confirmación de Reserva - {RESTAURANT_NAME}",
            get_customer_confirmation_email(reservation, cancel_url)
        )
        
        # Email to restaurant
        await send_email(
            RESTAURANT_EMAIL,
            f"Nueva Reserva: {reservation.customer_name} - {reservation.reservation_date} {reservation.reservation_time}",
            get_restaurant_notification_email(reservation)
        )
    except Exception as e:
        logger.error(f"Email sending failed: {str(e)}")
    
    return reservation

@api_router.get("/reservations", response_model=List[Reservation])
async def get_reservations(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    status: Optional[str] = None
):
    """Get all reservations (admin endpoint)"""
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
    
    # Convert datetime strings back to datetime objects
    for res in reservations:
        if isinstance(res.get('created_at'), str):
            res['created_at'] = datetime.fromisoformat(res['created_at'])
    
    # Sort by date and time
    reservations.sort(key=lambda x: (x['reservation_date'], x['reservation_time']))
    
    return reservations

@api_router.get("/reservations/by-token/{cancel_token}", response_model=Reservation)
async def get_reservation_by_token(cancel_token: str):
    """Get reservation by cancel token"""
    reservation = await db.reservations.find_one({"cancel_token": cancel_token}, {"_id": 0})
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if isinstance(reservation.get('created_at'), str):
        reservation['created_at'] = datetime.fromisoformat(reservation['created_at'])
    
    return reservation

@api_router.post("/reservations/cancel/{cancel_token}")
async def cancel_reservation(cancel_token: str):
    """Cancel a reservation using the cancel token"""
    reservation = await db.reservations.find_one({"cancel_token": cancel_token}, {"_id": 0})
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if reservation["status"] == "cancelled":
        raise HTTPException(status_code=400, detail="Reservation already cancelled")
    
    # Update status
    await db.reservations.update_one(
        {"cancel_token": cancel_token},
        {"$set": {"status": "cancelled"}}
    )
    
    # Send cancellation email to customer
    reservation_obj = Reservation(**reservation)
    try:
        await send_email(
            reservation_obj.customer_email,
            f"Reserva Cancelada - {RESTAURANT_NAME}",
            get_cancellation_email(reservation_obj)
        )
    except Exception as e:
        logger.error(f"Cancellation email failed: {str(e)}")
    
    return {"message": "Reservation cancelled successfully", "id": reservation["id"]}

@api_router.delete("/reservations/{reservation_id}")
async def admin_cancel_reservation(reservation_id: str):
    """Admin: Cancel a reservation by ID"""
    result = await db.reservations.update_one(
        {"id": reservation_id},
        {"$set": {"status": "cancelled"}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    return {"message": "Reservation cancelled", "id": reservation_id}

@api_router.get("/reservations/stats")
async def get_reservation_stats():
    """Get reservation statistics"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Total confirmed reservations
    total_confirmed = await db.reservations.count_documents({"status": "confirmed"})
    
    # Today's reservations
    today_reservations = await db.reservations.count_documents({
        "reservation_date": today,
        "status": "confirmed"
    })
    
    # Today's guests
    today_guests_cursor = db.reservations.aggregate([
        {"$match": {"reservation_date": today, "status": "confirmed"}},
        {"$group": {"_id": None, "total": {"$sum": "$guests"}}}
    ])
    today_guests_result = await today_guests_cursor.to_list(1)
    today_guests = today_guests_result[0]["total"] if today_guests_result else 0
    
    # This week's reservations
    from datetime import timedelta
    week_start = (datetime.now(timezone.utc) - timedelta(days=datetime.now(timezone.utc).weekday())).strftime("%Y-%m-%d")
    week_end = (datetime.now(timezone.utc) + timedelta(days=6-datetime.now(timezone.utc).weekday())).strftime("%Y-%m-%d")
    
    week_reservations = await db.reservations.count_documents({
        "reservation_date": {"$gte": week_start, "$lte": week_end},
        "status": "confirmed"
    })
    
    return {
        "total_confirmed": total_confirmed,
        "today_reservations": today_reservations,
        "today_guests": today_guests,
        "week_reservations": week_reservations,
        "today_date": today
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
