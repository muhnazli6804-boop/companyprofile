# ==============================================================
# Makefile — Monorepo Yayasan Padindi
# Dijalankan dari root folder proyek.
# ==============================================================

.PHONY: up down install migrate seed test lint build fresh help

help:
	@echo "Perintah yang tersedia:"
	@echo "  make up       - Jalankan docker compose (postgres + mailpit)"
	@echo "  make down     - Hentikan docker compose"
	@echo "  make install  - Install dependensi backend + frontend"
	@echo "  make migrate  - Jalankan migration database"
	@echo "  make seed     - Jalankan database seeder"
	@echo "  make test     - Jalankan semua uji (backend + frontend)"
	@echo "  make lint     - Lint backend (Pint) + frontend (ESLint)"
	@echo "  make build    - Build frontend produksi"
	@echo "  make fresh    - Drop semua tabel, migrate ulang, dan seed"

up:
	docker compose up -d postgres mailpit

down:
	docker compose down

install:
	cd backend && composer install
	cd frontend && npm install

migrate:
	cd backend && php artisan migrate

seed:
	cd backend && php artisan db:seed

test:
	cd backend && composer test
	cd frontend && npm run test -- --run

lint:
	cd backend && composer lint
	cd frontend && npm run lint

build:
	cd frontend && npm run build

fresh:
	cd backend && php artisan migrate:fresh --seed
