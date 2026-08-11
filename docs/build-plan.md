# Build Plan — Feature-Wise Roadmap

How we build the Salary Management System: **feature by feature**, each feature a **vertical
slice** delivered **test-first** (Red-Green-Refactor). Context & decisions live in
`context.md`; the TDD workflow in `.claude/skills/tdd/SKILL.md`.

## How to read this

- Features are ordered so each builds on a working, tested base.
- Each feature is a **vertical slice**: it cuts through whatever layers it needs
  (domain → repository → API → UI) rather than building one whole layer at a time.
- Inside a feature, each **step** is one Red-Green-Refactor cycle = **one commit**.
- Backend generally lands a step or two ahead of its UI *within the same feature*, because
  the API is the contract the UI consumes — but the feature isn't "done" until its UI works.
- Every step: write the failing test first → minimal code to pass → refactor on green → commit.

Legend: `[BE]` backend · `[FE]` frontend · `[DOM]` pure domain · each bullet ≈ one commit.

---

## Feature 0 — Walking skeleton

**Goal:** a running, testable backend + frontend wired together with one trivial end-to-end path.

- `[BE]` Project scaffold: TS + Express, Jest config, `buildApp(db)` factory, in-memory
  SQLite connection helper.
- `[BE]` `GET /api/health` returns `200 { status: "ok" }` (first supertest).
- `[FE]` Vite + React + TS + MUI scaffold; renders an app shell; a test asserts the shell renders.
- `[FE]` API client hits `/api/health`; a component shows backend status (mocked in test).

**Done when:** `npm test` is green on both sides; the app boots and shows "backend: ok".

---

## Feature 1 — Money & currency foundation

**Goal:** correct, drift-free money handling (USD, integer minor units, annual salary).

- `[DOM]` `money`: to/from minor units (cents), formatting for display, rounding rules.
- `[DOM]` Guards: reject negative/non-integer minor units.

**Done when:** money helpers are pure, fully unit-tested; no other layer touches raw floats.

*(No UI — pure domain. Reused by every feature below.)*

---

## Feature 2 — Employee record (create & view one)

**Goal:** create an employee and view a single employee end-to-end.

- `[BE]` `employees` table schema + indexes; `employeeRepository.create` / `getById` round-trip.
- `[BE]` `POST /api/employees` — Zod validation, unique email, `201` + created record;
  invalid → `400`, duplicate email → `409`.
- `[BE]` `GET /api/employees/:id` — `200` record / `404` when missing.
- `[FE]` Employee detail page renders one employee's full record (mocked API).
- `[FE]` "Add employee" form: fields, client validation, submit → create; success/error states.

**Done when:** HR can add an employee via the UI and open its detail page.

---

## Feature 3 — Employee directory (list, search, filter, sort, paginate)

**Goal:** browse 10k employees fast — the core daily screen.

- `[BE]` `GET /api/employees` — server-side pagination (`page`, `pageSize`), returns
  `{ data, page, pageSize, total }`.
- `[BE]` Search by `q` (name/email); filter by `department`, `country`; sort by `name`/`salary`
  (`order`) — all in indexed SQL.
- `[FE]` Directory table (MUI): paginated rows.
- `[FE]` Search box, department/country filters, sortable columns → trigger refetch (mocked API).

**Done when:** the directory stays responsive at 10k rows; search/filter/sort work through the API.

---

## Feature 4 — Salary adjustment (core HR write)

**Goal:** the headline write action — change an employee's salary safely.

- `[DOM]` Salary-change guards (non-negative, integer minor units).
- `[BE]` `PATCH /api/employees/:id/salary` — `200` updated / `400` invalid / `404` missing.
- `[FE]` Salary-adjust control on the detail page: enter new salary → confirm → API call → UI updates.

**Done when:** HR can adjust a salary from the UI and see it reflected immediately.

---

## Feature 5 — Edit & delete employee

**Goal:** complete CRUD.

- `[BE]` `PUT /api/employees/:id` — update editable fields (validation, `404`).
- `[BE]` `DELETE /api/employees/:id` — `204` / `404`.
- `[FE]` Edit form (reuses Feature 2 form) + delete action with confirm dialog.

**Done when:** HR can edit and remove employees end-to-end.

---

## Feature 6 — Compensation analytics ("how the org pays people")

**Goal:** answer org-wide pay questions on the dashboard.

- `[DOM]` `analytics`: `average`, `median` (odd/even/empty), `percentile`, `groupBy(dimension)
  → {count,total,average}`, `topEarners`, distribution buckets.
- `[BE]` `GET /api/analytics/summary` — headcount, total payroll, average, median.
- `[BE]` `GET /api/analytics/breakdown?dimension=department|country`.
- `[BE]` `GET /api/analytics/top-earners?limit=N`.
- `[BE]` `GET /api/analytics/distribution` — histogram / percentile bands.
- `[FE]` Dashboard: summary cards.
- `[FE]` Dashboard: breakdown table/chart by department & country.
- `[FE]` Dashboard: top-N earners + salary distribution chart.

**Done when:** the dashboard renders real numbers from seeded data and they reconcile with the directory.

---

## Feature 7 — Authentication (simple, single admin)

**Goal:** gate the app behind a simple login.

- `[BE]` `POST /api/auth/login` — validate single admin credentials → signed token; bad creds → `401`.
- `[BE]` Auth middleware protects `/api/employees*` and `/api/analytics*` → `401` without token.
- `[FE]` Login page; store token; attach to API calls; redirect unauthenticated users.

**Done when:** unauthenticated requests are rejected; login unlocks the app.

---

## Feature 8 — Seed 10,000 employees

**Goal:** a realistic, reproducible dataset to demo and test against.

- `[BE]` Deterministic generator (fixed RNG seed): 10k employees across departments/countries,
  employment types, plausible salary ranges per role/country, some `manager_id` links.
- `[BE]` Loads fast via a single transaction; a test asserts count + determinism on a small N.

**Done when:** `npm run seed` produces an identical 10k dataset every run in a few seconds.

---

## Feature 9 — Wiring, deployment & artifacts

**Goal:** production-ready and reviewable.

- `[BE]` CORS, centralized error-handling middleware, env config, `server.ts` bootstrap.
- Root `README.md`: run / test / seed / deploy instructions.
- One-page **requirements doc** (from `context.md`), architecture diagram, trade-off notes,
  AI-prompt artifacts.
- Deploy config (containerized) for a free host; record the video demo.

**Done when:** a fresh clone can install, seed, test, run, and deploy; artifacts explain the thinking.

---

## Commit sequence (evolution the reviewer will see)

`Feature 0 skeleton` → `money` → `employee create/view` → `directory list/search/sort` →
`salary adjust` → `edit/delete` → `analytics` → `auth` → `seed 10k` → `wiring/deploy/docs`.

One focused commit per step, in English, describing the behavior added. Never commit on red.

## Definition of done (whole project)

- All features above green under `npm test` (backend Jest + frontend Jest/RTL); core logic ≥ 80% covered.
- `npm run seed` → 10k deterministic rows; app browses/searches/adjusts/analyzes them correctly.
- Deployed build + video demo; artifacts committed; `git log` reads as an incremental story.
