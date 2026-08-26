# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
