---
name: tdd
description: The mandatory build workflow for this repo. Use this ANY time you write a new feature, fix a bug, or refactor. Enforces Red-Green-Refactor in thin vertical slices — one failing test, minimal code to pass, refactor on green, then commit. Applies to backend (Jest) and frontend (Jest + React Testing Library).
---

# TDD — Red-Green-Refactor in Vertical Slices

This is **the** way features get built in this repo. Do not write implementation code
before a failing test exists for it. No exceptions for "small" changes.

## The core loop (per slice)

1. **RED** — Write ONE small failing test that describes the next thin behavior.
   Run it. Confirm it fails **for the right reason** (assertion/behavior, not a typo or
   missing import). A test that errors instead of failing is not a valid red.
2. **GREEN** — Write the **minimum** code to make that test pass. Nothing more. No
   speculative abstractions, no unused params, no "while I'm here". Run the test. Confirm green.
3. **REFACTOR** — With the test green, clean up names, remove duplication, tidy structure.
   Re-run tests after every change; they must stay green. Do not add new behavior here.
4. **COMMIT** — One commit per completed slice (see Commit discipline). Then start the next
   slice at RED.

Never batch multiple behaviors into one red. Small steps are the point — they keep the diff
reviewable and the failure diagnosable.

## Vertical slices, not horizontal layers

Build **one thin behavior end-to-end** before moving on — not "all repositories, then all
services, then all routes". A slice is the smallest change that delivers or proves one piece
of observable behavior.

Prefer working **inside-out within a slice**: the pure domain logic first (fast unit test),
then the persistence/API around it, then the UI — but only as much of each as the current
slice needs. Each slice is independently red → green → refactor → commit.

Example — "adjust an employee's salary" is one slice, built as sub-steps:
- domain: `applyRaise(current, amount)` guards (non-negative, minor units) — unit test
- repository: `updateSalary(id, minorUnits)` round-trip — integration test on `:memory:` DB
- route: `PATCH /api/employees/:id/salary` → 200 / 400 / 404 — supertest
- UI: salary-adjust control calls the API and re-renders — React Testing Library

Each sub-step is its own R-G-R cycle; the slice is done when the behavior works through the
whole stack.

## Test seams in this repo

| Layer                     | What to test                                  | Tool                          |
| ------------------------- | --------------------------------------------- | ----------------------------- |
| Domain (pure functions)   | money/minor-units, analytics (avg/median/…)   | Jest — call the function      |
| Repository (SQL)          | CRUD + filtered/paginated queries round-trip  | Jest against in-memory SQLite |
| API (routes + services)   | HTTP status, validation, shape of response    | Jest + supertest on `buildApp(db)` |
| Frontend (components)     | renders, user interaction, calls the API      | Jest + React Testing Library  |

Make the app testable: a `buildApp(db)` factory so each API test injects a fresh
`:memory:` SQLite DB → isolated and parallel-safe. Keep business math (money, aggregation)
as **pure functions** with no I/O so they unit-test without a DB.

## Rules that keep tests good

- **Fast** — a full run is seconds. In-memory SQLite, no network, no sleeps.
- **Deterministic** — fixed seeds/inputs. No `Date.now()`/`Math.random()` leaking into
  assertions; inject clocks/RNG. Same input → same result, every run.
- **Isolated** — no shared mutable state between tests; fresh DB per test/suite.
- **Readable** — the test name states the behavior; Arrange-Act-Assert; one reason to fail.
- **Behavior, not implementation** — assert observable outcomes, not private internals, so
  refactors don't break tests.

## Commit discipline

- One commit per completed slice/sub-step (green + refactored), so `git log` reads as the
  story of how the solution evolved.
- Message: imperative, present tense, in **English**, describing the behavior added
  (e.g. `feat: normalize salary to USD minor units`, `test: median over even-sized set`).
- Never commit on red. Never commit commented-out code or `.only`/`.skip` left in tests.

## Definition of done for a slice

- [ ] A test existed and failed before the code did (red first).
- [ ] Minimal code makes it green.
- [ ] Refactored; all tests still green.
- [ ] No `.only`/`.skip`, no dead code, no console noise.
- [ ] Committed as one focused commit.

## Anti-patterns — do not

- Write implementation first and backfill tests to match it.
- Assert against a giant snapshot when a targeted assertion says the same thing.
- Mock the thing under test, or mock so heavily the test proves nothing.
- Add abstraction "for later" that no current test drives.
- Bundle unrelated changes into one slice/commit.
