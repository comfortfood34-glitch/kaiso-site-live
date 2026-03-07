# Kaisō Sushi - Product Requirements Document

## Original Problem Statement
Complete rebuild of the Kaisō Sushi website to a premium, luxury-tech standard with reservation system, admin panel, analytics, WhatsApp auto-notifications, and external MongoDB.

## Architecture
- **Frontend:** React + Tailwind → Cloudflare (kaisosushiespanha.com)
- **Backend:** FastAPI + Pydantic → Emergent (kaiso-premium.emergent.host)
- **WhatsApp:** Node.js + baileys (auto-installed, runs as subprocess of backend)
- **Database:** MongoDB Atlas (cluster0.qdzhihd.mongodb.net / kaiso_reservas)
- **Email:** Gmail SMTP via aiosmtplib (BackgroundTasks)
- **Code:** GitHub repository

## Schedule
- Mon: CLOSED
- Tue-Thu: Lunch 12:00-14:00, Dinner 19:00-23:00
- Fri-Sun: Lunch 13:00-15:30, Dinner 20:00-23:30
- 30-minute buffer before closing (last reservation 30min before close)

## Credentials
- Admin/Analytics: admin / reservas
- MongoDB Atlas: leandrosilva0311_db_user @ cluster0.qdzhihd.mongodb.net

## Completed Features (All Tested & Live on Production)
- Full restaurant website with dark luxury theme
- Multi-language reservation system (ES/PT/EN)
- Admin panel: view/filter reservations, manual creation, CSV export
- Analytics dashboard with KPIs and charts
- WhatsApp QR code integration with auto-notifications ✅ LIVE
- MongoDB Atlas (external, secure)
- Bulletproof email HTML (table-based XHTML)
- 30-minute buffer before closing time
- Updated weekend schedule
- Performance optimization (BackgroundTasks)
- Production CORS fix, removeChild bug fix

## Deployment Process
1. "Save to Github" → updates frontend on Cloudflare
2. "Deploy" → updates backend on Emergent (kaiso-premium.emergent.host)
3. Both steps needed for full production update

## Backlog
- P1: Test admin capacity adjustment and date blocking features
- P2: Refactor server.py into modular structure (1100+ lines)
