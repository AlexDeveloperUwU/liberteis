# Plan

## 1. Changelog entry — `CHANGELOG.md` (version 2.3.0, dated 2026-08-29)

Add a `## [2.3.0] - 2026-08-29` section above `## [2.2.1]` in the existing Keep a Changelog style, plus the `[2.3.0]` release-tag link reference at the bottom of that section (matching the `[2.2.0]` pattern). It will cover:

- **Added**: accessibility `aria-label`s on the navbar sidebar toggle and the three calendar toolbar buttons in HomeView, with new `toggleSidebar` / `previousMonth` / `nextMonth` / `toggleView` translations (en/es/gl); `robots.txt`; `llms.txt`; `<meta name="description">` in `index.html`.
- **Changed**: "Enable weekends" moved to be the last setting in the admin settings form and preview card; removed the unused `izitoast` dependency; replaced logo asset.
- **Fixed**: user theme not persisting (see fix below) — including restoring self-service profile updates for non-admin users, a regression introduced by the 2.2.0 authorization change.

Also bump `"version"` in the root `package.json` to `2.3.0` (matching the release pattern). No commits will be made.

## 2. Move "Enable weekends" to last setting — `client/src/views/Dash/SettingsView.vue`

Template-only reorder, no logic changes:

- **Edit form**: move the `enableWeekends` toggle block (lines 136–162) below the favicon block (lines 164–193). Adjust the spacing classes so the sequence reads appName (`mb-4`), domain (`mb-4`), favicon (`mb-4`), weekends last.
- **Live preview card**: move the weekends row (lines 40–52) below the favicon row (lines 54–71) to keep preview and form in the same order.

## 3. Fix theme persistence bug — backend + route

Root cause: v2.2.0's `updateUser` field whitelist (`db/userService.js:59` = `["name","email","type","lang"]`) silently drops `theme`, so it never reaches the DB; the preferences selector then reloads the stale DB value and shows the old theme.

Per your choice, fix both layers:

- `db/userService.js`: add `"theme"` to `allowedFields` (the `users` table already has a `theme` column, default `"light"`).
- `routes/api/usersApi.js` (`PUT /api/users`, line 52): relax `requireAdmin` → `requireAuth`, then:
  - If the authenticated user is updating **themselves** (matching `req._reqUser` id): allow it, but strip privileged fields (`type`, and admin-only fields like `createdBy`) from the body before the existing update logic.
  - If updating **someone else**: require `adminUser`, otherwise 403 (existing behavior).
  - Keep the existing protections intact: the "Administrador/System" name/type deletion guard, password handling path, and `type` validation in `updateUser`.

This restores the pre-2.2.0 behavior where the NavBar theme toggle and the user preferences form (name, email, language, theme, password) work for every user, without reopening the privilege-escalation hole the security release closed.

## Verification

- Reorder: `npm run build` (or dev server) in `client/` to confirm the template compiles; visually confirm order is appName → domain → favicon → enable weekends in both columns.
- Theme fix: start the backend, `PUT /api/users?id=<self>` with `{ "theme": "light" }` as a non-admin session → 200 and DB row updated; attempt updating another user's id as non-admin → 403; confirm `type` cannot be self-escalated.
