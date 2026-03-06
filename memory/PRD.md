# Kaisō Sushi - Product Requirements Document

## Original Problem Statement
Complete rebuild of the Kaisō Sushi website to a premium, luxury-tech standard. A comprehensive reservation system with complex business rules, a password-protected admin panel, analytics dashboard, and manual reservation management for staff.

## Aesthetic
- Dark theme (#050608) with gold (#C9A24A) and red (#D11B2A) accents
- Multilingual: Spanish, Portuguese, English

## Core Features

### Reservation System
- Hard limit of 30 diners/day, complex time slots, automatic discounts
- Premium tasting menu option (Tue-Thu, 19:00-21:00)
- Confirmation via WhatsApp + background email
- 30-minute buffer before closing time (no reservations in last 30min)

### Schedule
- Mon: CLOSED
- Tue-Thu: Lunch 12:00-14:00, Dinner 19:00-23:00
- Fri-Sun: Lunch 13:00-15:30, Dinner 20:00-23:30

### Admin Panel (`/admin`) - Credentials: admin/reservas
- View/filter reservations by date and status
- Manual reservation creation (for phone-in customers)
- Adjust daily capacity
- Block specific dates
- Export reservations as CSV
- Source column differentiates Manual vs Online reservations

### Analytics Panel (`/analytics`) - Credentials: admin/reservas
- Track site visits, reservation funnel, conversion rates
- Daily/hourly charts, device/language breakdowns

### Email Notifications
- Table-based HTML (XHTML Transitional) for maximum email client compatibility
- Logo URL: kaisosushiespanha.com/assets/logo-kaiso.png
- Both restaurant notification and client confirmation emails
- Sent via BackgroundTasks for performance

## Architecture
- **Frontend:** React, Tailwind CSS, react-router-dom, i18next, recharts
- **Backend:** FastAPI, Pydantic, BackgroundTasks for async emails
- **Database:** MongoDB
- **Email:** Gmail SMTP via aiosmtplib

## Key Endpoints
- `POST /api/reservations` - Public reservation creation
- `POST /api/admin/reservations` - Manual reservation (bypasses checks, source='manual')
- `GET /api/admin/reservations` - List reservations with filters
- `PATCH /api/admin/reservations/{id}` - Update reservation status
- `GET /api/admin/stats` - Dashboard statistics
- `POST /api/analytics/track` - Track analytics events
- `GET /api/analytics/stats` - Analytics dashboard data

## Completed Features
- Full restaurant website with dark luxury theme
- Multi-language reservation system (ES/PT/EN)
- Admin panel with reservation management
- Analytics dashboard with KPIs and charts
- Performance optimization (BackgroundTasks for emails)
- Production CORS fix for kaisosushiespanha.com
- removeChild React bug fix (conditional rendering refactor)
- Updated restaurant schedule & Google Maps embed
- Removed "Made with Emergent" badge
- Manual reservation form in admin panel (Feb 2026)
- Updated weekend schedule: Fri-Sun lunch 13:00-15:30, dinner 20:00-23:30 (Mar 2026)
- 30-minute buffer before closing time for reservations (Mar 2026)
- Bulletproof email HTML (table-based XHTML, no divs/gradients) (Mar 2026)
- Fixed logo URL in emails to use production domain (Mar 2026)

## Backlog
- P0: Twilio WhatsApp integration for automated customer notifications (user wants this, needs Auth Token)
- P1: Full admin panel feature test (capacity adjustment, date blocking)
- P2: WhatsApp integration end-to-end validation
- P3: Refactor server.py (800+ lines) into modular structure
