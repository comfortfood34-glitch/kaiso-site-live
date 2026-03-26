# Kaisō Sushi - Product Requirements Document

## Original Problem Statement
Complete rebuild of the Kaisō Sushi website to a premium, luxury-tech standard with reservation system, admin panel, analytics, WhatsApp auto-notifications, and external MongoDB. Deploy as a single Docker container on Render.

## Architecture
- **Frontend:** React + Tailwind (built and served by FastAPI in production)
- **Backend:** FastAPI + Pydantic (serves API + static frontend)
- **WhatsApp:** Node.js + baileys (auto-installed, runs as subprocess of backend)
- **Database:** MongoDB Atlas (cluster0.qdzhihd.mongodb.net / kaiso_reservas)
- **Email:** Gmail SMTP via aiosmtplib (BackgroundTasks)
- **Hosting:** Render (Docker Web Service) → https://kaiso-sushi.onrender.com

## Production URLs
- **Site:** https://kaiso-sushi.onrender.com
- **Admin:** https://kaiso-sushi.onrender.com/admin
- **API:** https://kaiso-sushi.onrender.com/api/health

## Schedule
- Mon: CLOSED
- Tue-Thu: Lunch 12:00-14:00, Dinner 19:00-23:00
- Fri-Sun: Lunch 13:00-15:30, Dinner 20:00-23:30
- 30-minute buffer before closing (last reservation 30min before close)

## Credentials
- Admin/Analytics: admin / reservas
- MongoDB Atlas: leandrosilva0311_db_user @ cluster0.qdzhihd.mongodb.net

## Completed Features
- Full restaurant website with dark luxury theme
- Multi-language reservation system (ES/PT/EN)
- Admin panel: view/filter reservations, manual creation, CSV export
- Analytics dashboard with KPIs and charts
- WhatsApp QR code integration with auto-notifications
- MongoDB Atlas (external, secure)
- Bulletproof email HTML (table-based XHTML)
- 30-minute buffer before closing time
- Updated weekend schedule
- Performance optimization (BackgroundTasks)
- Production CORS fix, removeChild bug fix
- Render deployment (Dockerfile, start.sh, render.yaml) ✅ 2026-03-26
- Frontend served by FastAPI for single-container deploy ✅ 2026-03-26
- LIVE on Render: https://kaiso-sushi.onrender.com ✅ 2026-03-26

## Key Deployment Files
- `/app/Dockerfile` - Multi-stage build (frontend + backend + WhatsApp)
- `/app/deploy/start.sh` - Generates .env from Render env vars, starts uvicorn
- `/app/render.yaml` - Render Infrastructure-as-Code
- `/app/DEPLOY_GUIDE.md` - Step-by-step guide

## Backlog
- P1: Test admin capacity adjustment and date blocking features in production
- P1: Configure custom domain (kaisosushicordoba.com) on Render
- P2: Refactor server.py into modular structure (1100+ lines)
- P2: Upgrade Render plan from Free to Starter ($7/mês) to avoid sleep mode
