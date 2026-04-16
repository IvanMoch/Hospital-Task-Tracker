# Prisma Migration — NestJS + PostgreSQL

You are managing a Prisma migration for this NestJS + PostgreSQL project running on Docker. The user will describe a schema change or provide a migration name. Follow the steps below in order.

## Input

The user provides: `$ARGUMENTS`

This can be:
- A migration name (e.g., "add-users-table")
- A schema change description (e.g., "add phone field to users")
- A model to create or modify (e.g., "create products model")

---

## Phase 1 — Verify Docker is running

Before touching any schema, confirm the PostgreSQL container is up:

```bash
docker compose ps
```

If the container is not running:

```bash
docker compose up -d
```

Wait for the container to be healthy before continuing.

---

## Phase 2 — Update `schema.prisma`

Apply the requested change to `prisma/schema.prisma`.

### Rules

- Every new model **must** include these base fields:

```prisma
model Example {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?
}
```

- `deletedAt DateTime?` is mandatory on every model — no exceptions.
- Use `@map` and `@@map` to follow snake_case naming in the database while keeping camelCase in Prisma.
- Define relations explicitly with `@relation`.
- Never remove `deletedAt` from an existing model.

---

## Phase 3 — Run the migration

```bash
npx prisma migrate dev --name <migration_name>
```

- The migration name must be kebab-case and descriptive (e.g., `add-phone-to-users`, `create-products-table`).
- If `$ARGUMENTS` is already a valid kebab-case name, use it directly.
- If `$ARGUMENTS` is a description, derive a concise kebab-case name from it.

---

## Phase 4 — Regenerate the Prisma client

```bash
npx prisma generate
```

Always run this after every migration, even if the schema change seems minor.

---

## Phase 5 — Verify

1. Confirm the migration file was created under `prisma/migrations/`.
2. Confirm there are no drift warnings from Prisma.
3. If a `PrismaService` or related entities/types exist in the codebase, check they still compile cleanly:

```bash
npm run build
```

---

## Output format per phase

After each phase, report:

```
Phase: DOCKER | SCHEMA | MIGRATE | GENERATE | VERIFY
Status: OK | FAILED
Details: <what happened or what changed>
Next step: <what comes next>
```

---

## Constraints (always enforced)

- Docker must be running before any Prisma command
- `deletedAt DateTime?` is required on every model
- Migration names must be kebab-case and descriptive
- Always run `prisma generate` after `prisma migrate dev`
- Never edit migration SQL files manually
- Never run `prisma db push` in place of `prisma migrate dev` (push bypasses migration history)
