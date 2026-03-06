# Kaisō Sushi - Product Requirements Document

## Original Problem Statement
Complete rebuild of the Kaisō Sushi website to a premium, luxury-tech standard with reservation system, admin panel, analytics, WhatsApp notifications, and external MongoDB.

## Architecture
- **Frontend:** React, Tailwind CSS, react-router-dom, i18next, recharts
- **Backend:** FastAPI, Pydantic, BackgroundTasks, httpx
- **WhatsApp:** Node.js + Express + @whiskeysockets/baileys (port 8002)
- **Database:** MongoDB Atlas (cluster0.qdzhihd.mongodb.net / kaiso_reservas)
- **Email:** Gmail SMTP via aiosmtplib

## Schedule
- Mon: CLOSED
- Tue-Thu: Lunch 12:00-14:00, Dinner 19:00-23:00
- Fri-Sun: Lunch 13:00-15:30, Dinner 20:00-23:30
- 30-minute buffer before closing (no reservations in last 30min)

## Key Endpoints
- `POST /api/reservations` - Public reservation
- `POST /api/admin/reservations` - Manual reservation (source='manual')
- `GET /api/admin/reservations` - List reservations
- `GET /api/admin/whatsapp/status` - WhatsApp connection status
- `POST /api/admin/whatsapp/reset` - Reset WhatsApp QR
- `POST /api/admin/whatsapp/reconnect` - Reconnect WhatsApp

## Credentials
- Admin/Analytics: admin / reservas
- MongoDB Atlas: leandrosilva0311_db_user @ cluster0.qdzhihd.mongodb.net

## Completed Features
- Full restaurant website with dark luxury theme
- Multi-language reservation system (ES/PT/EN)
- Admin panel with reservation management + manual reservations
- Analytics dashboard with KPIs and charts
- WhatsApp QR code integration (baileys)
- MongoDB Atlas migration (51 reservations + 57 analytics)
- Updated schedule (Fri-Sun lunch 13-15:30, dinner 20-23:30)
- 30-minute buffer before closing
- Bulletproof email HTML (table-based XHTML)
- Performance optimization (BackgroundTasks)

## Backlog
- P1: Test WhatsApp end-to-end on production
- P2: Test admin capacity/date blocking features
- P3: Refactor server.py into modular structure
