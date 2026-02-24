# Kaisō Sushi - Product Requirements Document

## Original Problem Statement
Build a premium luxury-tech website for Kaisō Sushi restaurant in Córdoba, Spain. Features include: dark theme (#050608) with gold (#C9A24A) and red (#D11B2A) accents, multilingual support (ES/PT/EN), comprehensive reservation system with 30 diners/day limit, premium tasting menu option, WhatsApp + email confirmations, admin panel, real restaurant photos and menu.

## Architecture
- **Frontend:** React + Tailwind CSS + react-router-dom + i18next
- **Backend:** FastAPI (Python) + MongoDB
- **Key files:** App.js, ReservationSystem.jsx, AdminPanel.jsx, MenuSection.jsx, server.py, api.js

## What's Been Implemented
- Full restaurant website with dark/gold luxury theme
- Multilingual support (ES/PT/EN)
- Reservation system (date picker, time slots, tasting menu, capacity limits)
- Admin panel (/admin) with reservations management, capacity config, blackout dates, CSV export
- Menu section with real items, allergen info, WhatsApp ordering
- Location section with Google Maps embed
- Email confirmations (customer + restaurant)
- WhatsApp integration
- QR code delivery discount on success page
- Real restaurant photos and logo

## Bug Fix Log
- **2026-02-24:** Fixed critical `removeChild` React DOM error. Converted ALL conditional rendering from `{condition && <JSX>}` to `{condition ? <JSX> : null}` across App.js, ReservationSystem.jsx, AdminPanel.jsx, MenuSection.jsx. Testing: 100% pass rate (iteration_5.json).

## Credentials
- Admin: username=admin, password=reservas
- Route: /admin

## Backlog
- P1: Full admin panel feature test (capacity adjustment, date blocking) on production
- P2: Validate WhatsApp integration end-to-end on production
- User needs to redeploy (Save to GitHub) for production fix
