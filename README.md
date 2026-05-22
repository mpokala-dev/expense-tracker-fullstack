# Expense Tracker — Full-Stack

A full-stack expense tracking application built with React, Node.js, Express, MongoDB, JWT authentication, Docker, and CI/CD.

## Tech Stack

**Backend:** Node.js · Express · TypeScript · MongoDB · Mongoose · JWT · bcryptjs  
**Frontend:** React 19 · TypeScript · Vite · React Router · React Hook Form · Zod · Axios  
**Infrastructure:** Docker · Docker Compose · GitHub Actions

## Prerequisites

- Node.js 22+
- Docker Desktop
- MongoDB (via Docker Compose — no local install needed)

## Getting Started

### With Docker (recommended)

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/api/health

### Without Docker

```bash
# Terminal 1 — Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Terminal 2 — Frontend
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Running Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Project Structure

```
expense-tracker-fullstack/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection, env validation
│   │   ├── controllers/     # Request handlers (thin layer)
│   │   ├── middleware/      # Auth guard, error handler, validation
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic
│   │   └── types/           # Shared TypeScript types
│   └── tests/
└── frontend/
    └── src/
        ├── api/             # Axios instance + API call functions
        ├── components/      # Shared UI components
        ├── hooks/           # Custom React hooks
        ├── pages/           # Route-level components
        ├── store/           # Auth state (Context)
        └── types/           # TypeScript types
```

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, returns JWT |

### Expenses (protected — requires Bearer token)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/expenses | Get all expenses for user |
| POST | /api/expenses | Create expense |
| PUT | /api/expenses/:id | Update expense |
| DELETE | /api/expenses/:id | Delete expense |
