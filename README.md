# API WAOK

REST API para la gestión de tareas hospitalarias. Cada hospital administra sus propias tareas en aislamiento total (multi-tenencia). Construida con NestJS, Prisma ORM y PostgreSQL, siguiendo TDD como metodología de desarrollo.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | NestJS 11 |
| ORM | Prisma 7 |
| Base de datos | PostgreSQL 16 (Docker) |
| Lenguaje | TypeScript |
| Testing | Jest |

---

## Requisitos previos

- [Node.js](https://nodejs.org) >= 20
- [Docker](https://www.docker.com) y Docker Compose

---

## Setup inicial

### 1. Clonar el repositorio e instalar dependencias

```bash
git clone <url-del-repo>
cd api-waok
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus valores:

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/waok_db
DB_USER=usuario
DB_PASSWORD=contraseña
DB_NAME=waok_db
PORT=3000
NODE_ENV=development
```

### 3. Levantar la base de datos con Docker

```bash
docker compose up -d
```

Verificar que el contenedor esté corriendo:

```bash
docker compose ps
```

### 4. Ejecutar migraciones de Prisma

```bash
npx prisma migrate dev
```

Esto aplica todas las migraciones en orden y regenera el cliente de Prisma.

### 5. Poblar la base de datos (seed)

```bash
npx prisma db seed
```

Crea 2 hospitales y 5 tareas de ejemplo para pruebas con Postman.

### 6. Iniciar el servidor

```bash
npm run start:dev
```

El servidor queda disponible en `http://localhost:3000`.

---

## Endpoints

### Hospital

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/hospital` | Crear hospital |
| `GET` | `/hospital` | Listar hospitales activos |
| `GET` | `/hospital/:id` | Obtener un hospital |
| `PATCH` | `/hospital/:id` | Actualizar hospital |
| `DELETE` | `/hospital/:id` | Eliminar hospital (soft delete) |

### Tareas (anidadas por hospital)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/hospital/:hospitalId/task` | Crear tarea |
| `GET` | `/hospital/:hospitalId/task` | Listar tareas activas |
| `GET` | `/hospital/:hospitalId/task/:id` | Obtener una tarea |
| `PATCH` | `/hospital/:hospitalId/task/:id` | Actualizar tarea |
| `DELETE` | `/hospital/:hospitalId/task/:id` | Eliminar tarea (soft delete) |
| `PATCH` | `/hospital/:hospitalId/task/:id/status` | Cambiar estado |

#### Filtros disponibles en `GET /hospital/:hospitalId/task`

```
?status=PENDING
?priority=HIGH
?status=IN_PROGRESS&priority=URGENT
```

#### Valores válidos de `status`

```
PENDING → IN_PROGRESS → COMPLETED
                      → CANCELLED
PENDING → CANCELLED
```

#### Valores válidos de `priority`

`LOW` · `MEDIUM` · `HIGH` · `URGENT`

---

## Formato de respuesta

**Éxito:**
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
  "message": "descripción del error",
  "error": "Bad Request"
}
```

---

## Tests

```bash
# tests unitarios
npm run test

# modo watch
npm run test:watch

# cobertura
npm run test:cov
```

---

## Comandos útiles de Prisma

```bash
# crear una nueva migración
npx prisma migrate dev --name nombre_migracion

# regenerar el cliente (después de cambiar el schema)
npx prisma generate

# abrir Prisma Studio (UI para explorar la DB)
npx prisma studio

# resetear la DB y re-ejecutar migraciones + seed
npx prisma migrate reset
```
