# Frontend Structure & Conventions

How the React (Vite + TypeScript + MUI) frontend is organized. Chosen from 2025 best
practice (feature-based structure, hybrid type organization, co-located tests). Applies to
every new frontend slice.

## Folder layout (feature-based)

```
frontend/src/
├── features/            # one folder per business feature (grows from Feature 2 on)
│   ├── employees/       #   directory, detail, form, salary-adjust
│   │   ├── <Component>/ #     <Component>.tsx, <Component>.test.tsx, index.ts, types.ts?
│   │   ├── api.ts       #     feature-specific API calls (optional)
│   │   └── types.ts     #     feature-local types (optional)
│   ├── analytics/       #   dashboard
│   └── auth/            #   login
├── components/          # shared, reusable UI, one folder per component
│   └── <Component>/     #   <Component>.tsx, <Component>.test.tsx, index.ts
├── api/                 # cross-feature API client (fetch wrappers)
├── types/               # SHARED domain/API types (models.ts, api.ts, index.ts barrel)
├── hooks/               # shared hooks
├── App.tsx / App.test.tsx
└── main.tsx             # entry point (ThemeProvider, CssBaseline)
```

## Rules

**Tests — co-located.** `<Component>.test.tsx` sits next to `<Component>.tsx`, never in a
separate `__tests__/` tree. The test travels with its component.

**Types — hybrid:**
- **Shared / domain / API types** (e.g. `Employee`, `HealthResponse`, analytics shapes,
  used across features) → central **`src/types/`**, split by concern (`models.ts`, `api.ts`)
  with an `index.ts` barrel. Import via `../types`.
- **Component-specific types** (a component's `Props`, local UI state) → **co-located** in
  the component's folder as `types.ts`. Don't push these into the central folder.

**Component folder** = one folder per component with a public `index.ts` barrel
(`export { default } from './<Component>'`) so imports stay clean (`components/BackendStatus`).

**Feature folder** owns its components, tests, feature-local types, and (optionally) its own
`api.ts`. Anything genuinely shared graduates to the root `components/`, `api/`, or `types/`.

## Current state (Feature 0)

```
src/
├── api/client.ts                         # fetchHealth()
├── components/BackendStatus/             # shared status chip (+ test, index)
├── types/{api.ts,index.ts}               # HealthResponse (shared API type)
├── App.tsx / App.test.tsx
└── main.tsx
```

`features/` and `hooks/` are introduced when the first feature that needs them lands
(Feature 2 — employees), to avoid empty placeholder folders.
