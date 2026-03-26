# Kaisō Sushi - Product Requirements Document

## Original Problem Statement
Complete rebuild of the Kaisō Sushi website to a premium, luxury-tech standard with reservation system, admin panel, analytics, WhatsApp auto-notifications, and external MongoDB. Deploy as a single Docker container on Render.

## Architecture
- **Frontend:** React + Tailwind (built and served by FastAPI in production)
- **Backend:** FastAPI + Pydantic (serves API + static frontend)
- **WhatsApp:** Node.js + baileys (auto-installed, runs as subprocess of backend)
- **Database:** MongoDB Atlas (cluster0.qdzhihd.mongodb.net / kaiso_reservas)
- **Email:** Gmail SMTP via aiosmtplib (BackgroundTasks)
- **Hosting:** Render (Docker Web Service)
- **Domain:** kaisosushiespanha.com (Cloudflare DNS → Render)

## Production URLs
- **Site:** https://kaisosushiespanha.com
- **WWW:** https://www.kaisosushiespanha.com (redirects to root)
- **Admin:** https://kaisosushiespanha.com/admin
- **API:** https://kaisosushiespanha.com/api/health
- **Render:** https://kaiso-sushi.onrender.com

## Credentials
- Admin/Analytics: admin / reservas

## Completed Features (All Tested ✅)
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
- Render deployment (Docker single-container) ✅ 2026-03-26
- Custom domain kaisosushiespanha.com with SSL ✅ 2026-03-26
- Full production testing passed (iteration_7) ✅ 2026-03-26

## Backlog
- P1: Scan WhatsApp QR in admin to activate notifications
- P2: Refactor server.py into modular structure (1100+ lines)
- P2: Upgrade Render plan from Free to Starter ($7/mês) to avoid sleep mode
