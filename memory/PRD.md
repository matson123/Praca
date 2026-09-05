# MapMeet – PRD

## Problem statement
Aplikacja webowa (praca inżynierska) – wydarzenia na mapie Polski. Zalogowany użytkownik stawia pinezkę (tylko w granicach RP), inni dołączają. Główny widok: mapa Leaflet + OpenStreetMap. Kategorie (8): Sport, Kultura, Muzyka, Jedzenie, Nauka, Gry, Outdoor, Inne.

## User choices
- Auth: JWT email + hasło (bez Google)
- Captcha: pominięte w MVP, rate limiting na API (slowapi)
- Mapa: OpenStreetMap
- Zakres: Fazy 1–4 (fundament, wydarzenia, interakcja, clustering/filtry)
- Dane testowe: seed 12 wydarzeń w polskich miastach + admin

## Persona
Osoby szukające lokalnych spotkań (sport, kultura, jedzenie itd.) na terenie Polski.

## Architecture
- Backend: FastAPI + Motor (MongoDB), bcrypt+PyJWT, slowapi rate limiting, indeks 2dsphere
- Poland geofencing: ray casting w /app/backend/poland_geo.py
- Frontend: React 19 + react-leaflet + leaflet.markercluster, sonner toasts, shadcn/ui
- Języki: całe UI po polsku

## Zaimplementowane (2026-02-XX)
- Auth: register / login / logout / me / profile (JWT cookie + Bearer)
- Wydarzenia: CRUD, geofencing PL, filtry (kategoria, daty, publiczne, dystans), $near (2dsphere)
- Interakcja: dołącz/opuść, akceptacja organizatora (pending list), komentarze REST
- Mapa: OSM tiles, custom kolorowe pinezki per kategoria, clustering leaflet.markercluster
- UI: TopBar z wyszukiwarką + miasta, wysuwany sidebar (details/create/filters/profile/list), floating map controls (reset, geolokalizacja, licznik)
- Historia użytkownika: utworzone / dołączone + archiwum
- Rate limiting: register 10/min, login 20/min, events/comments 30/min; limit 10 wydarzeń/dobę na usera
- Seed: 12 wydarzeń w 12 miastach, admin + demo user
- Konta testowe w /app/memory/test_credentials.md

## Backlog
- P1: Panel administratora (blokowanie userów, zgłoszenia, usuwanie treści)
- P1: System zgłoszeń komentarzy / wydarzeń
- P2: hCaptcha przy rejestracji
- P2: Powiadomienia in-app
- P3: Powiadomienia email, WebSocket chat, wersja mobilna, system reputacji
