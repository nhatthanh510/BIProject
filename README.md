# Cube BI

BI-Dashboard zur Überwachung der KI/OCR-Auftragsentwicklung und des Token-Verbrauchs der Kunden.

- **Backend:** Django 5.2 LTS + Django REST Framework + SimpleJWT
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Recharts
- **Datenbank:** PostgreSQL 16
- **Sprachen:** Deutsch (Standard) & Englisch via `react-i18next`
- **Läuft in:** Docker Compose

---

## Quickstart (Dev)

```bash
# 1) Env-Files anlegen
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2) Alles hochfahren
docker compose up -d --build

# 3) Datenbank migrieren und Mock-Daten seeden
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_mock_data

# 4) Öffnen
# Frontend:  http://localhost:5173
# Backend:   http://localhost:8000/api/
# Django Admin: http://localhost:8000/admin/
```

**Login:** `admin@cube-bi.local` / `admin123`

Ein Makefile ist vorhanden:

```bash
make up          # alles starten
make migrate     # Migrationen
make seed        # Mock-Daten einspielen
make logs        # Logs verfolgen
make reset-db    # DB löschen und neu seeden
```

---

## Projektstruktur

```
BIProject/
├── docker-compose.yml         # Dev: db + backend + frontend (Vite)
├── docker-compose.prod.yml    # Prod-Overrides: gunicorn + nginx
├── docker/
│   ├── backend.Dockerfile        # Prod (gunicorn)
│   ├── backend.dev.Dockerfile    # Dev (runserver + Hot Reload)
│   ├── frontend.Dockerfile       # Prod (Multi-Stage: Node-Build + nginx)
│   ├── frontend.dev.Dockerfile   # Dev (Vite Hot Reload)
│   └── nginx/default.conf
├── backend/                   # Django-Projekt
│   ├── cube_bi/settings/         # base.py, dev.py, prod.py
│   ├── accounts/                 # Custom User, JWT-Login/Refresh/Logout/Me
│   ├── clients/ orders/ tokens_usage/  # Domänenmodelle
│   ├── dashboard/                # /api/dashboard/summary, /orders-timeline
│   ├── services/providers/       # Pluggable Data-Provider (mock/http)
│   └── core/management/commands/seed_mock_data.py
└── frontend/                  # React + Vite + TS
    └── src/
        ├── api/                  # axios-Client, Auth, Dashboard
        ├── auth/                 # AuthContext, ProtectedRoute
        ├── components/
        │   ├── ui/                 # shadcn-Komponenten (Button, Card, Select, ...)
        │   ├── layout/             # AppLayout, Sidebar, Topbar
        │   └── dashboard/          # KpiCard, OrdersChart, MonthPicker, RefreshButton
        ├── hooks/                # TanStack Query Hooks + Filter
        ├── locales/ de.json en.json
        ├── pages/                # DashboardPage, LoginPage, SettingsPage
        └── lib/                  # utils.ts, format.ts (de-DE)
```

---

## Pluggable Data-Provider

Ziel: Heute Mock-Daten aus der lokalen DB, später die echte Kunden-API — ohne dass die Dashboard-Views das merken.

```
backend/services/providers/
├── base.py           # Abstract DataProvider (Schnittstelle)
├── mock_provider.py  # liest aus der lokalen Django-DB (seed_mock_data)
├── http_provider.py  # Stub — hier die echte API einbauen
└── __init__.py       # get_provider() — liest DATA_PROVIDER aus .env
```

**Umschalten** in `backend/.env`:

```
DATA_PROVIDER=mock         # Standard
# oder
DATA_PROVIDER=http
HTTP_PROVIDER_BASE_URL=https://example.com/api
HTTP_PROVIDER_API_KEY=secret
```

Der Test, dass die Schnittstelle funktioniert:

```bash
docker compose exec backend sh -c \
  'DATA_PROVIDER=http python -c "from services.providers import get_provider; get_provider().list_clients()"'
# → NotImplementedError: HttpProvider.list_clients - implement HTTP call to real API
```

Wenn Sie die API-Doku haben, in `http_provider.py` die drei Methoden ausfüllen — fertig.

---

## API-Endpunkte

| Endpunkt | Zweck |
|---|---|
| `POST /api/auth/login/` | Login, setzt `refresh_token` als httpOnly-Cookie, gibt `access` + `user` zurück |
| `POST /api/auth/refresh/` | Neues Access-Token via Refresh-Cookie |
| `POST /api/auth/logout/` | Refresh-Cookie löschen |
| `GET  /api/auth/me/` | Aktueller User |
| `GET  /api/clients/` | Liste der Kunden |
| `GET  /api/orders/?month=YYYY-MM&client=<id>&status=` | Paginierte Aufträge |
| `GET  /api/dashboard/summary?month=YYYY-MM&client=<id>` | 4 KPIs fürs Dashboard |
| `GET  /api/dashboard/orders-timeline?month=YYYY-MM&client=<id>` | Tageszähler für das Chart (Null-gefüllt) |

Beispiel `summary`-Response:

```json
{
  "filters": { "month": "2026-04", "client_id": 3 },
  "as_of": "2026-04-22T10:11:00+02:00",
  "kpis": {
    "orders_month":  { "value": 1284 },
    "orders_total":  { "value": 48213 },
    "orders_today":  { "value": 47 },
    "token_status":  { "tokens_used": 5465, "quota": 120000, "percent_used": 4.55 }
  }
}
```

---

## Flexibilität & Zukunft

- **Echtzeit-Sales / Run-Rate:** momentan via Polling (`refetchInterval` in TanStack Query möglich). Upgrade-Pfad: Django Channels + ASGI-Consumer, der in den gleichen React-Query-Cache schreibt — keine UI-Änderungen nötig.
- **Filter** sind in URL-Query-Params (`?month=2026-04&client=3`) — teilbar, Reload-fest.
- **Rollen:** `User.role` existiert schon (`admin`/`analyst`/`viewer`) — rollenbasierte UI/Permissions können später daran anknüpfen ohne Migration-Umbau.
- **Zahlen-Formatierung** in `src/lib/format.ts` nutzt `Intl.NumberFormat('de-DE')` → „5.465" / „120.000" wie im Mockup.
- **Timezone** `Europe/Berlin` — „Aufträge heute" = Berliner Geschäftstag.

---

## Prod-Deployment

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

- Backend läuft dann mit **gunicorn** (3 Worker) unter `DJANGO_SETTINGS_MODULE=cube_bi.settings.prod`.
- Frontend wird **statisch gebaut** und von **nginx** auf Port 80 serviert; `/api/*` wird an das Backend gereicht.
- Vor dem ersten Start: `SECRET_KEY` setzen, `DEBUG=False`, `ALLOWED_HOSTS` und `CORS_ALLOWED_ORIGINS` anpassen, `JWT_COOKIE_SECURE=True`.

---

## Credentials (nur für die Demo)

Seed-User (vom `seed_mock_data`-Command erstellt):

```
Email:    admin@cube-bi.local
Passwort: admin123
Role:     admin  (Django superuser)
```

Das Passwort sollte in einer realen Umgebung natürlich geändert werden.
