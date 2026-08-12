# Salary Management System — Requirements (one page)

## Goal
Give an **HR Manager** at ACME a web app to manage salary data for **~10,000 employees across
multiple countries**, replacing spreadsheets, and to **answer questions about how the org pays
people** (total payroll, average, median, distribution, breakdowns by department/country/role).

## Persona
A single, trusted **HR Manager**. Needs to browse/find/adjust salaries quickly and see org-wide
compensation insights.

## In scope (MVP)
1. **Employee directory** — paginated list of 10k with search (name/email), filters
   (department, country), and sort (name, salary); stays fast at 10k rows.
2. **Employee detail** — view a single employee's full record.
3. **Create / Edit / Delete** — full CRUD.
4. **Salary adjustment** — a dedicated action to change an employee's salary.
5. **Compensation analytics** — org summary (headcount, total payroll, average, **median**),
   breakdowns by **department** and **country**, **top-N earners**, salary **distribution**, and a
   **Country & Role Insights** filter (min/max/avg + matched headcount).
6. **Auth** — simple single-admin login gating all data routes.
7. **Seed** — generates 10,000 employees.

## Explicitly out of scope (and why)
- **Multi-currency / live FX** — single reporting currency (USD) keeps totals comparable; FX is a
  separate concern. Swappable later.
- **User management / roles** — one trusted persona; auth is orthogonal plumbing. A single
  env-configured admin is enough to demonstrate the core problem.
- **Payroll processing** (payslips, tax, deductions, net pay) — a large separate domain; the brief
  is about managing salary *data* and answering questions.
- **Salary history / effective-dated changes / audit trail** — valuable but a stretch; MVP stores
  the current salary only. Clear extension point.
- **Bonuses / equity / benefits** — kept to a single base salary for a clear core model.

## Non-functional
- **Scale:** 10k rows → server-side pagination + indexed SQL; aggregates in SQL, final math (median,
  distribution) as pure functions. Interactions feel instant.
- **Correctness:** money stored as **integer minor units** (USD cents); currency decimals handled
  explicitly; rounding is float-safe.
- **Tests:** fast, deterministic, isolated — pure domain unit-tested directly; API via HTTP
  (supertest + in-memory SQLite); React via Testing Library.
- **Security (MVP-level):** JWT-gated data routes; production refuses to boot with default secrets.

## Architecture (summary)
`React SPA (Vite)` → `Express + TypeScript REST API` → `SQLite (better-sqlite3)`.
Backend is **layered**: routes → controllers → services (business logic + SQL repository), with
pure `domain/` (money, analytics), `validation/` (Zod), and `db/`. Frontend is **feature-based**.

## Key trade-offs
- **better-sqlite3 (synchronous)** — simpler code, fast/deterministic tests; sync I/O blocks under
  high concurrency, acceptable for a single-HR internal tool.
- **SQLite file over a managed DB** — zero setup; data access is isolated behind a repository so a
  swap to Postgres is a one-interface change.
- **Integer minor units for money** — correctness over convenience.
