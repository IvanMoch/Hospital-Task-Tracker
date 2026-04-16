# CLAUDE.md — API WAOK

## Project Overview

REST API built with NestJS, Prisma ORM, and PostgreSQL. Development follows TDD (Test-Driven Development). Docker is required for the database.

## Tech Stack

| Layer       | Technology              |
|-------------|-------------------------|
| Framework   | NestJS (Node.js)        |
| ORM         | Prisma                  |
| Database    | PostgreSQL (via Docker) |
| Testing     | Jest                    |
| Methodology | TDD                     |

## Project Structure (NestJS conventions)

```
src/
  modules/
    <module>/
      dto/
      entities/
      <module>.controller.ts
      <module>.service.ts
      <module>.module.ts
      <module>.controller.spec.ts
      <module>.service.spec.ts
  prisma/
    schema.prisma
    migrations/
  common/
    filters/
    interceptors/
    decorators/
    guards/
  app.module.ts
  main.ts
docker-compose.yml
.env
.env.example
```

## Database

- **Engine:** PostgreSQL
- **Connection:** managed via Docker (`docker-compose.yml`)
- **ORM:** Prisma — always use `npx prisma migrate dev` to create migrations, never modify the DB directly
- **Soft Deletes:** all entities use soft delete via a `deletedAt DateTime?` field. Never use hard deletes in application code. Filter out soft-deleted records in every query by default (`where: { deletedAt: null }`)

### Soft Delete Convention

Every Prisma model must include:

```prisma
deletedAt DateTime?
```

To soft-delete a record:

```ts
await this.prisma.<model>.update({
  where: { id },
  data: { deletedAt: new Date() },
});
```

To query active records only:

```ts
await this.prisma.<model>.findMany({
  where: { deletedAt: null },
});
```

## Docker

Docker is **required** to run the database. Never assume a local PostgreSQL instance.

```yaml
# docker-compose.yml (reference)
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

Start the DB before running the app or tests:

```bash
docker compose up -d
```

## Environment Variables

Always use `.env` (gitignored). Provide `.env.example` with all keys and no values.

### Running tests

```bash
npm run test          # unit tests
npm run test:watch    # watch mode
npm run test:cov      # coverage
npm run test:e2e      # e2e tests
```

## Common Commands

```bash
docker compose up -d                              # start DB
npm install                                       # install deps
npx prisma migrate dev --name <migration_name>    # create migration
npx prisma generate                               # regenerate client
npx prisma studio                                 # open Prisma Studio
npm run start:dev                                 # start dev server
npm run build                                     # build
```

## Coding Conventions

- Use `async/await` — no raw Promise chains
- DTOs must use `class-validator` decorators for validation
- All endpoints return consistent response shapes
- HTTP exceptions: use NestJS built-in (`NotFoundException`, `BadRequestException`, etc.)
- Controllers are thin — business logic lives in services
- Services own Prisma interactions — never query Prisma from controllers
- No hard deletes in application code — always soft delete

## API Response Convention

Success:

```json
{
  "data": {},
  "message": "string"
}
```

Error (handled by global exception filter):

```json
{
  "statusCode": 400,
  "message": "string",
  "error": "Bad Request"
}
```
