# Salary Management System

Web-based salary management software for an **HR Manager** persona, to manage salary data
for **~10,000 employees across multiple countries** (replacing Excel) and answer questions
about how the org pays people.

Originating brief: `Salary Management Assessment- Candidates.docx`.
Full project context & decisions: `docs/context.md`.
Feature-wise build roadmap: `docs/build-plan.md`.

## Stack

| Layer        | Choice                              |
| ------------ | ----------------------------------- |
| Backend      | Node.js + TypeScript + Express      |
| Data access  | better-sqlite3 (raw SQL)            |
| Database     | SQLite                              |
| Frontend     | ReactJS (Vite SPA)                  |
| UI library   | MUI (Material UI)                   |
| Testing      | Jest                                |

## Scope (MVP)

- Employee directory (paginated list, search, filter, sort)
- Employee detail view
- Create / Edit / Delete employees
- Salary adjustment action
- Analytics dashboard (summary, breakdowns, top earners, distribution)
- Simple auth (single admin)
- Seed script: 10,000 deterministic employees

## How we build — TDD (mandatory)

This repo is built **test-first**. **Any** time you add a feature, fix a bug, or refactor,
follow the project TDD skill: **`.claude/skills/tdd/SKILL.md`**.

- Work in **Red-Green-Refactor vertical slices**: write one failing test → minimal code to
  pass → refactor on green → commit. One thin behavior end-to-end at a time.
- Do **not** write implementation code before a failing test exists for it.
- Backend tests with **Jest** (+ supertest / in-memory SQLite); frontend with **Jest +
  React Testing Library**.

Read `.claude/skills/tdd/SKILL.md` before starting any build work.

## Conventions

- Language: **English** everywhere (code, comments, docs, commits).
- Money stored as **integer minor units** (USD cents); salaries are **annual**.
- Tests are fast, deterministic, and isolated.
- Incremental git commits that show the evolution of the solution.
