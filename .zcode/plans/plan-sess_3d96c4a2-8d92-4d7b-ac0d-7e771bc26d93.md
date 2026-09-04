# Diagnosis — it's systemic, not just HomeView

One `/dash/home` load fires ~4N+7 requests (N = bookings in the 3-month window), mostly sequential. The same anti-patterns exist elsewhere:

| Location                                                                                         | Problem                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HomeView.vue:694-707` `loadBookings`                                                            | N+1: per booking, sequential `/api/events?id=`, `/api/spaces?id=`, `/api/users?id=`, `/api/categories?id=`; no dedup. Doubled by month-nav watcher + explicit call (445/450/455 vs 829-834); `/api/bookings/count` twice; full refetch after every toggle |
| `ScreenView.vue:213-274` + `fetchers.js loadScreenData:717-770`                                  | Identical N+1 **copied twice** — prefetcher runs it, then view runs it again on cache miss, and every 5-min interval                                                                                                                                      |
| `BookingsTableView.vue`, `EventsTableView.vue`, `CategoriesTableView.vue`, `SpacesTableView.vue` | Per-row/per-creator `?id=` lookups (sequential in category/space loops); toggle refetches whole list + count instead of updating local state                                                                                                              |
| `BookingFormView.vue:787,869`                                                                    | `/api/spaces` fetched on mount, then refetched on every event selection change                                                                                                                                                                            |
| `authStore.verifyUserExists`                                                                     | `/api/users?id=` on **every navigation** (router.beforeEach, `router/index.js:216`)                                                                                                                                                                       |
| `configStore`                                                                                    | `/api/config/` twice per load (`App.vue:100` + `HomeView.vue:819`); 4 full reloads after saving 4 settings; `isLoaded` flag exists but guard is left to each consumer                                                                                     |
| Backend `bookingsService.js`                                                                     | `getBookings` runs the DB query **twice** per request (line 390, again at 429-430); `getBookingsCount` = 3 full-table SELECTs counted in JS                                                                                                               |
| `i18n.js:5`                                                                                      | All 69 locale files × 3 languages eager-bundled; `main.css` loads twice in dev                                                                                                                                                                            |

# Fix plan — reusing what already exists

**Reusable primitives found (no new mechanisms needed):** `dbGetWhere` passes the operator verbatim to Kysely, so `{operator: "in", value: [ids]}` already works — multi-ID fetch in one query, zero dbController changes. Existing single-table services, existing GET-route pattern in `bookingsApi.js`, existing `cacheSystem` in `fetchers.js`, existing prefetcher plumbing, and `UserTableView.getCreatedByName` (resolves names from a local list — the pattern to copy into the other tables).

## 1. Backend — one joined endpoint, fixed queries

- New service `getBookingsJoined(filters)` in `bookingsService.js`: reuse `getBookings`' condition-building (fixed to query **once**), collect unique event/space/user/category IDs, fetch each set with one `dbGetWhere(..., "in", ids)` (4 queries, constant regardless of N), assemble enriched bookings in JS (house style — no SQL joins anywhere), return `ErrorManager` envelope.
- New route `GET /api/bookings/dashboard?startMonth=..&endMonth=..` in `bookingsApi.js` following the existing GET pattern, incl. the normalUser scoping `GET /` already applies; response includes the metrics (reusing fixed `getBookingsCount`) so the page needs **one** data request.
- Fix `getBookings` double execution; fix `getBookingsCount` to one query + derive counts.

## 2. HomeView + ScreenView (the two N+1 copies)

- `fetchers.js`: `loadDashboardHomeData` → new dashboard endpoint; `loadScreenData` → same endpoint with date filters, keep its `cacheSystem` TTL.
- Both views consume `initialData` (already plumbed); delete the per-booking axios loops. HomeView: watcher is the single owner of month navigation (remove explicit calls at 445/450/455); `reloadDashboardData` becomes one refresh call; after a booking toggle, update local state / refetch the joined endpoint once instead of ~7+4N requests. ScreenView's 5-min interval reuses the cached prefetch data.
- The shared event-mapping logic (booking → calendar event) moves to one helper used by both fetchers/views instead of existing twice.

## 3. Table views + forms — stop per-row fetching

- EventsTable, CategoriesTable, BookingsTable, SpacesTable: prefetchers already fetch the full lists (`/api/categories`, `/api/spaces`, `/api/events`) — resolve names locally like `UserTableView` does; for the users the prefetchers don't fetch, one `/api/users` request per page load replaces N `?id=` calls.
- Toggles update local state instead of refetching list + count.
- `BookingFormView`: reuse the mounted `/api/spaces` response and filter client-side in `loadSpacesForCategory`.

## 4. Stores — guard at the source

- `configStore.loadAllConfigs`: internal `isLoaded` early-return + `force` param; `updateConfig` patches local state instead of refetching everything per key.
- `authStore.verifyUserExists`: cache per session (re-verify on 401 handling); `updateUserProfile` uses the PUT response instead of a refetch.
- `mainStore.fetchVersion`: fetch once, guard in store.

## 5. Bundle

- `i18n.js`: lazy per-locale loading (active + fallback `gl` on boot, fetch-and-merge on switch). Remove duplicate `main.css` `<link>` from `index.html`.

## 6. Verification

- Connect via CDP to your Chrome at `172.27.240.1:9222` (MCP `--browser-url`, else a small CDP script) and profile `/dash/home` before/after: request count + load time.
- Regressions: 1 bookings request on month nav; toggles don't refetch the world; en/es/gl switching works; Settings save still applies; auth guard still blocks logged-out users; `/info/screen` still refreshes every 5 min.
