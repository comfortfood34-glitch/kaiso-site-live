# Kaisō Sushi - Product Requirements Document

## Original Problem Statement
Complete rebuild of the Kaisō Sushi website to a premium, luxury-tech standard. A comprehensive reservation system with complex business rules, a password-protected admin panel, analytics dashboard, manual reservation management, and automated WhatsApp notifications.

## Core Features

### Reservation System
- Hard limit of 30 diners/day, complex time slots, automatic discounts
- Premium tasting menu option (Tue-Thu, 19:00-21:00)
- Confirmation via WhatsApp (automated) + background email
- 30-minute buffer before closing time

### Schedule
- Mon: CLOSED
- Tue-Thu: Lunch 12:00-14:00, Dinner 19:00-23:00
- Fri-Sun: Lunch 13:00-15:30, Dinner 20:00-23:30

### Admin Panel (`/admin`) - Credentials: admin/reservas
- View/filter reservations by date and status
- Manual reservation creation (for phone-in customers)
- WhatsApp tab with QR code, connection status, reconnect & reset buttons
- Adjust daily capacity, block dates, export CSV

### WhatsApp Integration (baileys)
- Node.js microservice on port 8002 using @whiskeysockets/baileys
- QR code pairing displayed in admin panel
- Auto-sends confirmation to customers on every new reservation
- Reconnect and Reset buttons for connection management
- Session persisted in /app/whatsapp-service/auth_session/

### Analytics Panel (`/analytics`) - Credentials: admin/reservas
- Track site visits, reservation funnel, conversion rates

### Email Notifications
- Table-based XHTML for maximum email client compatibility
- Logo: kaisosushiespanha.com/assets/logo-kaiso.png

## Architecture
- **Frontend:** React, Tailwind CSS, react-router-dom, i18next, recharts
- **Backend:** FastAPI, Pydantic, BackgroundTasks, httpx
- **WhatsApp:** Node.js + Express + @whiskeysockets/baileys (port 8002)
- **Database:** MongoDB
- **Email:** Gmail SMTP via aiosmtplib

## Completed Features
- Full restaurant website with dark luxury theme
- Multi-language reservation system (ES/PT/EN)
- Admin panel with reservation management
- Analytics dashboard with KPIs and charts
- Performance optimization (BackgroundTasks for emails)
- Production CORS fix
- removeChild React bug fix
- Manual reservation form in admin panel
- Updated weekend schedule (Fri-Sun: lunch 13-15:30, dinner 20-23:30)
- 30-minute buffer before closing time
- Bulletproof email HTML (table-based XHTML)
- WhatsApp QR code integration with auto-notifications (Mar 2026)

## Backlog
- P1: Test WhatsApp integration end-to-end on production
- P2: Test admin features (capacity adjustment, date blocking)
- P3: Refactor server.py into modular structure
