# Cube BI

BI-Dashboard zur Überwachung der KI/OCR-Auftragsentwicklung und des Token-Verbrauchs der Kunden.

- **Backend:** Django 6.0.4 + Django REST Framework + SimpleJWT
- **Frontend:** React 19 + TypeScript + Vite 7 + Tailwind CSS v4 + shadcn/ui + Recharts 3
- **Datenbank:** PostgreSQL 16
- **Sprachen:** Deutsch (Standard) & Englisch via `react-i18next`
- **Läuft in:** Docker Compose

---

## Quickstart (Dev)

```bash
# 1) Env-Files anlegen
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2) Alles hochfahren
make up

# 3) Datenbank migrieren und Mock-Daten seeden
make migrate
make seed

# 4) Öffnen
# Frontend:     http://localhost:5173
# Backend API:  http://localhost:8000/api/
# Django Admin: http://localhost:8000/admin/
```

**Login:** `admin@cube-bi.local` / `admin123`

---

## Projektstruktur

```
BIProject/
├── docker-compose.yml          # Dev: db + backend + frontend (Vite)
├── docker-compose.prod.yml     # Prod-Overrides: gunicorn + nginx
├── docker/
│   ├── backend.Dockerfile         # Prod (gunicorn)
│   ├── backend.dev.Dockerfile     # Dev (runserver + Hot Reload)
│   ├── frontend.Dockerfile        # Prod (Multi-Stage: Node-Build + nginx)
│   ├── frontend.dev.Dockerfile    # Dev (Vite Hot Reload)
│   └── nginx/default.conf
├── backend/                    # Django-Projekt
│   ├── cube_bi/settings/          # base.py, dev.py, prod.py
│   ├── accounts/                  # Custom User, JWT-Login/Refresh/Logout/Me
│   ├── clients/ orders/ tokens_usage/   # Domänenmodelle
│   ├── dashboard/                 # /api/dashboard/summary, /orders-timeline
│   ├── services/providers/        # Pluggable Data-Provider (mock/http)
│   └── core/management/commands/seed_mock_data.py
└── frontend/                   # React + Vite + TS
    └── src/
        ├── api/                   # axios-Client, Auth, Dashboard
        ├── auth/                  # AuthContext, ProtectedRoute
        ├── components/{ui,layout,dashboard}/
        ├── hooks/                 # TanStack Query Hooks + Filter
        ├── locales/{de,en}.json
        ├── pages/
        └── lib/                   # utils.ts, format.ts (de-DE)
```

---

## Pluggable Data-Provider

Heute Mock-Daten aus der lokalen DB, später die echte Kunden-API — ohne UI-Änderung.

```
backend/services/providers/
├── base.py           # Abstract DataProvider (Schnittstelle)
├── mock_provider.py  # liest aus der lokalen Django-DB
├── http_provider.py  # Stub — echte Kunden-API hier einbauen
└── __init__.py       # get_provider() liest DATA_PROVIDER aus .env
```

Umschalten in `backend/.env`:

```
DATA_PROVIDER=mock          # Standard
# oder
DATA_PROVIDER=http
HTTP_PROVIDER_BASE_URL=https://example.com/api
HTTP_PROVIDER_API_KEY=secret
```

---

## API-Endpunkte

| Endpunkt | Zweck |
|---|---|
| `POST /api/auth/login/` | Login, setzt `refresh_token` als httpOnly-Cookie |
| `POST /api/auth/refresh/` | Neues Access-Token via Refresh-Cookie |
| `POST /api/auth/logout/` | Refresh-Cookie löschen |
| `GET  /api/auth/me/` | Aktueller User |
| `GET  /api/clients/` | Liste der Kunden |
| `GET  /api/orders/?month=YYYY-MM&client=<id>&status=` | Paginierte Aufträge |
| `GET  /api/dashboard/summary/?month=YYYY-MM&client=<id>` | 4 KPIs |
| `GET  /api/dashboard/orders-timeline/?month=YYYY-MM&client=<id>` | Tageszähler fürs Chart |

---

## Prod-Deployment

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

- Backend via **gunicorn** (3 Worker), `DJANGO_SETTINGS_MODULE=cube_bi.settings.prod`.
- Frontend statisch gebaut, via **nginx** auf Port 80; `/api/*` → Backend.
- Vor dem ersten Start: `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `JWT_COOKIE_SECURE=True` anpassen.
