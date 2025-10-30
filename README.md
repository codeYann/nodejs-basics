## NodeJS Basics

A minimal, dependency-light HTTP API built on Node core modules to demonstrate fundamentals: routing, middleware, simple persistence, logging, and file upload/CSV ingestion. Written in TypeScript and built to ESM.

### Features

- **HTTP server (no framework)**: Uses `node:http` for full control.
- **Routing**: Regex-based routes with path params and query parsing.
- **Middleware**: JSON body parser that gracefully skips multipart requests.
- **Persistence**: Tiny JSON file database with async load/persist and lazy table init.
- **Entities**: `User` and `Task` types with basic CRUD endpoints (create/list for users).
- **CSV import**: Multipart upload of a CSV to bulk-create tasks (streaming via `csv-parser`).
- **Logging**: Pretty console logs via `pino` + `pino-pretty`.
- **ESM build**: Bundled with `tsup` to `dist/server.mjs`.
- **Docker**: Multi-stage image (build + slim runtime) exposing port 3333.

### Tech stack

- TypeScript, Node 20 (ESM)
- `tsup`, `tsx`
- `pino`, `pino-pretty`
- `csv-parser`

### Project structure

```
src/
  server.ts                 # Creates HTTP server and dispatches routes
  logger.ts                 # pino logger (pretty output)
  middlewares/json.ts       # JSON body parser
  routes/
    routes.ts               # Aggregates user and task routes
    user-routes.ts          # /users (GET, POST)
    task-routes.ts          # /tasks (GET, POST CSV import)
    types/Route.ts          # Route typing (imported)
  shared/
    build-route-path.ts     # Builds regex from route path (path params + query)
    extract-query-params.ts # Parses ?key=value pairs
    create-multipart-filter.ts # Filters multipart body to CSV part
  database/
    database.ts             # JSON-file backed DB with select/insert
    index.ts                # Database instance with typed tables
  entitties/
    User.ts
    Task.ts
```

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm ci
```

### Development

- Start in watch mode (runs TypeScript directly with `tsx`):

```bash
npm start
```

The server listens on `http://localhost:3333`.

### Build (ESM)

```bash
npm run build
# outputs dist/server.mjs and types
```

### Run built artifact

```bash
node dist/server.mjs
```

### API

Base URL: `http://localhost:3333`

- Users
  - GET `/users`
    - Query: `?search=<text>` filters by name or email (case-insensitive contains)
    - Example:

```bash
curl -s http://localhost:3333/users
curl -s "http://localhost:3333/users?search=yan"
```

- POST `/users`
  - Body: `{ "name": string, "email": string }`

```bash
curl -s -X POST http://localhost:3333/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alice","email":"alice@example.com"}'
```

- Tasks
  - GET `/tasks`

```bash
curl -s http://localhost:3333/tasks
```

- POST `/tasks` (CSV import via multipart/form-data)
  - Expects a CSV file with columns: `title,description,userId,dueDate` (optional: `description`, `dueDate`)
  - Example CSV `tasks.csv`:

```csv
title,description,userId,dueDate
Task 1,First task,927984a8-812a-4a80-a035-0af6bb6810fa,2025-12-31
Task 2,Second Task,927984a8-812a-4a80-a035-0af6bb6810fa,456
```

    - Example upload:

```bash
curl -s -X POST http://localhost:3333/tasks \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./tasks.csv'
```

    - Response: `{ "message": "<count> tasks created" }` or error payload.

### Persistence

- Data is read from and written to `src/db.json` (auto-created if missing).
- The DB class loads on first use and persists after inserts.

### Logging

- Uses `pino` with `pino-pretty` transport for human-readable logs.

### Docker

Multi-stage build is provided in `Dockerfile`.

Build and run:

```bash
docker build -t nodejs-basics:prod /home/codeyan/development/nodejs-basics
docker run --rm -it -p 3333:3333 nodejs-basics:prod
```

- Builder stage: installs dev deps and runs `npm run build` (tsup to ESM).
- Runtime stage: installs production deps only and executes `node dist/server.mjs`.

For development with live code from the host, you can still use the dev `npm start` locally. If you prefer containerized dev, mount the source and run the dev command in a custom dev Dockerfile or `docker run` override.

### Scripts

- `npm start`: Dev server with `tsx watch src/server.ts`
- `npm run build`: ESM build with `tsup` (outputs `dist/server.mjs` + d.ts)

### Notes

- Project is ESM-first (`"type": "module"`).
- Ports: server runs on 3333.
- Error handling around CSV import returns 400 with an error message when parsing or boundary detection fails.

### License

MIT © Yan Rodrigues
