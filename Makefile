# ==============================================================
# Makefile — Monorepo Yayasan Padindi
# Dijalankan dari root folder proyek.
# ==============================================================

.PHONY: serve-backend serve-frontend install migrate seed test lint build fresh help

help:
	@echo "Perintah yang tersedia:"
	@echo "  make serve-backend   - Jalankan Laravel backend server (http://localhost:8000)"
	@echo "  make serve-frontend  - Jalankan Vite frontend dev server (http://localhost:5173)"
	@echo "  make install         - Install dependensi backend + frontend"
	@echo "  make migrate         - Jalankan migration database"
	@echo "  make seed            - Jalankan database seeder"
	@echo "  make test            - Jalankan semua uji (backend + frontend)"
	@echo "  make lint            - Lint backend (Pint) + frontend (ESLint)"
	@echo "  make build           - Build frontend produksi"
	@echo "  make fresh           - Drop semua tabel, migrate ulang, dan seed"

serve-backend:
	cd backend && php artisan serve

serve-frontend:
	cd frontend && npm run dev

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
