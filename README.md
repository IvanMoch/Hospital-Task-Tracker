# API WAOK

REST API for hospital task management. Each hospital manages its own tasks in full isolation (multi-tenancy). Built with NestJS, Prisma ORM, and PostgreSQL, developed with TDD.

## Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 |
| ORM | Prisma 7 |
| Database | PostgreSQL 16 (Docker) |
| Language | TypeScript |
| Testing | Jest |

---

## Prerequisites

- [Node.js](https://nodejs.org) >= 20
- [Docker](https://www.docker.com) and Docker Compose

---

## Setup

### 1. Clone the repository and install dependencies

```bash
git clone <repo-url>
cd api-waok
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/waok_db
DB_USER=user
DB_PASSWORD=password
DB_NAME=waok_db
PORT=3000
NODE_ENV=development
```

### 3. Start the database with Docker

```bash
docker compose up -d
```

Verify the container is running:

```bash
docker compose ps
```

### 4. Run Prisma migrations

```bash
npx prisma migrate dev
```

Applies all migrations in order and regenerates the Prisma client.

### 5. Seed the database

```bash
npx prisma db seed
```

Creates 2 hospitals and 5 sample tasks for Postman testing.

### 6. Start the server

```bash
npm run start:dev
```

Server available at `http://localhost:3000`.

---

## API Documentation (Swagger)

With the server running in development, the interactive docs are available at:

```
http://localhost:3000/docs
```

> Swagger is only available when `NODE_ENV !== 'production'`. In production the `/docs` route returns 404.

---

## Endpoints

### Hospital

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/hospital` | Create hospital |
| `GET` | `/hospital` | List active hospitals |
| `GET` | `/hospital/:id` | Get a hospital |
| `PATCH` | `/hospital/:id` | Update hospital |
| `DELETE` | `/hospital/:id` | Delete hospital (soft delete) |

### Tasks (nested under hospital)

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/hospital/:hospitalId/task` | Create task |
| `GET` | `/hospital/:hospitalId/task` | List active tasks |
| `GET` | `/hospital/:hospitalId/task/:id` | Get a task |
| `PATCH` | `/hospital/:hospitalId/task/:id` | Update task |
| `DELETE` | `/hospital/:hospitalId/task/:id` | Delete task (soft delete) |
| `PATCH` | `/hospital/:hospitalId/task/:id/status` | Change status |
| `GET` | `/hospital/:hospitalId/task/stats` | Task counts and percentages per status |

#### Available filters on `GET /hospital/:hospitalId/task`

```
?status=PENDING
?priority=HIGH
?status=IN_PROGRESS&priority=URGENT
```

#### Valid `status` values and transitions

```
PENDING → IN_PROGRESS → COMPLETED
                      → CANCELLED
PENDING → CANCELLED
```

#### Valid `priority` values

`LOW` · `MEDIUM` · `HIGH` · `URGENT`

---

## Response format

**Success:**
```json
{
  "data": {},
  "message": ""
}
```

**Error:**
```json
{
  "statusCode": 400,
  "message": "error description",
  "error": "Bad Request"
}
```

---

## Tests

```bash
# unit tests
npm run test

# watch mode
npm run test:watch

# coverage
npm run test:cov
```

---

## Prisma commands

```bash
# create a new migration
npx prisma migrate dev --name migration_name

# regenerate the client (after schema changes)
npx prisma generate

# open Prisma Studio (DB UI explorer)
npx prisma studio

# reset DB and re-run migrations + seed
npx prisma migrate reset
```
