.PHONY: help up down build logs seed migrate shell-backend shell-frontend reset-db lint

help:
	@echo "Cube BI - common commands"
	@echo ""
	@echo "  make up             start all services (db, backend, frontend)"
	@echo "  make down           stop all services"
	@echo "  make build          rebuild all images"
	@echo "  make logs           tail backend + frontend logs"
	@echo "  make migrate        run Django migrations"
	@echo "  make seed           seed mock data (clients, orders, tokens)"
	@echo "  make shell-backend  exec shell in backend container"
	@echo "  make shell-frontend exec shell in frontend container"
	@echo "  make reset-db       drop database volume and recreate"
	@echo ""

up:
	docker compose up -d --build

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f backend frontend

migrate:
	docker compose exec backend python manage.py migrate

seed:
	docker compose exec backend python manage.py seed_mock_data

shell-backend:
	docker compose exec backend sh

shell-frontend:
	docker compose exec frontend sh

reset-db:
	docker compose down -v
	docker compose up -d --build db backend
	sleep 5
	docker compose exec backend python manage.py migrate
	docker compose exec backend python manage.py seed_mock_data
