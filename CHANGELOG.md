# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.7.0] - 2026-09-08

### Added

- `app-window` and `globe` icons added to the shared registry.

### Changed

- `HomeView.vue` and `SettingsView.vue` rebuilt on the new design system components
  (`PageHeader`/`MetricCard`/`DsCard`/`IconButton`/`InfoRow`/`TextField`/`DsToggle`/`DsButton`),
  completing the pass over all 13 Dash views.
- `LoginView.vue`, `ForgotPasswordView.vue`, and `ResetPasswordView.vue` rebuilt on
  `DsCard`/`TextField`/`DsButton`/`DsPill`, completing the pass over all 3 Auth views.
- `Info/ScreenView.vue`: converted ~40 Tailwind v4 arbitrary CSS-var classes
  (`bg-(--background-200)`) to the equivalent mapped theme classes (`bg-background-200`) for
  consistency with the rest of the app.

### Fixed

- `DsPagination` had hardcoded English text ("Page X of Y") and no ARIA labels on its prev/next
  buttons, silently dropping i18n support introduced by the design-system component library.
  Verified with `node check.js`: 0 missing i18n keys across en/es/gl both before and after.

### Removed

- `views/Others/Template.vue`, a dead scaffold referencing an undefined `FullCalendar` component
  with zero references anywhere in the codebase.

## [2.6.4] - 2026-09-08

### Added

- `upload-cloud`, `map`, `palette`, `undo-2`, and `timer` icons added to the shared registry.

### Changed

- `SpacesFormView.vue`, `CategoriesFormView.vue`, `EventsFormView.vue`, and `BookingFormView.vue`
  rebuilt on `PageHeader`/`DsCard`/`InfoRow`/`TextField`/`SelectMenu`/`DsButton`/`DsModal`,
  completing the pass over all 6 Dash form views. The multi-select category-spaces picker and the
  recurrence day/time pickers in `BookingFormView` kept their existing Headless UI / native-input
  logic (no design-system primitive covers multi-select or date/time inputs yet) but were restyled
  onto the new tokens.

## [2.6.3] - 2026-09-08

### Added

- `DsButton` gained a `state` prop (`default`/`processing`/`success`/`error`) covering the
  4-state submit-button pattern shared by every Dash form view, plus several icons to the shared
  registry (`loader-2`, `shield-check`, `shield-alert`, `info`, `save`, `palette`, `undo-2`).

### Changed

- `UserFormView.vue` and `UserConfigView.vue` rebuilt on `PageHeader`/`DsCard`/`InfoRow`/
  `TextField`/`SelectMenu`/`DsButton`, replacing their hand-rolled preview panels, Headless UI
  `Listbox` usage, and inline validation-icon markup.

## [2.6.2] - 2026-09-08

### Changed

- `CategoriesTableView.vue`, `SpacesTableView.vue`, and `EventsTableView.vue` rebuilt on the new
  design system components (`PageHeader`/`MetricCard`/`DsCard`/`FilterBar`/`DataTable`/`DsPill`/
  `DsPagination`), completing the pass over all five Dash table views started in 2.6.1.

## [2.6.1] - 2026-09-08

### Changed

- `SideBar.vue`, `Toasts.vue`, `Modals.vue` ported onto the new design system components
  (`resolveIcon`, `DsToast`, `DsModal`/`InfoRow`). `Modals.vue`'s inline SVG icons and duplicated
  `bookingDetails` layout replaced with `InfoRow`; toast auto-dismiss timing moved from
  `toastStore` into the UI so the exit animation plays before removal.
- `UserTableView.vue` and `BookingsTableView.vue` rebuilt on `PageHeader`/`MetricCard`/`DsCard`/
  `FilterBar`/`DataTable`/`DsPill`/`DsPagination`, removing the per-view hand-rolled table,
  sort-icon render function, and pagination markup.

## [2.6.0] - 2026-09-08

### Added

- New admin design system tokens: `warning` color ramp, semantic alias layer (`--surface-*`,
  `--border-*`, `--text-heading/title/body/label/muted`), radii/shadow/motion CSS variables, and
  K2D/Lexend/Google Sans Code font loading.
- New shared Vue component library under `client/src/components/{core,forms,navigation,data,feedback}/`:
  `DsButton`, `IconButton`, `DsCard`, `MetricCard`, `DsPill`, `StatusDot`, `DsSkeleton`,
  `EntityIcon`, `MorphIcon`, `TextField`, `SelectMenu`, `DsToggle`, `SearchField`, `DropdownMenu`,
  `DsPagination`, `DataTable`, `FilterBar`, `InfoRow`, `PageHeader`, `EmptyState`, `DsModal`,
  `DsToast`, plus a shared `icons.js` Lucide icon registry.

### Changed

- `NavBar.vue`'s locale and user dropdown menus now use the new `DropdownMenu` component.

## [2.5.1] - 2026-09-06

### Fixed

- Saving the SMTP password from the admin Settings page threw a `TypeError` and never saved: a
  Pinia setup-store gotcha (`configStore.configs` is already unwrapped when accessed from outside
  the store, so `.configs.value` was reaching for `.value` on the unwrapped object).
- The Settings page's "Current settings" preview panel was missing the SMTP username and secure
  connection fields.

### Changed

- Clarified the "Secure connection (TLS)" hint text: it's only for port 465 (implicit TLS) and
  should stay off for port 587, where STARTTLS is negotiated automatically.
- Dropped the SMTP password and from-address cards from the "Current settings" preview (password
  is write-only and shouldn't be summarized there; from-address was redundant with the edit form).

[2.5.1]: https://github.com/AlexDeveloperUwU/liberteis/releases/tag/v2.5.1

## [2.5.0] - 2026-09-04

### Added

- Self-service password reset: a "Forgot your password?" link on the login page leads to
  `/auth/forgotPassword`, which emails a single-use, one-hour reset link (via the mailer added in
  2.4.0) to `/auth/resetPassword/:token`. A successful reset invalidates every other active session
  on the account and requires logging in again.
- "Log out other sessions" option (on by default) when changing a password from the profile page or
  the admin user form, using the same session-invalidation mechanism as the reset flow.

[2.5.0]: https://github.com/AlexDeveloperUwU/liberteis/releases/tag/v2.5.0

## [2.4.0] - 2026-09-04

### Added

- Transactional mailer infrastructure: a generic SMTP mailer (`nodemailer`) with a
  `{{token}}`-based templating engine and ready-to-use user-creation, password-reset,
  and account-change email templates in `en`/`es`/`gl`. Provider is swapped by editing
  the SMTP settings, no code changes needed. Not yet wired into any app flow.
- Mail settings (SMTP host:port, secure connection, username, password, from address)
  in the admin Settings page, alongside the existing app name/domain/favicon settings.
  The SMTP username and password are hidden from non-admins and never returned by the
  API once saved; the password is encrypted at rest.

[2.4.0]: https://github.com/AlexDeveloperUwU/liberteis/releases/tag/v2.4.0

## [2.3.0] - 2026-08-29

### Added

- Accessibility labels: `aria-label`s on the navbar sidebar-toggle button and the three calendar
  toolbar buttons (previous month, next month, toggle view), with the new
  `toggleSidebar` / `previousMonth` / `nextMonth` / `toggleView` translations in `en`/`es`/`gl`.
- `robots.txt` and an `llms.txt` describing the site for crawlers and LLMs.
- `<meta name="description">` in `index.html`.

### Changed

- "Enable weekends" is now the last setting in the admin settings form and its live preview card.
- Removed the unused `izitoast` dependency.
- Replaced the logo asset with a lighter version.

### Fixed

- The user theme is persisted again. The v2.2.0 `updateUser` field whitelist dropped `theme`, so
  theme changes were never saved to the database and the preferences selector kept showing the
  stale value. `theme` is now in the whitelist (the column already existed).
- Non-admin users can update their own profile again (name, email, language, theme, password),
  a capability unintentionally removed when `PUT /api/users` was made admin-only in v2.2.0.
  Users may still only edit themselves and cannot change their own role; updating other users
  still requires an admin.

[2.3.0]: https://github.com/AlexDeveloperUwU/liberteis/releases/tag/v2.3.0

## [2.2.1] - 2026-08-26

### Security

- Bumped `axios`, `brace-expansion`, `form-data`, `js-yaml`, `nanoid`, `postcss`, `sharp`, and
  `shell-quote` to patched versions, resolving 20 open Dependabot alerts (9 axios CVEs including
  prototype pollution and proxy/`maxBodyLength` bypasses, a `sharp`/libvips vulnerability chain,
  and DoS/path-traversal issues in the remaining packages).

## [2.2.0] - 2026-08-26

### Added

- Backend authorization middleware (`requireAuth`, `requireRole`) mirroring the frontend's
  `normalUser < managerUser < adminUser` hierarchy, plus a `forbidden` error and a
  `tooManyRequests` (429) error, translated in `en`/`es`/`gl`.
- Fixed-window rate limiting (10 attempts / 15 min per IP) on `POST /api/auth/login`.
- Content-Security-Policy header via `helmet.contentSecurityPolicy`.

### Changed

- **Users**: create/update/toggle now require an admin session; listing/count/`emailCheck`
  require manager or admin. `updateUser` whitelists editable fields (`name`, `email`, `type`,
  `lang`) instead of writing the raw request body, closing a role/privilege-escalation path.
- **Bookings/Events**: all write endpoints now require an authenticated session. A `normalUser`
  may only modify their own bookings/events; managers and admins may modify any. Ownership
  fields (`bookedBy`, `createdBy`) are set server-side and can no longer be spoofed via the
  request body. Fixed a bug where the ownership check read a non-existent `req._reqUser.role`
  field instead of `.type`, which had silently disabled it.
- **Categories/Spaces**: write endpoints now require a manager or admin session.
- Session is regenerated on login to prevent session fixation.
- Request body size capped at 1 MB.

### Fixed

- Logout now clears the correct session cookie name (`session_cookie`, previously
  `session_id`).
- `deleteEventImage` now refuses to delete files outside the uploads directory.
- Password comparison uses a constant-time check instead of `===`.
- `AES-256-CBC` (unauthenticated) replaced with `AES-256-GCM` in the unused `encryptData`/
  `decryptData` helpers.
- The generated session/encryption secret key file is now written with `0600` permissions.

[2.2.0]: https://github.com/AlexDeveloperUwU/liberteis/releases/tag/v2.2.0

## [2.1.0] - 2026-08-26

### Added

- **Admin settings view** (`/dash/settings`, admin-only) for editing app-wide configuration
  (`appName`, `domain`, `enableWeekends`) in the existing dashboard style, with a live preview
  card and dirty-check gated saving.
- **Customizable favicon**: a new `favicon` config key lets admins set the browser-tab icon by
  URL; it is applied at app boot and updates live when changed. Falls back to the bundled icon
  when empty.
- Sidebar entry and route for the settings view, gated to `adminUser`.
- New locale files (`pages/dash/settings.json`) for `en`, `es`, and `gl`.

### Changed

- Config write endpoints (`POST`/`PUT`/`DELETE /api/config`) now require an authenticated admin
  session via a new `requireAdmin` middleware; `GET /api/config` remains public. The middleware
  returns `401` when there is no session and `403` when the user is authenticated but not an admin.
- The frontend now logs out and redirects to login on a `401` response (via a global axios
  interceptor), so a stale/expired backend session no longer leaves the UI in a falsely
  logged-in state.

### Fixed

- Config create/update/delete no longer return the raw database result (which contained a
  `BigInt`), fixing a `500 "Do not know how to serialize a BigInt"` error on config writes.

[2.1.0]: https://github.com/AlexDeveloperUwU/liberteis/releases/tag/v2.1.0
