# Kaisō Sushi - Product Requirements Document

## Original Problem Statement
Build a premium luxury-tech website for Kaisō Sushi restaurant in Córdoba, Spain. Dark theme with gold/red accents, multilingual (ES/PT/EN), reservation system, admin panel, analytics dashboard.

## Architecture
- **Frontend:** React + Tailwind CSS + Recharts + react-router-dom
- **Backend:** FastAPI (Python) + MongoDB
- **Routes:** `/` (site), `/admin` (reservas), `/analytics` (visitantes)

## What's Been Implemented
- Full restaurant website with dark/gold luxury theme
- Multilingual support (ES/PT/EN)
- Reservation system with capacity limits, tasting menu, discounts
- Admin panel (/admin) - manage reservations, capacity, blackout dates, CSV export
- **Analytics panel (/analytics)** - visitor tracking, conversion funnel, device/language stats, daily charts
- Menu section with allergen info, WhatsApp ordering
- Location section with Google Maps (Kaisō Sushi España)
- Email confirmations (customer + restaurant)
- WhatsApp integration
- QR code delivery discount

## Restaurant Hours
- Lunch: Tue-Thu 12:00-14:00 | Fri-Sat-Sun 12:00-15:30
- Dinner: Tue-Thu 19:00-23:00 | Fri-Sat 19:00-23:30 | Sun 19:00-23:00
- Monday: CLOSED

## Bug Fix Log
- 2026-02-24: Fixed removeChild React DOM error (all && → ternary)
- 2026-02-25: Updated restaurant hours, fixed Google Maps, moved secrets to .env
- 2026-02-25: Added Analytics panel with visitor tracking, conversion funnel, charts

## Credentials
- Admin/Analytics: username=admin, password=reservas
- Routes: /admin (reservas), /analytics (visitantes)

## Backlog
- Deploy permanente do backend (Emergent Deploy)
- Teste admin panel completo na produção
- Validação WhatsApp end-to-end na produção
