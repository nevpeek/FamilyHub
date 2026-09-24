# FamilyHub Agent Notes

## Commands

- Use Node `^20.19.0 || >=22.12.0` (required by Vite 8) and install from the npm lockfile with `npm ci`.
- `npm run dev` serves on `0.0.0.0:5173` with `strictPort`; it will fail rather than choose another port.
- Run all lint checks with `npm run lint`; lint one file or subtree with `npm run lint -- src/path/to/file.jsx`.
- `npm run build` is the production check and writes ignored `dist/`. The current single bundle triggers Vite's chunk-size warning but still builds successfully.
- There is no test, typecheck, formatter, or codegen script. Use focused lint while iterating, then full lint and build for final verification.

## Runtime Shape

- This repo is the React 19/Vite frontend only. The API is external: `VITE_API_BASE_URL`, or the browser's hostname on port `3001` by default. Vite has no API proxy.
- `src/main.jsx` must call `installFamilyHubFetchAuth()` before rendering. It wraps `window.fetch` and adds `X-FamilyHub-Key` from `VITE_FAMILYHUB_API_KEY` only to the configured API origin's `/api/` requests.
- There is no client router. `src/App.jsx` owns `activePage` and conditionally mounts page components; URLs do not deep-link to pages. The lone query-string flow is `?google=connected`, which opens Settings and is then removed.
- `src/App.jsx` is the shared-state and modal coordinator. Mutations commonly refresh other views by incrementing the relevant `*RefreshKey`; preserve that propagation when adding mutation paths.
- Domain data lives behind the REST API. `localStorage` is for device/UI preferences such as theme, accent, wall mode, schedules, daily brief markers, and Home layout, not the primary family data store.
- `src/utils/startAutoRefresh.js` polls every five seconds and also refreshes on online, focus, and visibility events. Loaders using it guard against overlapping requests and clean up with cancellation/`AbortController`; retain those safeguards.

## Styling

- Styling is global and cascade-order dependent. Effective order is `index.css`, `App.css`, page `*-polish.css` files, `responsive-polish.css`, `wall-mode.css`, `tablet-polish.css`, `cameras.css`, `home-responsive.css`, `theme.css`, then `calendar-skylight.css`.
- Do not reorder or casually move these imports into components. `App.css` is the legacy/base layer; later files intentionally override it for pages, responsive/wall/tablet modes, themes, and the calendar.
- Theme selectors live on `html[data-theme]`, shared theme tokens use `--fh-*`, and the selected accent is exposed as `--familyhub-accent`.

## Repository Boundaries

- Do not edit `dist/` or `node_modules/`; they are generated/vendor content.
- `.food-image-fix/` is tracked historical scratch material with copied sources, scripts, results, and image previews, not runtime code. `FOOD-IMAGE-EDITS.md` also documents a one-off change spanning a separate `FamilyHub-API` checkout; do not treat either as current frontend implementation.
- `.env` is ignored local configuration and may contain secrets. Do not inspect, overwrite, or commit it.
