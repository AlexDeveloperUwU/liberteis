# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

LiberTeis is an event/booking management app for the IES de Teis library. Backend is an Express 5 API
(ESM, Node 22) backed by MySQL via Kysely; frontend is a separate Vue 3 SPA in `client/` (Vite, Pinia,
Tailwind 4, vue-i18n). The two are developed and built independently but deployed as one server: Express
serves the built client from `views/` and mounts the API under `/api`.

## Commands

Run from the repo root unless noted.

- `npm run dev` — runs client (Vite, port 3001) and server (`nodemon index.js`) concurrently. Primary way to develop.
- `npm start` — server only, via nodemon.
- `npm run prod` — server only, plain `node index.js`.
- `npm test` — runs Jest (`node --experimental-vm-modules ... jest --detectOpenHandles`); required for ESM support. Run a single test with `npm test -- <path-or-name-pattern>`.
- `npm run format` — Prettier write (config lives in `package.json`: `bracketSameLine: true`, `printWidth: 120`).
- `node check.js` — validates that Vue components' i18n keys exist in all three locale files (`en`, `es`, `gl`) and reports unused/missing keys.

Client (`client/`):

- `npm run dev` — Vite dev server on port 3001.
- `npm run build` — production build.
- `npm run lint` — ESLint with `--fix`.

Infra: `docker-compose.yml` defines a MySQL 9.3 service plus `dev`/`prod` profiles for the app (`docker compose --profile dev up`). `init.sh` bootstraps `./data/{secrets,uploads,init,logs}` directories and secrets on first run.

## Architecture

**Backend layering** (all ESM, `type: "module"`):

- `index.js` — app bootstrap: helmet hardening, MySQL-backed express-session, static file serving of the built client from `views/`, mounts `/api` router, catch-all SPA fallback.
- `routes/api.js` — top-level API router; runs `userMiddleware` (loads `req._reqUser` from `req.session.userId`) before dispatching to per-resource routers in `routes/api/*.js` (bookings, categories, config, events, spaces, users, auth, utils).
- `db/*.js` — one service module per resource (`bookingsService.js`, `eventsService.js`, etc.) containing the actual business logic and Kysely queries. Route handlers are thin: validate input, call a service function, return `{code, ...}` as JSON.
- `db/dbController.js` — Kysely/mysql2 pool setup, generic CRUD helpers (`dbGetOne`, `dbGetAll`, `dbGetWhere`, `dbSaveData`, `dbUpdateData`, `dbUpdateWhere`, `dbSwitchDeletionStatus`, etc.) used by the service modules instead of raw queries, plus `dbCreateTables()` which creates all tables idempotently and seeds default config + the admin user on boot.
- `errors/errorManager.js` + `errors/errors.json` — central error catalog. Services/routes call `ErrorManager.returnError(key)` / `returnSuccess(...)` / `handleError(err)` to produce a consistent `{success, code, message, data}` response shape; never construct ad-hoc error responses.
- `utils/logger.js` — Pino loggers (`logger`, `httpLogger`, `testsLogger`), each writing to console + `data/logs/*.log` (pretty and JSON variants). Use `logger` from here rather than `console.log`.
- `utils/dataSecurity.js` — password hashing (PBKDF2) and AES-256-CBC encrypt/decrypt using the app secret key from `utils/secretKey.js`.
- Soft deletes: most tables have a `deleted` boolean flag toggled via `dbSwitchDeletionStatus`/`dbSetDeleteStatus` rather than row deletion.
- Runtime data lives under `data/` (`secrets/` — `dbcreds.env`, `adminaccount.key`, `secret.key`; `uploads/`; `logs/`; `init/`) and is gitignored/bind-mounted, not part of the app source.

**Frontend** (`client/src/`):

- `stores/` — Pinia stores (`authStore`, `configStore`, `mainStore`, `modalStore`, `toastStore`) hold session/user, app config, and UI state.
- `router/fetchers.js` — API call wrappers (axios) used by views/stores instead of calling axios directly.
- `utils/permissions.js` — role hierarchy (`normalUser` < `managerUser` < `adminUser`) and `hasPermission(userType, requiredType)`; mirror this hierarchy when adding backend authorization checks.
- `views/` — routed pages grouped by area (`Auth`, `Dash`, `Info`, `Others`).
- `locales/{en,es,gl}/{pages,components}/...json` — i18n message trees, loaded and namespaced by `i18n.js` via `import.meta.glob`. Keep new locale files in sync across all three languages (`node check.js` from repo root verifies this) — gl (Galician) is the default UI language.

**Cross-cutting conventions**:

- API responses are always `{success, code, message, data}` (see `errorManager.js`); route handlers follow the pattern `try { ...call service...; return res.status(result.code).json(result) } catch (error) { return res.status(errorResponse.code).json(ErrorManager.handleError(error)) }`.
- Auth is session-based (`express-session` + `express-mysql-session`), not JWT-based, despite `jsonwebtoken` being a dependency — check current usage before assuming JWT flows.
- Booking `groupId` links recurring bookings created together; update/toggle endpoints take a `scope` query param (`single` vs `group`) to act on one booking or the whole series.
