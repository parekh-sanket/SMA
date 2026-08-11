# Project Context — Salary Management System

This file captures the confirmed context and decisions for the project. It is the single
source of truth for *what* we are building and *why*. Basic project summary lives in the
root `CLAUDE.md`.

Originating brief: `Salary Management Assessment- Candidates.docx`.

## Goal

Give an **HR Manager** at ACME org a web app to manage salary data for **~10,000 employees
across multiple countries**, replacing spreadsheets, and to **answer questions about how the
org pays people** (total payroll, average, median, distribution, breakdowns).

## Persona

Single **HR Manager**. Trusted internal user. Needs to browse, find, and adjust salaries,
and to see org-wide compensation insights quickly.

## Confirmed decisions

### Stack

| Layer        | Choice                          |
| ------------ | ------------------------------- |
| Backend      | Node.js + TypeScript + Express  |
| Data access  | better-sqlite3 (raw SQL)        |
| Database     | SQLite                          |
| Frontend     | ReactJS (Vite SPA)              |
| UI library   | MUI (Material UI)               |
| Testing      | Jest (backend + frontend)       |
| Deployment   | Deploy-ready / containerized; host to be chosen later (free tier) |

### Product scope (MVP)

1. **Employee directory** — paginated list of 10k employees with search (name/email),
   filter (department, country), and sort (name, salary). Must stay fast at 10k rows.
2. **Employee detail** — view one employee's full record.
3. **Create / Edit / Delete** — full CRUD on employee records.
4. **Salary adjustment** — a dedicated action to change an employee's salary (core write).
5. **Analytics dashboard** — "how the org pays people":
   - Org summary: headcount, total annual payroll, average & median salary.
   - Breakdown by **department** and by **country** (count, total, average).
   - Top-N earners.
   - Salary distribution (histogram / percentile bands).
6. **Auth** — simple login for a single admin user.
7. **Seed script** — deterministically generates 10,000 realistic employees.

## Domain model — Employee

| Field             | Notes                                                      |
| ----------------- | ---------------------------------------------------------- |
| `id`              | primary key                                                |
| `name`            |                                                            |
| `email`           | unique                                                     |
| `department`      |                                                            |
| `country`         | employee's country (multiple countries in the org)         |
| `title`           | job title                                                  |
| `hire_date`       | ISO date                                                   |
| `employment_type` | full-time / part-time / contractor                         |
| `status`          | active / terminated                                        |
| `manager_id`      | optional, flat reference to another employee (no org chart)|
| `salary`          | **annual**, stored as integer **minor units (USD cents)**  |

## Money & currency

- **Single reporting currency: USD.** No multi-currency FX conversion.
- Salaries are **annual, gross**.
- Money is stored as **integer minor units** (cents) to avoid floating-point drift.

## Data & testing

- **Seed:** 10,000 employees, **realistic + deterministic** (fixed RNG seed → identical
  dataset every run), plausible salary ranges per role/country.
- **Tests:** fast, deterministic, isolated. Core logic unit-tested with Jest.

## Conventions

- **English** everywhere: code, comments, docs, test names, commits.
- **Incremental commits** that show how the solution evolved (per the brief).

## Explicitly out of scope (for now)

- Multi-currency / live FX rates — single currency (USD) only.
- Payroll processing (payslips, tax, deductions, net pay).
- Salary history / effective-dated changes / audit trail.
- Bonuses, equity, benefits, multi-component compensation.
- Org-chart visualization (we keep only a flat `manager_id` reference).
