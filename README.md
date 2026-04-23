# Cube BI

BI dashboard for monitoring AI/OCR order volume, token usage, and per-client billing run-rate.

- **Backend:** Django 6.0.4 + Django REST Framework + SimpleJWT
- **Frontend:** React 19 + TypeScript + Vite 7 + Tailwind CSS v4 + shadcn/ui + Recharts 3
- **Database:** PostgreSQL 16
- **Languages:** German (default) & English via `react-i18next`
- **Runs in:** Docker Compose

---

## Quickstart (Dev)

```bash
# 1) Create env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2) Bring everything up
make up

# 3) Migrate the database and seed mock data
make migrate
make seed

# 4) Open
# Frontend:     http://localhost:5173
# Backend API:  http://localhost:8000/api/
# Django Admin: http://localhost:8000/admin/
```

**Login:** `admin@cube-bi.local` / `admin123`

---

## Project structure

```
BIProject/
├── docker-compose.yml          # Dev: db + backend + frontend (Vite)
├── docker-compose.prod.yml     # Prod overrides: gunicorn + nginx
├── docker/
│   ├── backend.Dockerfile         # Prod (gunicorn)
│   ├── backend.dev.Dockerfile     # Dev (runserver + hot reload)
│   ├── frontend.Dockerfile        # Prod (multi-stage: Node build + nginx)
│   ├── frontend.dev.Dockerfile    # Dev (Vite hot reload)
│   └── nginx/default.conf
├── backend/                    # Django project
│   ├── cube_bi/settings/          # base.py, dev.py, prod.py
│   ├── accounts/                  # Custom User, JWT login/refresh/logout/me
│   ├── clients/ orders/ tokens_usage/   # Domain models
│   ├── dashboard/                 # /api/dashboard/summary, /orders-timeline
│   ├── services/providers/        # Pluggable data provider (mock/http)
│   └── core/management/commands/
│       ├── seed_mock_data.py     # Deterministic mock data
│       └── simulate_live.py      # Live traffic for demos
└── frontend/                   # React + Vite + TS
    └── src/
        ├── api/                   # axios client, auth, dashboard
        ├── auth/                  # AuthContext, ProtectedRoute
        ├── components/{ui,layout,dashboard}/
        ├── hooks/                 # TanStack Query hooks + filters
        ├── locales/{de,en}.json
        ├── pages/
        └── lib/                   # utils.ts, format.ts
```

---

## Demo mode (live simulation)

For customer presentations there's a command that injects new orders in
real time. The customer sees numbers rising, the fade-in animation on the
KPI cards, and the run-rate projection shifting.

```bash
# In a second terminal, alongside the running stack:
make simulate
```

Default: every ~8 seconds (±40% jitter) insert 1–3 new orders for random
active clients. `Ctrl+C` to stop.

What moves on the dashboard:

- **Revenue (month)** and **Projected month-end** tick up (auto-refresh every 10s)
- **Orders (month / today)** climb
- **Token-status bar** creeps right (quota usage is updated in lockstep)
- **Chart** grows taller after each timeline refresh (30s)
- Every value change triggers a subtle fade-in animation
- **Live dot** in the top right pulses green

Fine-tune straight from the CLI:

```bash
# Faster and denser for a punchy demo
docker compose exec backend python manage.py simulate_live --interval 4 --max-orders 5

# Single tick (e.g. "simulate a refresh click")
docker compose exec backend python manage.py simulate_live --once

# Focus on one client
docker compose exec backend python manage.py simulate_live --client-id 3 --interval 4
```

Frontend refresh cadence:

- Summary KPIs poll every **10s**
- Orders chart polls every **10s**
- Refresh button (top right) invalidates all dashboard queries immediately

---

## Pluggable data provider

Today it serves mock data from the local DB; later the real customer API — without any UI change.

```
backend/services/providers/
├── base.py           # Abstract DataProvider (interface)
├── mock_provider.py  # Reads from the local Django DB
├── http_provider.py  # Stub — wire up the real customer API here
└── __init__.py       # get_provider() reads DATA_PROVIDER from .env
```

Switch in `backend/.env`:

```
DATA_PROVIDER=mock          # default
# or
DATA_PROVIDER=http
HTTP_PROVIDER_BASE_URL=https://example.com/api
HTTP_PROVIDER_API_KEY=secret
```

---

## API endpoints

| Endpoint | Purpose |
|---|---|
| `POST /api/auth/login/` | Login; sets `refresh_token` as an httpOnly cookie |
| `POST /api/auth/refresh/` | New access token via the refresh cookie |
| `POST /api/auth/logout/` | Clears the refresh cookie |
| `GET  /api/auth/me/` | Current user |
| `GET  /api/clients/` | List of clients |
| `GET  /api/orders/?month=YYYY-MM&client=<id>&status=` | Paginated orders |
| `GET  /api/token-quotas/?month=YYYY-MM&client=<id>` | Quotas + usage + % |
| `GET  /api/dashboard/summary/?month=YYYY-MM&client=<id>` | KPIs incl. revenue & run-rate |
| `GET  /api/dashboard/orders-timeline/?month=YYYY-MM&client=<id>` | Daily order counts for the chart |

---

## Prod deployment

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

- Backend via **gunicorn** (3 workers), `DJANGO_SETTINGS_MODULE=cube_bi.settings.prod`.
- Frontend built statically, served via **nginx** on port 80; `/api/*` → backend.
- Before first start, set: `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `JWT_COOKIE_SECURE=True`.
