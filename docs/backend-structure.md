# Backend Structure & Conventions

How the Node.js (Express + TypeScript + better-sqlite3) backend is organized. Chosen to
**mirror the frontend**: feature-based, co-located tests, hybrid type organization. Applies
to every new backend slice. Aligns with the outside-in TDD approach (test each feature
through its router) — see `.claude/skills/tdd/SKILL.md`.

## Folder layout (feature-based)

```
backend/src/
├── features/                # one folder per feature (self-contained vertical slice)
│   ├── health/
│   │   ├── healthRouter.ts
│   │   └── healthRouter.test.ts        # co-located (supertest via buildApp)
│   ├── employees/                      # Feature 2+
│   │   ├── employeeRouter.ts           #   HTTP layer (thin: validate + shape response)
│   │   ├── employeeService.ts          #   business logic / orchestration
│   │   ├── employeeRepository.ts        #   SQL data access
│   │   ├── employeeSchemas.ts          #   Zod validation
│   │   ├── types.ts                    #   feature-local types (DTOs, row shapes)
│   │   └── *.test.ts                    #   co-located tests
│   └── analytics/                      # Feature 6+
├── domain/                  # pure business math, no I/O — unit-tested directly
│   ├── money.ts / money.test.ts        #   minor-units helpers
│   └── analytics.ts / analytics.test.ts#   average, median, percentile, groupBy
├── db/
│   ├── connection.ts        # openDb(path) → better-sqlite3 handle
│   └── schema.ts            # CREATE TABLE + indexes (migrate)
├── config/                  # currency metadata, env config
├── common/                  # cross-cutting: middleware/, utils/, types/ (shared types)
├── app.ts                   # buildApp(db) — wires feature routers under /api
└── server.ts                # bootstrap (listen on a port); excluded from coverage
```

## Rules (same spirit as the frontend)

**Tests — co-located.** `X.test.ts` sits next to `X.ts` inside the feature/domain folder,
never a separate `tests/` or `__tests__/` tree. Jest `roots` is `src/` only; test files are
excluded from the `tsc` build and from coverage collection.

**Types — hybrid:**
- **Feature-local types** (an employee DTO, a repository row shape) → co-located `types.ts`
  in the feature folder.
- **Shared / cross-cutting types** (pagination envelope, common API response shape) →
  central **`src/common/types/`**.
- **Domain types** live with their pure module in `domain/`.

**Thin HTTP layer.** Routers/controllers only validate input (Zod) and shape the HTTP
response. Business logic goes in services; SQL goes in repositories; pure math goes in
`domain/`. Keep business logic out of routers.

**Testability.** `buildApp(db)` factory injects a fresh in-memory SQLite DB per test so API
(component) tests are isolated and parallel-safe. Pure `domain/` functions need no DB.

## Current state (Feature 0)

```
backend/src/
├── features/health/{healthRouter.ts, healthRouter.test.ts}
├── app.ts        # buildApp() mounts healthRouter under /api
└── server.ts     # bootstrap
```

`domain/`, `db/`, `config/`, `common/`, and the `employees`/`analytics` features are
introduced when the slice that needs them lands (Feature 1 onward), to avoid empty
placeholder folders.
