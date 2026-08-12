# Salary Management System

Web app for an **HR Manager** to manage salary data for **~10,000 employees across multiple
countries** (replacing spreadsheets) and answer questions about **how the org pays people** —
total payroll, averages, medians, distribution, and breakdowns by department/country/role.

Built test-first (TDD). Money is stored as **integer minor units (USD cents)**; all salaries
are **annual, gross**, in a single reporting currency (**USD**).

---

## Features

- **Employee directory** — paginated list of 10k employees with search, department/country
  filters, and sortable columns; fast at scale (server-side pagination + indexed SQL).
- **Employee CRUD** — create, view, edit, delete.
- **Salary adjustment** — dedicated action to change an employee's salary.
- **Compensation dashboard** — KPI cards, salary-distribution histogram, top paying countries,
  average salary by department, top earners, and a **Country & Role Insights** filter
  (min/max/avg + matched headcount).
- **Auth** — simple single-admin login (JWT), all data routes gated.
- **Seed** — deterministic-ish generator (`@faker-js/faker`) for 10,000 employees.

---

## Tech stack

| Layer        | Choice                                                  |
| ------------ | ------------------------------------------------------- |
| Backend      | Node.js + TypeScript + Express                          |
| Data access  | better-sqlite3 (raw SQL, **synchronous**)               |
| Database     | SQLite (single file)                                    |
| Validation   | Zod                                                     |
| Auth         | JWT (`jsonwebtoken`)                                    |
| Frontend     | React + Vite + TypeScript                               |
| UI           | MUI (Material UI) + Recharts                            |
| Routing      | react-router-dom                                        |
| Testing      | Jest (backend: supertest + in-memory SQLite; frontend: React Testing Library) |

---

## Repository structure

```
backend/                 # layered: routes -> controllers -> services
  src/
    routes/              # Express routers (endpoints)
    controllers/         # request/response handlers
    services/            # business logic + repository (SQL) + types + seeder
    validation/          # Zod schemas
    domain/              # pure functions (money, analytics)
    db/                  # connection + schema/migrate
    middleware/          # requireAuth
    app.ts / server.ts   # app factory / bootstrap
  test/                  # all tests, mirroring src (domain / services / routes)
frontend/                # feature-based
  src/
    features/            # employees, analytics, auth (components + api + tests)
    components/          # shared UI
    types/               # shared domain types
    App.tsx / main.tsx
docs/                    # requirements, context, build plan, structure, ADRs
```

Full details: `docs/backend-structure.md`, `docs/frontend-structure.md`, `docs/context.md`.

---

## Prerequisites

- **Node.js 20+** (developed on Node 22) and npm.
- No external database needed — SQLite is a local file created on first run.

---

## Quick start (local)

Open two terminals.

**1) Backend** (`backend/`)
```bash
cd backend
npm install
npm run seed          # generates salary.db with 10,000 employees (~200ms)
npm run dev           # API on http://localhost:4000
```

**2) Frontend** (`frontend/`)
```bash
cd frontend
npm install
npm run dev           # SPA on http://localhost:5173 (proxies /api -> :4000)
```

Then open **http://localhost:5173** and log in.

### Default login
```
username: admin
password: admin
```
(Configurable via env — see below. In production the server refuses to start with these
defaults.)

---

## Commands

### Backend (`backend/`)
| Command                 | What it does                                                   |
| ----------------------- | ------------------------------------------------------------- |
| `npm install`           | Install dependencies                                          |
| `npm run seed`          | Wipe + generate employees into the DB (`SEED_COUNT`, default 10000) |
| `npm run dev`           | Start the API with live reload (ts-node-dev)                  |
| `npm run build`         | Compile TypeScript to `dist/`                                 |
| `npm start`             | Run the compiled server (`dist/server.js`)                    |
| `npm test`              | Run the Jest test suite                                       |
| `npm run test:coverage` | Tests with coverage                                           |

### Frontend (`frontend/`)
| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm install`       | Install dependencies                  |
| `npm run dev`       | Vite dev server (with `/api` proxy)   |
| `npm run build`     | Type-check + production build to `dist/` |
| `npm run preview`   | Serve the production build locally    |
| `npm test`          | Run the Jest + RTL test suite         |

---

## Environment variables (backend)

| Variable         | Default               | Purpose                                                        |
| ---------------- | --------------------- | -------------------------------------------------------------- |
| `PORT`           | `4000`                | API port                                                       |
| `DB_PATH`        | `salary.db`           | SQLite file path                                               |
| `SEED_COUNT`     | `10000`               | Rows generated by the seeder / startup reseed                 |
| `ADMIN_USERNAME` | `admin`               | Admin login username                                           |
| `ADMIN_PASSWORD` | `admin`               | Admin login password (**must be changed in production**)      |
| `JWT_SECRET`     | `dev-secret-change-me`| JWT signing secret (**must be changed in production**)        |
| `NODE_ENV`       | —                     | `production` enables startup reseed + enforces real secrets   |
| `SEED_ON_START`  | —                     | `true` forces reseed on boot; `false` opts out in production  |

---

## Testing

```bash
cd backend  && npm test     # domain (pure), services (in-memory SQLite), API (supertest)
cd frontend && npm test     # components + flows (React Testing Library)
```
Tests are fast, deterministic, and isolated (a fresh in-memory SQLite DB per API test).

---

## Deployment (Render)

Deployed on **Render**. The backend is a Node web service; the frontend is a static build.

**Backend service**
- Build: `npm install && npm run build`
- Start: `npm start`
- Env vars: set `NODE_ENV=production`, `ADMIN_PASSWORD`, `JWT_SECRET` (required), optionally
  `SEED_COUNT`.
- On production startup the server **wipes and reseeds** the employees table before it listens,
  so the deployed app always comes up populated.

**Frontend**
- Build: `npm run build`; serve `frontend/dist`.
- The SPA calls the API via the relative path `/api/...`, so either serve the frontend from the
  **same origin** as the API, or add a **proxy/rewrite** rule on the static host that forwards
  `/api/*` to the backend service.

---

## Notes & design decisions

- **SQLite is a local file, on purpose (for now).** We use `better-sqlite3` (synchronous) for a
  zero-setup, fast, deterministic store — ideal for a single-HR internal tool and for fast,
  isolated tests. There is **no external/managed database**.
  - On Render's free tier the filesystem is **ephemeral** — the SQLite file is reset on each
    restart. That's fine here because the server **reseeds on startup in production**, so it's
    always populated. If you need data to **persist** across restarts, attach a Render **disk**
    (persistent volume) and set `SEED_ON_START=false`, or swap SQLite for Postgres behind the
    same repository interface (data access is isolated in `services/employeeRepository.ts`).
- **Money as integer minor units (cents).** Avoids floating-point drift; all math is on integers,
  formatting to `$` happens only at the edges.
- **Single currency (USD).** No multi-currency FX; keeps totals/averages directly comparable.
- **Auth is intentionally simple** (single admin, JWT). It's the plumbing, not the core problem;
  the app enforces it on all data routes but the credential store is a single env-configured
  admin. **Production requires real `ADMIN_PASSWORD` and `JWT_SECRET`** — the server refuses to
  boot with the dev defaults.
- **Seeded data is randomized** (`@faker-js/faker`) with realistic per-role salary bands scaled by
  a per-country cost multiplier, so the analytics charts look meaningful. Each seed run produces a
  fresh dataset.
- **Layered backend, feature-based frontend** — an intentional per-side choice; see the structure
  docs.

---

## Artifacts

- `docs/REQUIREMENTS.md` — one-page requirements (goal, scope, out-of-scope).
- `docs/context.md` — decisions & domain language.
- `docs/build-plan.md` — feature-by-feature TDD roadmap.
- `docs/backend-structure.md`, `docs/frontend-structure.md` — conventions.
- `.claude/skills/tdd/SKILL.md` — the TDD workflow this repo was built with.
- `Salary Management Assessment- Candidates.docx` — the originating brief.
