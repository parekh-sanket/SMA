# Backend Structure & Conventions

How the Node.js (Express + TypeScript + better-sqlite3) backend is organized: a **layered**
architecture (routes → controllers → services), with pure logic in `domain/` and a separate
top-level `test/` tree. Applies to every new backend change.

## Folder layout (layered)

```
backend/
├── src/
│   ├── app.ts               # buildApp(db) — wires route modules under /api
│   ├── server.ts            # bootstrap (open+migrate db, listen); excluded from coverage
│   ├── routes/              # Express routers: define endpoints, delegate to controllers
│   │   ├── healthRoutes.ts
│   │   ├── employeeRoutes.ts     # createEmployeeRouter(db): builds service+controller, wires paths
│   │   └── analyticsRoutes.ts
│   ├── controllers/         # request/response handlers (validate input, map to status codes)
│   │   ├── employeeController.ts # createEmployeeController(service) -> handler fns
│   │   └── analyticsController.ts
│   ├── services/            # business logic + data access (repository lives here, no separate layer)
│   │   ├── types.ts             # shared entity/DTO types (Employee, BreakdownGroup, …)
│   │   ├── employeeRepository.ts# SQL data access (prepared statements)
│   │   ├── employeeService.ts   # orchestration: dollars->minor, id/timestamps, mapping
│   │   └── analyticsService.ts  # uses domain + repo + money formatting
│   ├── validation/          # Zod schemas
│   │   └── employeeSchemas.ts
│   ├── domain/              # PURE functions, no I/O — unit-tested directly
│   │   ├── money.ts             # minor-units helpers
│   │   └── analytics.ts         # average, median, percentile, summarize, histogram
│   └── db/
│       ├── connection.ts    # openDb(path) → better-sqlite3
│       └── schema.ts        # migrate(db): CREATE TABLE + indexes
└── test/                    # ALL tests, mirroring src (NOT co-located)
    ├── domain/{money,analytics}.test.ts
    ├── services/employeeRepository.test.ts
    └── routes/{healthRoutes,employeeRoutes,analyticsRoutes}.test.ts
```

## Layer responsibilities

- **routes/** — declare the endpoints, wire dependencies (`createEmployeeRouter(db)` builds the
  repository → service → controller), and mount handlers. Route order matters
  (`/employees/facets` and `/employees` before `/employees/:id`).
- **controllers/** — thin req/res handlers: parse/validate (Zod), call the service, map results
  to HTTP status codes. No business logic.
- **services/** — business logic and orchestration; the **repository** (SQL data access) lives in
  this layer as its own module (there is no separate `repositories/` folder). Money conversion,
  id/timestamp assignment, and entity↔response mapping happen here.
- **domain/** — pure math (money, analytics) with no I/O; unit-tested in isolation.
- **db/**, **validation/** — supporting infrastructure (connection/schema, Zod schemas).

## Rules

**Tests — top-level `test/` tree**, mirroring `src/` (`test/domain`, `test/services`,
`test/routes`). Jest `roots` = `['<rootDir>/src', '<rootDir>/test']`; tests are excluded from
the `tsc` build via `tsconfig` `exclude: ["test"]` and from coverage collection.

**Testability.** `buildApp(db)` injects a fresh in-memory SQLite DB per test so API (route)
tests are isolated and parallel-safe. Pure `domain/` functions need no DB.

**Thin controllers, no logic in routes.** Business logic → services; SQL → the repository
module in services; pure math → `domain/`.

> Note: the backend uses a **layered** structure while the frontend is **feature-based**
> (`docs/frontend-structure.md`) — an intentional per-side choice.
