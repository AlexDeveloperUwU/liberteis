# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
