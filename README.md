# Restaurant Ordering Platform (Spring Boot + React)

A full-stack restaurant ordering app (branded "Savora") with a clean, simple structure.

## Tech

- Backend: Spring Boot (Maven), Spring Security (JWT), Spring Data JPA, H2 (file-based, persistent), Actuator
- Frontend: React + TypeScript (Vite), React Router, Axios

## Local Run

### Backend

Prereq: Java 21 installed and `JAVA_HOME` set. From [backend](backend):

- Run: `.\dev-run.ps1` (stops any old backend on 8080, then starts Spring Boot)
- API: `http://localhost:8080`
- H2 console: `http://localhost:8080/h2-console`

Demo admin (seeded): `admin@demo.com` / `admin123`

### Frontend

From [frontend](frontend):

- `npm install`
- `npm run dev`

App: `http://localhost:5173`

## API

- Menu: `GET /api/menu`
- Orders: `POST /api/orders`, `GET /api/orders`, `GET /api/orders/{id}`, `PATCH /api/orders/{id}/status` (admin)
- Recommendations: `GET /api/recommendations`
- Auth: `POST /api/auth/register`, `POST /api/auth/login` (JWT)

## Notes

- Data persists in `backend/data/` (file-based H2), so it survives restarts.
- Demo build: secrets live in `application.properties`; rotate before production.
- Run only one backend instance at a time (the file H2 DB is single-writer).
